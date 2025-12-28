import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

type User = {
  id: string
  email: string | null
  full_name?: string | null
}

type AuthCtx = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthCtx | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (mounted) {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            full_name: (session.user.user_metadata as { full_name?: string })?.full_name ?? null,
          })
        }
        setLoading(false)
      }
    })()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          full_name: (session.user.user_metadata as { full_name?: string })?.full_name ?? null,
        })
      } else {
        setUser(null)
      }
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = useMemo(() => ({ user, loading, signIn, signUp, signOut }), [user, loading])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth = () => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
