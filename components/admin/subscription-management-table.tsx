"use client"

import Link from "next/link"

interface Subscription {
  user_id: string
  tier: string
  is_active: boolean
  free_diagnostics_used: number
  free_diagnostics_limit: number
  created_at: string
  profiles: {
    id: string
    full_name: string | null
    email: string
  } | null
}

export function SubscriptionManagementTable({ subscriptions }: { subscriptions: Subscription[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Utilizator</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Email</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Tier</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Utilizare</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-white">Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub) => (
            <tr key={sub.user_id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-white">{sub.profiles?.full_name || "-"}</td>
              <td className="px-4 py-3 text-sm text-gray-300">{sub.profiles?.email}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                    sub.tier === "premium" ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {sub.tier}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                    sub.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {sub.is_active ? "Activ" : "Inactiv"}
                </span>
              </td>
              <td className="px-4 py-3">
                {sub.tier === "free" ? (
                  <span className="text-sm text-gray-300">
                    {sub.free_diagnostics_used}/{sub.free_diagnostics_limit}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">Nelimitat</span>
                )}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/users/${sub.user_id}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-gray-800 hover:bg-red-600 rounded-lg transition-colors border border-gray-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Vezi Detalii
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
