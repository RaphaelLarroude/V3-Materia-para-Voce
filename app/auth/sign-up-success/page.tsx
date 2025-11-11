import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-[#0a0a0f]">
      <div className="w-full max-w-sm">
        <Card className="bg-[#1a1a2e] border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Obrigado por se cadastrar!</CardTitle>
            <CardDescription className="text-gray-400">Confirme seu email</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-300 mb-4">
              Você se cadastrou com sucesso. Por favor, verifique seu email para confirmar sua conta antes de fazer
              login.
            </p>
            <Link href="/auth/login">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Ir para Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
