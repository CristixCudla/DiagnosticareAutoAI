import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/app/actions/admin-actions"
import { getAdminStats } from "@/app/actions/admin-crud-actions"
import { Users, FileText, TrendingUp, CreditCard } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboard() {
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const { stats, error } = await getAdminStats()

  if (error || !stats) {
    return <div className="p-8">Eroare la încărcarea statisticilor</div>
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent">
            Panou de Administrare
          </h1>
          <p className="text-gray-400">Gestionează utilizatori, abonamente și diagnosticări</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-400">Total Utilizatori</div>
              <Users className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-400">Total Diagnosticări</div>
              <FileText className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalDiagnostics}</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-400">Diagnosticări (7 zile)</div>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.recentDiagnostics}</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-400">Abonamente Active</div>
              <CreditCard className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.subscriptionStats.standard + stats.subscriptionStats.premium}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Distribuție Abonamente</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Free Trial</span>
              <span className="text-2xl font-bold text-white">{stats.subscriptionStats.free}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Standard</span>
              <span className="text-2xl font-bold text-white">{stats.subscriptionStats.standard}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Premium</span>
              <span className="text-2xl font-bold text-red-500">{stats.subscriptionStats.premium}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Link
            href="/admin/users"
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg p-6 flex flex-col items-center gap-3 transition-all"
          >
            <Users className="h-8 w-8" />
            <span className="font-semibold">Gestionează Utilizatori</span>
          </Link>

          <Link
            href="/admin/subscriptions"
            className="bg-gray-900 border-2 border-gray-800 hover:border-red-500 text-white rounded-lg p-6 flex flex-col items-center gap-3 transition-all"
          >
            <CreditCard className="h-8 w-8 text-red-500" />
            <span className="font-semibold">Gestionează Abonamente</span>
          </Link>

          <Link
            href="/admin/diagnostics"
            className="bg-gray-900 border-2 border-gray-800 hover:border-red-500 text-white rounded-lg p-6 flex flex-col items-center gap-3 transition-all"
          >
            <FileText className="h-8 w-8 text-red-500" />
            <span className="font-semibold">Vezi Diagnosticări</span>
          </Link>
        </div>

        <div className="mt-8">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
            ← Înapoi la Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
