import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-[#0a0a0f]">
      <div className="w-full max-w-sm">
        <Card className="bg-[#1a1a2e] border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Desculpe, algo deu errado.</CardTitle>
          </CardHeader>
          <CardContent>
            {params?.error ? (
              <p className="text-sm text-gray-400">Código do erro: {params.error}</p>
            ) : (
              <p className="text-sm text-gray-400">Ocorreu um erro não especificado.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
