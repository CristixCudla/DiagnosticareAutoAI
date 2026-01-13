import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CheckoutButton from "@/components/checkout-button"
import Link from "next/link"
import { ArrowLeft, Check, Crown, Star } from "lucide-react"

export default async function PricingPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: subscription } = await supabase.from("subscriptions").select("tier").eq("user_id", user.id).single()

  const currentTier = subscription?.tier || "standard"

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Înapoi la Dashboard
        </Link>

        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-white bg-clip-text text-transparent">
              Alegeți Planul Potrivit
            </h1>
            <p className="text-xl text-gray-400">Upgrade pentru diagnosticări nelimitate și funcții avansate</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Standard Plan */}
            <div
              className={`bg-gray-900 border rounded-xl p-8 transition-all ${
                currentTier === "standard" ? "border-red-500 shadow-lg shadow-red-500/20" : "border-gray-800"
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-6 w-6 text-red-500" />
                <h2 className="text-2xl font-bold text-white">Standard</h2>
              </div>
              <p className="text-gray-400 mb-6">Perfect pentru utilizatori regulați</p>
              <div className="mb-8">
                <span className="text-5xl font-bold text-white">49 RON</span>
                <span className="text-gray-400 ml-2">/lună</span>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  "Diagnosticări nelimitate",
                  "Rapoarte detaliate",
                  "Istoric ultimele 10 diagnosticări",
                  "Suport email",
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {currentTier === "standard" ? (
                <button
                  disabled
                  className="w-full py-3 bg-gray-800 text-gray-400 rounded-lg font-medium cursor-not-allowed"
                >
                  Plan Curent
                </button>
              ) : currentTier === "premium" ? (
                <button
                  disabled
                  className="w-full py-3 bg-gray-800 text-gray-400 rounded-lg font-medium cursor-not-allowed"
                >
                  Aveți Premium
                </button>
              ) : (
                <CheckoutButton productId="standard-monthly" />
              )}
            </div>

            {/* Premium Plan */}
            <div
              className={`bg-gray-900 border rounded-xl p-8 transition-all relative ${
                currentTier === "premium"
                  ? "border-white shadow-lg shadow-white/20"
                  : "border-red-500 shadow-lg shadow-red-500/20"
              }`}
            >
              <div className="absolute -top-4 right-8 bg-gradient-to-r from-red-600 to-white text-gray-900 px-4 py-1 rounded-full text-sm font-medium">
                Popular
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-6 w-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Premium</h2>
              </div>
              <p className="text-gray-400 mb-6">Pentru profesioniști și entuziaști</p>
              <div className="mb-8">
                <span className="text-5xl font-bold bg-gradient-to-r from-red-600 to-white bg-clip-text text-transparent">
                  99 RON
                </span>
                <span className="text-gray-400 ml-2">/lună</span>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  "Tot din Standard, plus:",
                  "Analiză tehnică avansată",
                  "Reducere 20% la reparații",
                  "Istoric nelimitat",
                  "Procesare prioritară",
                  "Export PDF",
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <Check className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {currentTier === "premium" ? (
                <button
                  disabled
                  className="w-full py-3 bg-gradient-to-r from-white to-gray-200 text-gray-900 rounded-lg font-medium cursor-not-allowed opacity-50"
                >
                  Plan Curent
                </button>
              ) : (
                <CheckoutButton productId="premium-monthly" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
