import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { signInSchema, signUpSchema } from '@/lib/validation'
import { authRateLimiter, RateLimitError, formatRetryAfter } from '@/lib/rateLimiter'
import { secureLocalStorage } from '@/lib/secureStorage'

type User = {
  id: string
  email: string | null
  full_name?: string | null
}

type AuthError = {
  message: string
  field?: string
}

type AuthCtx = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>
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
    // Check rate limit
    const rateLimitCheck = await authRateLimiter.checkLimit('signin');
    if (!rateLimitCheck.allowed) {
      const retryAfter = Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000);
      return {
        error: {
          message: `Too many sign-in attempts. Please try again in ${formatRetryAfter(retryAfter)}.`,
        },
      };
    }

    // Validate input
    const validation = signInSchema.safeParse({ email, password });
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return {
        error: {
          message: firstError.message,
          field: firstError.path[0] as string,
        },
      };
    }

    const { error } = await supabase.auth.signInWithPassword({ 
      email: validation.data.email, 
      password: validation.data.password 
    });

    if (error) {
      return {
        error: {
          message: error.message,
        },
      };
    }

    return { error: null };
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    // Check rate limit
    const rateLimitCheck = await authRateLimiter.checkLimit('signup');
    if (!rateLimitCheck.allowed) {
      const retryAfter = Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000);
      return {
        error: {
          message: `Too many sign-up attempts. Please try again in ${formatRetryAfter(retryAfter)}.`,
        },
      };
    }

    // Validate input
    const validation = signUpSchema.safeParse({ email, password, fullName });
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return {
        error: {
          message: firstError.message,
          field: firstError.path[0] as string,
        },
      };
    }

    const { error } = await supabase.auth.signUp({
      email: validation.data.email,
      password: validation.data.password,
      options: { data: { full_name: validation.data.fullName } },
    });

    if (error) {
      return {
        error: {
          message: error.message,
        },
      };
    }

    return { error: null };
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    // Clear any sensitive data from secure storage
    secureLocalStorage.clear();
  }

  const value = useMemo(() => ({ user, loading, signIn, signUp, signOut }), [user, loading])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth = () => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
