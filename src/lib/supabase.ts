import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anon) {
  console.warn('[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(url!, anon!, {
  auth: {
    // Enable PKCE flow for OAuth providers
    flowType: 'pkce',
    // Automatically detect redirect URL
    detectSessionInUrl: true,
    // Persist session in local storage
    persistSession: true,
    // Auto refresh tokens before they expire
    autoRefreshToken: true,
    // Storage options (default is localStorage)
    storage: window.localStorage,
    // Additional security headers
    storageKey: 'docketchief-auth',
  },
})

/**
 * OAuth provider configuration with PKCE
 */
export const oauthConfig = {
  // Redirect URL for OAuth callbacks
  redirectTo: `${window.location.origin}/auth/callback`,
  // Scopes for OAuth providers
  scopes: 'email profile',
}

/**
 * Sign in with OAuth provider using PKCE flow
 */
export async function signInWithOAuth(provider: 'google' | 'github' | 'azure') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: oauthConfig.redirectTo,
      scopes: oauthConfig.scopes,
      // PKCE is enabled by default in the client config above
    },
  })

  if (error) {
    console.error(`[OAuth] Failed to sign in with ${provider}:`, error)
    throw error
  }

  return data
}

