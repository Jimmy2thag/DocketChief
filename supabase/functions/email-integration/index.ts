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
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  }
}

interface EmailMessage {
  to: string | string[]
  subject: string
  body: string
  htmlBody?: string
  from?: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: Array<{
    filename: string
    content: string
    contentType?: string
  }>
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
    const { op } = body

    // Handle different operations
    switch (op) {
      case 'oauth_url': {
        // Generate OAuth URL for Gmail or Outlook
        const { provider } = body // 'gmail' or 'outlook'
        
        if (!provider || !['gmail', 'outlook'].includes(provider)) {
          return new Response(
            JSON.stringify({ error: 'Invalid provider. Must be "gmail" or "outlook"' }),
            {
              status: 400,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        const redirectUri = Deno.env.get('OAUTH_REDIRECT_URI') || 'http://localhost:5173/oauth/callback'
        
        let authUrl: string
        let clientId: string | undefined

        if (provider === 'gmail') {
          clientId = Deno.env.get('GMAIL_CLIENT_ID')
          const scope = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send'
          authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`
        } else {
          // Outlook
          clientId = Deno.env.get('OUTLOOK_CLIENT_ID')
          const scope = 'offline_access Mail.Read Mail.Send'
          authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&response_mode=query`
        }

        if (!clientId) {
          return new Response(
            JSON.stringify({ error: `${provider.toUpperCase()}_CLIENT_ID not configured` }),
            {
              status: 500,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        return new Response(
          JSON.stringify({ authUrl, provider }),
          {
            headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
          }
        )
      }

      case 'oauth_token': {
        // Exchange authorization code for tokens
        const { provider, code } = body
        
        if (!provider || !code) {
          return new Response(
            JSON.stringify({ error: 'provider and code required' }),
            {
              status: 400,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        const redirectUri = Deno.env.get('OAUTH_REDIRECT_URI') || 'http://localhost:5173/oauth/callback'
        
        let tokenUrl: string
        let clientId: string | undefined
        let clientSecret: string | undefined

        if (provider === 'gmail') {
          clientId = Deno.env.get('GMAIL_CLIENT_ID')
          clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET')
          tokenUrl = 'https://oauth2.googleapis.com/token'
        } else {
          clientId = Deno.env.get('OUTLOOK_CLIENT_ID')
          clientSecret = Deno.env.get('OUTLOOK_CLIENT_SECRET')
          tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
        }

        if (!clientId || !clientSecret) {
          return new Response(
            JSON.stringify({ error: `${provider.toUpperCase()} OAuth credentials not configured` }),
            {
              status: 500,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        const tokenResponse = await fetch(tokenUrl, {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }),
        })

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text()
          return new Response(
            JSON.stringify({ error: 'Token exchange failed', details: errorText }),
            {
              status: 502,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        const tokens = await tokenResponse.json()

        return new Response(
          JSON.stringify({ 
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresIn: tokens.expires_in,
            provider 
          }),
          {
            headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
          }
        )
      }

      case 'sync_emails': {
        // Sync emails from Gmail or Outlook
        const { provider, accessToken, maxResults = 10 } = body
        
        if (!provider || !accessToken) {
          return new Response(
            JSON.stringify({ error: 'provider and accessToken required' }),
            {
              status: 400,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        let emails: any[] = []

        if (provider === 'gmail') {
          // Fetch emails from Gmail
          const gmailResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
            {
              headers: { 'Authorization': `Bearer ${accessToken}` },
            }
          )

          if (!gmailResponse.ok) {
            return new Response(
              JSON.stringify({ error: 'Failed to fetch Gmail messages' }),
              {
                status: 502,
                headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
              }
            )
          }

          const gmailData = await gmailResponse.json()
          
          // Fetch details for each message
          for (const msg of gmailData.messages || []) {
            const msgResponse = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
              {
                headers: { 'Authorization': `Bearer ${accessToken}` },
              }
            )
            
            if (msgResponse.ok) {
              const msgData = await msgResponse.json()
              emails.push({
                id: msgData.id,
                threadId: msgData.threadId,
                snippet: msgData.snippet,
                internalDate: msgData.internalDate,
                headers: msgData.payload?.headers,
              })
            }
          }
        } else {
          // Fetch emails from Outlook
          const outlookResponse = await fetch(
            `https://graph.microsoft.com/v1.0/me/messages?$top=${maxResults}`,
            {
              headers: { 'Authorization': `Bearer ${accessToken}` },
            }
          )

          if (!outlookResponse.ok) {
            return new Response(
              JSON.stringify({ error: 'Failed to fetch Outlook messages' }),
              {
                status: 502,
                headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
              }
            )
          }

          const outlookData = await outlookResponse.json()
          emails = outlookData.value || []
        }

        return new Response(
          JSON.stringify({ emails, count: emails.length }),
          {
            headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
          }
        )
      }

      case 'send_email': {
        // Send email via Gmail or Outlook
        const { provider, accessToken, message }: { provider: string, accessToken: string, message: EmailMessage } = body
        
        if (!provider || !accessToken || !message) {
          return new Response(
            JSON.stringify({ error: 'provider, accessToken, and message required' }),
            {
              status: 400,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        if (!message.to || !message.subject || !message.body) {
          return new Response(
            JSON.stringify({ error: 'message must include to, subject, and body' }),
            {
              status: 400,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        if (provider === 'gmail') {
          // Send via Gmail API
          const emailLines = [
            `To: ${Array.isArray(message.to) ? message.to.join(',') : message.to}`,
            `Subject: ${message.subject}`,
            'Content-Type: text/html; charset=utf-8',
            '',
            message.htmlBody || message.body,
          ]
          
          const email = emailLines.join('\r\n')
          const encodedEmail = btoa(unescape(encodeURIComponent(email))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

          const sendResponse = await fetch(
            'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ raw: encodedEmail }),
            }
          )

          if (!sendResponse.ok) {
            return new Response(
              JSON.stringify({ error: 'Failed to send email via Gmail' }),
              {
                status: 502,
                headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
              }
            )
          }

          const result = await sendResponse.json()
          return new Response(
            JSON.stringify({ success: true, messageId: result.id }),
            {
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        } else {
          // Send via Outlook API
          const emailPayload = {
            message: {
              subject: message.subject,
              body: {
                contentType: message.htmlBody ? 'HTML' : 'Text',
                content: message.htmlBody || message.body,
              },
              toRecipients: (Array.isArray(message.to) ? message.to : [message.to]).map(email => ({
                emailAddress: { address: email }
              })),
            },
            saveToSentItems: true,
          }

          const sendResponse = await fetch(
            'https://graph.microsoft.com/v1.0/me/sendMail',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(emailPayload),
            }
          )

          if (!sendResponse.ok) {
            return new Response(
              JSON.stringify({ error: 'Failed to send email via Outlook' }),
              {
                status: 502,
                headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
              }
            )
          }

          return new Response(
            JSON.stringify({ success: true }),
            {
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown operation: ${op}. Valid operations: oauth_url, oauth_token, sync_emails, send_email` }),
          {
            status: 400,
            headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
          }
        )
    }
  } catch (e) {
    console.error('Error in email-integration:', e)
    return new Response(
      JSON.stringify({ error: 'An error occurred processing the email request' }),
      {
        status: 500,
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      }
    )
  }
})
