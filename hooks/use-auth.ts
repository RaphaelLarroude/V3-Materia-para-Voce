"use client"

import { useEffect, useState } from "react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { createBrowserClient } from "@/lib/supabase/client"
import type { User } from "@/types"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadUserProfile(authUser: SupabaseUser) {
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).single()

    if (profile) {
      setUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        isActive: profile.is_active,
        year: profile.year,
        classroom: profile.classroom,
      })
    }
    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return { user, loading, signOut }
}
