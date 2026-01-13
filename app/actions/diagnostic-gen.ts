"use server"

import { createClient } from "@/lib/supabase/server"

export async function runDiagnostic(input: any) {
  try {
    const sb = await createClient()
    const usr = await sb.auth.getUser()
    if (!usr.data.user) return { error: "No user" }

    const sub = await sb.from("subscriptions").select("*").eq("user_id", usr.data.user.id).single()
    if (!sub.data || !sub.data.is_active) return { error: "No subscription" }

    const groqKey = process.env.API_KEY_GROQ_API_KEY
    const body = JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: `Diagnose: ${input.symptoms}` }],
      max_tokens: 1000,
    })

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
      body,
    })

    if (!res.ok) return { error: "API error" }

    const data = await res.json()
    const txt = data.choices[0]?.message?.content || ""

    let diag = null
    try {
      diag = JSON.parse(txt)
    } catch {
      diag = { diagnosis: txt }
    }

    const saved = await sb
      .from("diagnostics")
      .insert({
        user_id: usr.data.user.id,
        symptoms: input.symptoms,
        ai_diagnosis: diag.diagnosis || txt,
        severity: diag.severity || "medium",
        estimated_cost: diag.cost || "",
      })
      .select()
      .single()

    return { success: true, diagnostic: saved.data }
  } catch (e) {
    return { error: "Error" }
  }
}
