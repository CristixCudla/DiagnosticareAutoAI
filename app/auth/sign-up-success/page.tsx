export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent">
            Vă mulțumim pentru înregistrare!
          </h2>
          <p className="text-gray-400 mb-4">Verificați email-ul pentru confirmare</p>
          <p className="text-sm text-gray-500">
            V-ați înregistrat cu succes. Vă rugăm să verificați email-ul pentru a vă confirma contul înainte de a vă
            conecta.
          </p>
        </div>
      </div>
    </div>
  )
}
