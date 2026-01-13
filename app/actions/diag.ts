"use server"

import { createClient } from "@/lib/supabase/server"

const GROQ_API_KEY = process.env.API_KEY_GROQ_API_KEY

export async function doDiagnostic(data: {
  model_car: string
  year: number
  symptoms: string
  subscription_tier?: string
}) {
  try {
    console.log("[v0] Starting diagnostic with data:", data)

    if (!GROQ_API_KEY) {
      console.log("[v0] Missing Groq API key")
      return { error: "Configurare API lipsă", ok: false }
    }

    const sb = await createClient()
    const {
      data: { user },
    } = await sb.auth.getUser()

    if (!user) {
      console.log("[v0] User not authenticated")
      return { error: "Utilizator neautentificat", ok: false }
    }

    const tier = data.subscription_tier || "free"
    const isPremium = tier === "premium"
    const priceMultiplier = isPremium ? 0.8 : 1.0 // Premium gets 20% discount

    console.log("[v0] Using subscription tier:", tier, "multiplier:", priceMultiplier)

    const prompt = `Ești un diagnostic auto AI profesionist. Analizează următoarele simptome și furnizează un diagnostic detaliat în limba română.

Mașină: ${data.model_car} (${data.year})
Simptome: ${data.symptoms}

Răspunde DOAR cu JSON valid (fără markdown, fără text extra):
{
  "diagnosis": "diagnostic detaliat în română de 2-3 propoziții",
  "severity": "low sau medium sau high",
  "base_cost": număr între 200-2000,
  "recommendations": ["recomandare 1 în română", "recomandare 2 în română"],
  "parts_affected": ["piesă 1", "piesă 2"]
}`

    console.log("[v0] Calling Groq API...")

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] Groq API error:", errorText)
      return { error: "Eroare la API Groq", ok: false }
    }

    const result = await response.json()
    console.log("[v0] Groq API response:", result)

    const content = result.choices?.[0]?.message?.content || ""
    console.log("[v0] AI content:", content)

    let parsedDiagnosis
    try {
      const cleanContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
      parsedDiagnosis = JSON.parse(cleanContent)
      console.log("[v0] Parsed diagnosis:", parsedDiagnosis)
    } catch (parseError) {
      console.log("[v0] JSON parse error:", parseError)
      // Fallback diagnostic
      parsedDiagnosis = {
        diagnosis: "Analiza simptomelor tale sugerează o problemă care necesită atenție din partea unui mecanic.",
        severity: "medium",
        base_cost: 500,
        recommendations: ["Consultați un mecanic profesionist", "Verificați sistemele principale ale mașinii"],
        parts_affected: ["Sistem diagnoza necesar"],
      }
    }

    const baseCost = parsedDiagnosis.base_cost || 500
    const finalCost = Math.round(baseCost * priceMultiplier)
    const maxCost = Math.round((baseCost + 500) * priceMultiplier)

    let costString = `${finalCost}-${maxCost} RON`
    if (isPremium) {
      costString += " (Premium -20%)"
    }

    console.log("[v0] Final cost:", costString)

    const { data: insertData, error: insertError } = await sb
      .from("diagnostics")
      .insert({
        user_id: user.id,
        symptoms: data.symptoms,
        vehicle_model: data.model_car,
        vehicle_year: data.year,
        ai_diagnosis: parsedDiagnosis.diagnosis,
        severity: parsedDiagnosis.severity || "medium",
        estimated_cost: costString,
        ai_recommendations: JSON.stringify(parsedDiagnosis.recommendations || []),
      })
      .select()
      .single()

    if (insertError) {
      console.log("[v0] Database insert error:", insertError)
      return { error: "Eroare la salvare în baza de date", ok: false }
    }

    console.log("[v0] Diagnostic saved successfully:", insertData)

    return {
      ok: true,
      result: {
        id: insertData.id,
        model_car: data.model_car,
        year: data.year,
        ai_diagnosis: parsedDiagnosis.diagnosis,
        severity: parsedDiagnosis.severity || "medium",
        estimated_cost: costString,
        recommendations: parsedDiagnosis.recommendations || [],
        parts_affected: parsedDiagnosis.parts_affected || [],
        subscription_tier: tier,
      },
    }
  } catch (error) {
    console.log("[v0] Unexpected error in doDiagnostic:", error)
    return { error: "Eroare neașteptată", ok: false }
  }
}
