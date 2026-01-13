"use client"

import type React from "react"
import { signIn } from "@/app/actions/auth-actions"
import Link from "next/link"
import { useState } from "react"
import { Wrench } from "lucide-react"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await signIn(formData)
      if (result?.error) {
        setError(result.error)
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "A apărut o eroare")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-950 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wrench className="h-8 w-8 text-red-500" />
            <span className="text-2xl font-bold text-white">AutoCare AI</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Bine ați revenit</h1>
          <p className="text-gray-400">Conectați-vă pentru a continua</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-xl">
          <form onSubmit={handleLogin}>
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="exemplu@email.com"
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Parolă
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-white hover:text-gray-300 transition-colors"
                  >
                    Am uitat parola
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                  <p className="text-sm text-red-400 mb-2">{error}</p>
                  {error.includes("incorectă") && (
                    <Link href="/auth/sign-up" className="text-sm text-white hover:text-gray-300 underline">
                      Creează un cont nou →
                    </Link>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-white text-gray-900 rounded-lg font-medium hover:from-red-700 hover:to-gray-100 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Se conectează..." : "Conectare"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Nu aveți cont?{" "}
              <Link href="/auth/sign-up" className="text-white hover:text-gray-300 font-medium transition-colors">
                Înregistrare
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
