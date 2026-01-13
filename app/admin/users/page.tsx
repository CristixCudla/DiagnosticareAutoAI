import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/app/actions/admin-actions"
import { getAllUsers } from "@/app/actions/admin-crud-actions"
import Link from "next/link"
import { UserManagementTable } from "@/components/admin/user-management-table"

export default async function UsersIndexPage() {
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const { users, error } = await getAllUsers()

  if (error || !users) {
    return <div className="p-8 text-white">Eroare la încărcarea utilizatorilor</div>
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent">
              Gestionare Utilizatori
            </h1>
            <p className="text-gray-400">Index - Vizualizare toți utilizatorii</p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-900 border border-gray-800 text-white rounded-lg hover:border-red-500 transition-colors"
          >
            ← Înapoi la Admin
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Toți Utilizatorii ({users.length})</h2>
          <UserManagementTable users={users} />
        </div>
      </div>
    </div>
  )
}
