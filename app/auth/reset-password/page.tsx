"use client"

import type React from "react"

import { resetPassword } from "@/app/actions/auth-actions"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("Parolele nu coincid")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Parola trebuie să aibă cel puțin 6 caractere")
      setIsLoading(false)
      return
    }

    try {
      const result = await resetPassword(password)
      if (result?.error) {
        setError(result.error)
      } else {
        alert("Parola a fost resetată cu succes!")
        router.push("/auth/login")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "A apărut o eroare")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent">
            Resetare parolă
          </h2>
          <p className="text-gray-400 mb-6">Introduceți noua parolă pentru contul dvs.</p>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm font-medium text-white">
                  Parolă nouă
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minim 6 caractere"
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-white">
                  Confirmă parola
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Reintroduceți parola"
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Se resetează..." : "Resetează parola"}
              </button>
            </div>
            <div className="mt-4 text-center text-sm text-gray-400">
              <Link href="/auth/login" className="text-red-500 hover:text-red-400 underline underline-offset-4">
                Înapoi la autentificare
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
