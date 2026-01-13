import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ArrowLeft, Crown, Calendar, CreditCard } from "lucide-react"
import CancelSubscriptionButton from "@/components/cancel-subscription-button"
import { formatDistanceToNow } from "date-fns"
import { ro } from "date-fns/locale"
import { AdminTierSwitcher } from "@/components/admin-tier-switcher"
import { checkIsAdmin } from "@/app/actions/admin-actions"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: subscription } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).single()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const isAdmin = await checkIsAdmin()

  const tierLabels = {
    free: "Free Trial",
    standard: "Standard",
    premium: "Premium",
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Înapoi la Dashboard
        </Link>

        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent">
              Setări Cont
            </h1>
            <p className="text-gray-400">Gestionați contul și abonamentul dvs.</p>
          </div>

          {isAdmin && <AdminTierSwitcher currentTier={subscription?.tier || "free"} />}

          {/* Profile Information */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Informații Profil</h2>
            <p className="text-gray-400 text-sm mb-4">Detaliile contului dvs.</p>
            <div className="space-y-4">
              <div className="grid gap-2">
                <div className="text-sm font-medium text-gray-300">Nume</div>
                <div className="text-sm text-gray-400">{profile?.full_name || "Nu este setat"}</div>
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium text-gray-300">Email</div>
                <div className="text-sm text-gray-400">{user.email}</div>
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium text-gray-300">Membru din</div>
                <div className="text-sm text-gray-400">
                  {formatDistanceToNow(new Date(profile?.created_at || new Date()), {
                    addSuffix: true,
                    locale: ro,
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Crown className="h-5 w-5 text-red-500" />
              Abonament
            </h2>
            <p className="text-gray-400 text-sm mb-6">Detaliile abonamentului dvs.</p>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg text-white">
                    {tierLabels[subscription?.tier as keyof typeof tierLabels]}
                  </div>
                  <div className="text-sm text-gray-400">
                    {subscription?.tier === "free"
                      ? `${subscription.free_diagnostics_used} / ${subscription.free_diagnostics_limit} diagnosticări folosite`
                      : "Diagnosticări nelimitate"}
                  </div>
                </div>
                {subscription?.tier !== "free" && (
                  <div className="text-right">
                    <div className="font-semibold text-red-500">
                      ${subscription?.tier === "standard" ? "9.99" : "19.99"}/lună
                    </div>
                    <div className="text-sm text-gray-400">{subscription?.is_active ? "Activ" : "Inactiv"}</div>
                  </div>
                )}
              </div>

              {subscription?.tier === "free" ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">Upgrade pentru diagnosticări nelimitate și funcții avansate</p>
                  <Link
                    href="/pricing"
                    className="block w-full text-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg transition-all"
                  >
                    Upgrade Acum
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {subscription?.subscription_start_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Activ din {new Date(subscription.subscription_start_date).toLocaleDateString("ro-RO")}
                      </span>
                    </div>
                  )}
                  {subscription?.stripe_subscription_id && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <CreditCard className="h-4 w-4" />
                      <span>Plată recurentă lunară</span>
                    </div>
                  )}
                  <div className="pt-2 space-y-2">
                    {subscription?.tier === "standard" && (
                      <Link
                        href="/pricing"
                        className="block w-full text-center px-4 py-2 bg-gray-800 border border-gray-700 hover:border-red-500 text-white rounded-lg transition-all"
                      >
                        Upgrade la Premium
                      </Link>
                    )}
                    <CancelSubscriptionButton />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Statistici Utilizare</h2>
            <p className="text-gray-400 text-sm mb-4">Activitatea dvs. pe platformă</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-red-500">
                  {subscription?.tier === "free" ? subscription.free_diagnostics_used : "∞"}
                </div>
                <div className="text-sm text-gray-400">Diagnosticări efectuate</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">
                  {tierLabels[subscription?.tier as keyof typeof tierLabels]}
                </div>
                <div className="text-sm text-gray-400">Plan curent</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
