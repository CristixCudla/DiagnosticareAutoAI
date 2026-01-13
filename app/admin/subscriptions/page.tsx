import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/app/actions/admin-actions"
import { getAllSubscriptions } from "@/app/actions/admin-crud-actions"
import Link from "next/link"
import { SubscriptionManagementTable } from "@/components/admin/subscription-management-table"

export default async function SubscriptionsPage() {
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const { subscriptions, error } = await getAllSubscriptions()

  if (error || !subscriptions) {
    return <div className="min-h-screen bg-gray-950 p-8 text-white">Eroare la încărcarea abonamentelor</div>
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent">
              Gestionare Abonamente
            </h1>
            <p className="text-gray-400">Vizualizare și editare abonamente utilizatori</p>
          </div>
          <Link
            href="/admin"
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
          >
            ← Înapoi la Admin
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Toate Abonamentele ({subscriptions.length})</h2>
          <SubscriptionManagementTable subscriptions={subscriptions} />
        </div>
      </div>
    </div>
  )
}
