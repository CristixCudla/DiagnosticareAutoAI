export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-2 text-red-500">Ne pare rău, ceva nu a funcționat.</h2>
          {params?.error ? (
            <p className="text-sm text-gray-400">Eroare: {params.error}</p>
          ) : (
            <p className="text-sm text-gray-400">A apărut o eroare nespecificată.</p>
          )}
        </div>
      </div>
    </div>
  )
}
