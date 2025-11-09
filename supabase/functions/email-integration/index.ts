import { serve } from "jsr:@supabase/functions"

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s => s.trim()).filter(Boolean)

function corsHeaders(origin: string | null) {
  const o = origin && ALLOWED_ORIGINS.includes(origin) ? origin : '*'
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { action, userId, accessToken, provider } = body

    if (!action || !userId || !accessToken) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required parameters: action, userId, accessToken' 
      }), {
        status: 400,
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      })
    }

    // Handle different email provider actions
    if (action === 'sync_gmail' || action === 'sync_outlook') {
      // In production, this would use the OAuth access token to fetch emails
      // For Gmail: https://gmail.googleapis.com/gmail/v1/users/me/messages
      // For Outlook: https://graph.microsoft.com/v1.0/me/messages
      
      const providerName = action === 'sync_gmail' ? 'gmail' : 'outlook'
      
      // This is a placeholder for the real implementation
      // In production, you would:
      // 1. Validate the access token
      // 2. Fetch emails from the provider's API
      // 3. Transform them to match your schema
      // 4. Return the emails for storage in Supabase
      
      return new Response(JSON.stringify({
        success: true,
        emails: [],
        message: `OAuth integration ready. Configure ${providerName} API credentials to sync emails.`,
        provider: providerName
      }), {
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      })
    }

    if (action === 'get_oauth_url') {
      // Return OAuth URL for the specified provider
      const provider = body.provider
      
      if (provider === 'gmail') {
        // In production, construct real Google OAuth URL
        const oauthUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
        return new Response(JSON.stringify({
          success: true,
          authUrl: oauthUrl,
          message: 'Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables'
        }), {
          headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
        })
      }
      
      if (provider === 'outlook') {
        // In production, construct real Microsoft OAuth URL
        const oauthUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
        return new Response(JSON.stringify({
          success: true,
          authUrl: oauthUrl,
          message: 'Configure MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET environment variables'
        }), {
          headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
        })
      }
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Invalid action' 
    }), {
      status: 400,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })

  } catch (e) {
    console.error('Email integration error:', e);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })
  }
})
