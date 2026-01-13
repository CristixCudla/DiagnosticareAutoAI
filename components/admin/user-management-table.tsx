"use client"

import Link from "next/link"
import { Eye, Trash2 } from "lucide-react"
import { deleteUser } from "@/app/actions/admin-crud-actions"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface User {
  id: string
  email: string
  full_name: string | null
  is_admin: boolean
  created_at: string
  subscriptions: Array<{
    tier: string
    is_active: boolean
    free_diagnostics_used: number
    free_diagnostics_limit: number
  }> | null
}

export const UserManagementTable = ({ users }: { users: User[] }) => {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (userId: string, email: string) => {
    if (
      !confirm(
        `Sigur vrei să ștergi logic utilizatorul ${email}?\n\nAcesta va fi marcat ca șters dar va rămâne în baza de date pentru istoric.`,
      )
    ) {
      return
    }

    setDeletingId(userId)
    const result = await deleteUser(userId)

    if (result.error) {
      alert(result.error)
    } else if (result.success && result.type === "soft") {
      alert("Utilizator șters logic cu succes!")
      router.refresh()
    }

    setDeletingId(null)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-800">
          <tr>
            <th className="text-left py-3 px-4 text-white font-semibold">Email</th>
            <th className="text-left py-3 px-4 text-white font-semibold">Nume</th>
            <th className="text-left py-3 px-4 text-white font-semibold">Tier</th>
            <th className="text-left py-3 px-4 text-white font-semibold">Status</th>
            <th className="text-left py-3 px-4 text-white font-semibold">Admin</th>
            <th className="text-left py-3 px-4 text-white font-semibold">Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const subscription = user.subscriptions?.[0]
            return (
              <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td className="py-4 px-4 font-medium text-white">{user.email}</td>
                <td className="py-4 px-4 text-gray-300">{user.full_name || "-"}</td>
                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      subscription?.tier === "premium"
                        ? "bg-red-500/20 text-red-400 border-red-500/50"
                        : "bg-gray-500/20 text-gray-400 border-gray-500/50"
                    }`}
                  >
                    {subscription?.tier || "free"}
                  </span>
                </td>
                <td className="py-4 px-4">
                  {subscription?.tier === "free" ? (
                    <span className="text-sm text-gray-400">
                      {subscription.free_diagnostics_used}/{subscription.free_diagnostics_limit}
                    </span>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        subscription?.is_active
                          ? "bg-green-500/20 text-green-400 border-green-500/50"
                          : "bg-red-500/20 text-red-400 border-red-500/50"
                      }`}
                    >
                      {subscription?.is_active ? "Activ" : "Inactiv"}
                    </span>
                  )}
                </td>
                <td className="py-4 px-4">
                  {user.is_admin ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-red-500/20 text-red-400 border-red-500/50">
                      Admin
                    </span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(user.id, user.email)}
                      disabled={deletingId === user.id}
                      title="Ștergere logică - utilizatorul va fi marcat ca șters"
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
