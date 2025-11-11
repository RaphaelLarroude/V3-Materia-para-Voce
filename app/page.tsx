"use client"

import dynamic from "next/dynamic"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

// Dynamically import App to avoid SSR issues
const App = dynamic(() => import("../App"), { ssr: false })

export default function Page() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-xl text-white">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <App />
}
