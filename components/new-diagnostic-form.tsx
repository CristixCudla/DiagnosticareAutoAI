"use client"

import type React from "react"
import { useState } from "react"
import { Loader2, CheckCircle2, AlertCircle, Wrench, DollarSign, Calendar, Car, Crown } from "lucide-react"
import { doDiagnostic } from "@/app/actions/diag"

interface DiagnosticFormProps {
  subscriptionTier: string
}

export default function NewDiagnosticForm({ subscriptionTier = "free" }: DiagnosticFormProps) {
  const [modelCar, setModelCar] = useState("")
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [symptoms, setSymptoms] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const isPremium = subscriptionTier === "premium"
  const isStandard = subscriptionTier === "standard"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    console.log("[v0] Submitting diagnostic with tier:", subscriptionTier)

    const response = await doDiagnostic({
      model_car: modelCar,
      year: Number.parseInt(year),
      symptoms,
      subscription_tier: subscriptionTier,
    })

    if (!response.ok) {
      setError(response.error || "Eroare la generarea diagnosticului")
    } else {
      setResult(response.result)
    }

    setLoading(false)
  }

  const severityConfig = {
    low: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30", label: "Scăzută" },
    medium: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30", label: "Medie" },
    high: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30", label: "Ridicată" },
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-white rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Diagnostic Auto AI</h2>
              <p className="text-sm text-slate-400">Descrie simptomele mașinii tale</p>
            </div>
          </div>
          {isPremium && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-400">Premium</span>
            </div>
          )}
          {isStandard && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-red-400" />
              <span className="text-sm font-semibold text-red-400">Standard</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="model" className="block text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Car className="w-4 h-4" />
                Model Mașină
              </label>
              <input
                id="model"
                type="text"
                placeholder="Ex: BMW X5, Dacia Sandero..."
                value={modelCar}
                onChange={(e) => setModelCar(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-slate-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="year" className="block text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Anul Fabricației
              </label>
              <input
                id="year"
                type="number"
                min="1990"
                max={new Date().getFullYear()}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-slate-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="symptoms" className="block text-sm font-semibold text-slate-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Simptome Observate
            </label>
            <textarea
              id="symptoms"
              placeholder="Ex: Motorul nu se pornește, bateria e nouă, starter-ul zbieră când încerc să pornesc mașina..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              required
              rows={5}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none placeholder-slate-500 transition-all"
            />
          </div>

          {error && (
            <div className="flex gap-3 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !symptoms.trim() || !modelCar.trim()}
            className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-red-400 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-lg shadow-red-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Se generează diagnostic...
              </>
            ) : (
              <>
                <Wrench className="w-5 h-5" />
                Generează Diagnostic
              </>
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-start gap-4 pb-6 border-b border-slate-700">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">Diagnostic Generat cu Succes</h3>
              <div className="flex items-center gap-3 text-slate-400 mb-3">
                <span className="flex items-center gap-1">
                  <Car className="w-4 h-4" />
                  {result.model_car}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {result.year}
                </span>
              </div>
              {result.severity && (
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${severityConfig[result.severity]?.bg || severityConfig.medium.bg} ${severityConfig[result.severity]?.text || severityConfig.medium.text} ${severityConfig[result.severity]?.border || severityConfig.medium.border} border`}
                >
                  <AlertCircle className="w-4 h-4" />
                  Severitate: {severityConfig[result.severity]?.label || "Medie"}
                </div>
              )}
            </div>
          </div>

          {/* Diagnosis Section */}
          <div className="bg-gradient-to-br from-red-500/10 to-white/5 border border-red-500/20 rounded-xl p-6 space-y-3">
            <h4 className="font-bold text-lg text-red-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              Diagnostic AI
            </h4>
            <p className="text-slate-200 leading-relaxed">{result.ai_diagnosis}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-lg text-green-400 flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5" />
                  Cost Estimat
                  {isPremium && (
                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full border border-amber-500/30">
                      -20% Premium
                    </span>
                  )}
                </h4>
                <p className="text-3xl font-bold text-white">{result.estimated_cost}</p>
              </div>
              {isPremium && <Crown className="w-12 h-12 text-amber-400 opacity-20" />}
            </div>
          </div>

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="bg-slate-900/30 border border-slate-700/50 rounded-xl p-6 space-y-4">
              <h4 className="font-bold text-lg text-slate-200">Recomandări</h4>
              <ul className="space-y-3">
                {result.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-slate-300">
                    <span className="w-6 h-6 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Parts Affected */}
          {result.parts_affected && result.parts_affected.length > 0 && (
            <div className="bg-slate-900/30 border border-slate-700/50 rounded-xl p-6 space-y-4">
              <h4 className="font-bold text-lg text-slate-200">Piese Afectate</h4>
              <div className="flex flex-wrap gap-3">
                {result.parts_affected.map((part: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-sm font-medium"
                  >
                    {part}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setResult(null)
              setModelCar("")
              setYear(new Date().getFullYear().toString())
              setSymptoms("")
            }}
            className="w-full px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl transition-all text-sm font-medium border border-slate-600"
          >
            Generează Nou Diagnostic
          </button>
        </div>
      )}
    </div>
  )
}
