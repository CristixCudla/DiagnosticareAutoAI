"use client"

import type React from "react"

import { requestPasswordReset } from "@/app/actions/auth-actions"
import Link from "next/link"
import { useState } from "react"
import { CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string

    try {
      const result = await requestPasswordReset(email)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "A apărut o eroare")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gray-950">
        <div className="w-full max-w-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-6 w-6 text-red-500" />
              <h2 className="text-2xl font-bold text-white">Email trimis!</h2>
            </div>
            <p className="text-gray-400 mb-6">Verificați-vă inbox-ul pentru instrucțiuni de resetare a parolei</p>
            <Link
              href="/auth/login"
              className="block w-full px-6 py-3 bg-red-600 text-white text-center rounded-lg hover:bg-red-700 transition-colors"
            >
              Înapoi la autentificare
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent">
            Am uitat parola
          </h2>
          <p className="text-gray-400 mb-6">Introduceți adresa de email pentru a primi link-ul de resetare</p>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium text-white">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="exemplu@email.com"
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
                {isLoading ? "Se trimite..." : "Trimite link de resetare"}
              </button>
            </div>
            <div className="mt-4 text-center text-sm text-gray-400">
              Vă amintiți parola?{" "}
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
