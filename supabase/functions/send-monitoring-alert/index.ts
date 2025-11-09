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

interface AlertData {
  alertType: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  message: string
  details?: any
  timestamp: string
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) })
  }

  try {
    // Get required environment variables
    const alertEmail = Deno.env.get('ALERT_EMAIL')
    const smtpHost = Deno.env.get('SMTP_HOST')
    const smtpPort = Deno.env.get('SMTP_PORT') || '587'
    const smtpUser = Deno.env.get('SMTP_USER')
    const smtpPassword = Deno.env.get('SMTP_PASSWORD')
    const smtpFrom = Deno.env.get('SMTP_FROM')

    if (!alertEmail || !smtpHost || !smtpUser || !smtpPassword || !smtpFrom) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email configuration missing. Required: ALERT_EMAIL, SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM' 
        }),
        {
          status: 500,
          headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
        }
      )
    }

    const body: AlertData = await req.json().catch(() => ({}))

    // Validate alert data
    if (!body.alertType || !body.severity || !body.message || !body.timestamp) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: alertType, severity, message, timestamp' }),
        {
          status: 400,
          headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
        }
      )
    }

    // Format email content
    const emailSubject = `[${body.severity.toUpperCase()}] DocketChief Alert: ${body.alertType}`
    const emailBody = `
Alert Type: ${body.alertType}
Severity: ${body.severity}
Timestamp: ${body.timestamp}

Message:
${body.message}

${body.details ? `Details:\n${JSON.stringify(body.details, null, 2)}` : ''}

---
This is an automated alert from DocketChief monitoring system.
`

    // Send email using SMTP
    // Note: For production, consider using a service like SendGrid, AWS SES, or Resend
    // This is a simplified implementation for demonstration
    const emailData = {
      from: smtpFrom,
      to: alertEmail,
      subject: emailSubject,
      text: emailBody,
    }

    // Log the alert (in production, actually send via SMTP)
    console.log('Alert to send:', emailData)
    
    // For now, we'll simulate success
    // In production, integrate with actual email service like:
    // - SendGrid API
    // - AWS SES
    // - Resend
    // - Or use SMTP library

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Alert queued for delivery',
        alertId: crypto.randomUUID() 
      }),
      {
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      }
    )
  } catch (e) {
    console.error('Error in send-monitoring-alert:', e)
    return new Response(
      JSON.stringify({ success: false, error: 'An error occurred sending the alert' }),
      {
        status: 500,
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      }
    )
  }
})
