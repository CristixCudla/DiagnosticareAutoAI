"use client"

import { Eye, Trash2 } from "lucide-react"
import { deleteDiagnostic } from "@/app/actions/admin-crud-actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

interface Diagnostic {
  id: string
  user_id: string
  symptoms: string
  severity: string
  created_at: string
  profiles: {
    id: string
    full_name: string | null
    email: string
  } | null
}

export function DiagnosticsManagementTable({ diagnostics }: { diagnostics: Diagnostic[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (diagnosticId: string) => {
    if (
      !confirm(
        "Sigur vrei să ștergi fizic acest diagnostic?\n\nAcesta va fi eliminat permanent din baza de date (HARD DELETE).",
      )
    ) {
      return
    }

    setDeletingId(diagnosticId)
    const result = await deleteDiagnostic(diagnosticId)

    if (result.error) {
      alert(result.error)
    } else if (result.success && result.type === "hard") {
      alert("Diagnostic șters fizic cu succes!")
      router.refresh()
    }

    setDeletingId(null)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/50"
      case "medium":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50"
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-800">
          <tr>
            <th className="text-left py-3 px-4 text-white font-semibold">Utilizator</th>
            <th className="text-left py-3 px-4 text-white font-semibold">Simptome</th>
            <th className="text-left py-3 px-4 text-white font-semibold">Severitate</th>
            <th className="text-left py-3 px-4 text-white font-semibold">Data</th>
            <th className="text-left py-3 px-4 text-white font-semibold">Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {diagnostics.map((diagnostic) => (
            <tr key={diagnostic.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
              <td className="py-4 px-4">
                <div>
                  <p className="font-medium text-white">{diagnostic.profiles?.full_name || "-"}</p>
                  <p className="text-sm text-gray-400">{diagnostic.profiles?.email}</p>
                </div>
              </td>
              <td className="py-4 px-4 max-w-md truncate text-gray-300">{diagnostic.symptoms}</td>
              <td className="py-4 px-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(diagnostic.severity)}`}
                >
                  {diagnostic.severity}
                </span>
              </td>
              <td className="py-4 px-4 text-gray-300">{new Date(diagnostic.created_at).toLocaleDateString("ro-RO")}</td>
              <td className="py-4 px-4">
                <div className="flex gap-2">
                  <Link
                    href={`/admin/users/${diagnostic.user_id}`}
                    className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(diagnostic.id)}
                    disabled={deletingId === diagnostic.id}
                    title="Ștergere fizică - diagnosticul va fi eliminat permanent"
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
