import Link from "next/link"
import { Zap, Shield, Clock, Check, Wrench, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header/Nav */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-red-400" />
            <span className="text-xl font-bold text-white">AutoCare AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
              Autentificare
            </Link>
            <Link
              href="/auth/sign-up"
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/20"
            >
              Începe Acum
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-400 via-white to-red-600 bg-clip-text text-transparent">
            Diagnosticare Auto AI
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Obțineți diagnostice auto instant cu inteligență artificială. Economisiți timp și bani cu analize precise
            ale problemelor mașinii dvs.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link
              href="/auth/sign-up"
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/20 text-lg"
            >
              Începeți Gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">De ce să alegeți serviciul nostru?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Zap,
              title: "Rapid și Precis",
              description: "Diagnostice instant bazate pe AI cu acuratețe ridicată",
              color: "text-yellow-400",
            },
            {
              icon: Shield,
              title: "Sigur și Confidențial",
              description: "Datele dvs. sunt protejate cu cele mai înalte standarde",
              color: "text-green-400",
            },
            {
              icon: Clock,
              title: "24/7 Disponibil",
              description: "Accesați diagnostice oricând, oriunde, fără programări",
              color: "text-red-400",
            },
            {
              icon: TrendingUp,
              title: "Recomandări Expert",
              description: "Primiți sugestii detaliate de reparații și costuri estimate",
              color: "text-white",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-red-500/50 transition-all"
            >
              <feature.icon className={`h-10 w-10 mb-4 ${feature.color}`} />
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4 text-white">Planuri de Abonament</h2>
        <p className="text-center text-gray-400 mb-12">Alegeți planul potrivit pentru nevoile dvs.</p>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              name: "Free",
              price: "0 RON",
              features: ["5 diagnostice / lună", "Rapoarte de bază", "Suport comunitate"],
              highlighted: false,
            },
            {
              name: "Standard",
              price: "49 RON",
              period: "/lună",
              features: ["50 diagnostice / lună", "Rapoarte detaliate", "Istoric complet", "Suport email"],
              highlighted: true,
            },
            {
              name: "Premium",
              price: "99 RON",
              period: "/lună",
              features: [
                "Diagnostice nelimitate",
                "Analiză avansată AI",
                "Reducere 20% piese",
                "Suport prioritar 24/7",
              ],
              highlighted: false,
            },
          ].map((plan, idx) => (
            <div
              key={idx}
              className={`bg-gray-900 border rounded-xl p-6 ${
                plan.highlighted
                  ? "border-red-500 shadow-lg shadow-red-500/20 scale-105"
                  : "border-gray-800 hover:border-gray-700"
              } transition-all`}
            >
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-red-400">{plan.price}</span>
                {plan.period && <span className="text-gray-400">{plan.period}</span>}
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-300">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/sign-up"
                className={`block w-full py-3 rounded-lg font-medium text-center transition-all ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/20"
                    : "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
                }`}
              >
                {plan.name === "Free" ? "Începeți Gratuit" : `Alegeți ${plan.name}`}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20 bg-gray-900/50">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-gray-500">
          <p>&copy; 2025 AutoCare AI. Toate drepturile rezervate.</p>
        </div>
      </footer>
    </div>
  )
}
