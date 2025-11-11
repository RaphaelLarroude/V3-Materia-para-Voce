"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [role, setRole] = useState<"student" | "teacher">("student")
  const [classroom, setClassroom] = useState<string>("A")
  const [year, setYear] = useState<string>("6")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}`,
          data: {
            name,
            role,
            classroom,
            year: Number.parseInt(year),
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-[#0a0a0f]">
      <div className="w-full max-w-md">
        <Card className="bg-[#1a1a2e] border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Cadastro</CardTitle>
            <CardDescription className="text-gray-400">Crie sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-gray-300">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-[#0a0a0f] border-gray-700 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#0a0a0f] border-gray-700 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role" className="text-gray-300">
                    Tipo de usuário
                  </Label>
                  <Select value={role} onValueChange={(value) => setRole(value as "student" | "teacher")}>
                    <SelectTrigger className="bg-[#0a0a0f] border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Aluno</SelectItem>
                      <SelectItem value="teacher">Professor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {role === "student" && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="classroom" className="text-gray-300">
                        Turma
                      </Label>
                      <Select value={classroom} onValueChange={setClassroom}>
                        <SelectTrigger className="bg-[#0a0a0f] border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                          <SelectItem value="E">E</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="year" className="text-gray-300">
                        Ano
                      </Label>
                      <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="bg-[#0a0a0f] border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6º ano</SelectItem>
                          <SelectItem value="7">7º ano</SelectItem>
                          <SelectItem value="8">8º ano</SelectItem>
                          <SelectItem value="9">9º ano</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-gray-300">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#0a0a0f] border-gray-700 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password" className="text-gray-300">
                    Repetir Senha
                  </Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="bg-[#0a0a0f] border-gray-700 text-white"
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading ? "Criando conta..." : "Cadastrar"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-gray-400">
                Já tem uma conta?{" "}
                <Link href="/auth/login" className="text-blue-500 underline underline-offset-4">
                  Entrar
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
