import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import NewDiagnosticForm from "@/components/new-diagnostic-form"
import { LogOut, Settings, Shield, Crown, Zap, CheckCircle } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  let isAdmin = false
  let subscription = null

  try {
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()
    isAdmin = profile?.is_admin || false

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single()

    subscription = sub
  } catch (err) {
    console.log("[v0] Dashboard: Error fetching data:", err)
  }

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  const tier = subscription?.tier || "free"
  const isPremium = tier === "premium"
  const isStandard = tier === "standard"
  const diagnosticsUsed = subscription?.free_diagnostics_used || 0
  const diagnosticsLimit = subscription?.free_diagnostics_limit || 3

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-white rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-white bg-clip-text text-transparent">
                AutoCare AI
              </h1>
              <p className="text-xs text-slate-400">Diagnostice auto inteligente</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <a
                href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-all hover:scale-105"
              >
                <Shield className="h-4 w-4" />
                Panou Admin
              </a>
            )}
            <a
              href="/settings"
              className="inline-flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-lg text-sm font-medium transition-colors text-slate-300"
            >
              <Settings className="h-4 w-4" />
              Setări
            </a>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-lg text-sm font-medium transition-colors text-slate-300"
              >
                <LogOut className="h-4 w-4" />
                Deconectare
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div
            className={`col-span-1 lg:col-span-1 rounded-xl p-6 border ${
              isPremium
                ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30"
                : isStandard
                  ? "bg-gradient-to-br from-red-500/20 to-white/10 border-red-500/30"
                  : "bg-slate-800/50 border-slate-700/50"
            } backdrop-blur-sm`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Plan Abonament</p>
                <h3
                  className={`text-2xl font-bold ${
                    isPremium ? "text-amber-400" : isStandard ? "text-red-400" : "text-slate-300"
                  }`}
                >
                  {isPremium ? "Premium" : isStandard ? "Standard" : "Gratuit"}
                </h3>
              </div>
              {isPremium && <Crown className="w-8 h-8 text-amber-400" />}
              {isStandard && <CheckCircle className="w-8 h-8 text-red-400" />}
            </div>

            <div className="space-y-3">
              {isPremium && (
                <>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Diagnostice nelimitate</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Reducere 20% la costuri</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Suport prioritar</span>
                  </div>
                </>
              )}
              {isStandard && (
                <>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-red-400" />
                    <span>Diagnostice nelimitate</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-red-400" />
                    <span>Preț complet</span>
                  </div>
                </>
              )}
              {!isPremium && !isStandard && (
                <>
                  <div className="text-sm text-slate-400">
                    {diagnosticsUsed} / {diagnosticsLimit} diagnostice folosite
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${(diagnosticsUsed / diagnosticsLimit) * 100}%` }}
                    />
                  </div>
                  <a
                    href="/pricing"
                    className="block text-center py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors mt-3"
                  >
                    Upgrade la Premium
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Diagnostice Totale</p>
                  <p className="text-3xl font-bold text-red-400">{diagnosticsUsed}</p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Economii {isPremium ? "Premium" : ""}</p>
                  <p className="text-3xl font-bold text-green-400">{isPremium ? "20%" : "0%"}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Crown className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <NewDiagnosticForm subscriptionTier={tier} />
      </div>
    </div>
  )
}
