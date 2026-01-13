import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/app/actions/admin-actions"
import { getAllUsers } from "@/app/actions/admin-crud-actions"
import Link from "next/link"
import { DiagnosticCreateForm } from "@/components/admin/diagnostic-create-form"

export default async function CreateDiagnosticPage() {
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const { users, error } = await getAllUsers()

  if (error || !users) {
    return <div className="min-h-screen bg-gray-950 p-8 text-white">Eroare la încărcarea utilizatorilor</div>
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent">
              Creare Diagnosticare Nouă
            </h1>
            <p className="text-gray-400">
              Adaugă o diagnosticare manuală pentru un utilizator (Lab 6 - Create cu Foreign Key)
            </p>
          </div>
          <Link
            href="/admin/diagnostics"
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
          >
            ← Înapoi
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6 text-white">Formular Diagnosticare</h2>
          <DiagnosticCreateForm users={users} />
        </div>
      </div>
    </div>
  )
}
