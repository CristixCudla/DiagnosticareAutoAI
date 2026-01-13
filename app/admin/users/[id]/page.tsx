import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/app/actions/admin-actions"
import { getUserDetails } from "@/app/actions/admin-crud-actions"
import Link from "next/link"
import { UserDetailsView } from "@/components/admin/user-details-view"
import { UserEditForm } from "@/components/admin/user-edit-form"

export default async function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const { user, error } = await getUserDetails(id)

  if (error || !user) {
    return <div className="min-h-screen bg-gray-950 p-8 text-white">Eroare la încărcarea detaliilor utilizatorului</div>
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent">
              Detalii Utilizator
            </h1>
            <p className="text-gray-400">Details & Edit - Vizualizare și editare utilizator</p>
          </div>
          <Link
            href="/admin/users"
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
          >
            ← Înapoi la Utilizatori
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <UserDetailsView user={user} />
          <UserEditForm user={user} />
        </div>
      </div>
    </div>
  )
}
