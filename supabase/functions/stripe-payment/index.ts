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
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    
    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Stripe integration not configured. Set STRIPE_SECRET_KEY environment variable.' 
      }), {
        status: 503,
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      })
    }

    const body = await req.json().catch(() => ({}))
    const { action, amount, currency, planName, customerEmail, userId } = body

    if (action === 'create_payment_intent') {
      if (!amount || amount <= 0) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Valid amount is required' 
        }), {
          status: 400,
          headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
        })
      }

      // Create Stripe PaymentIntent
      const response = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          amount: Math.round(amount * 100).toString(), // Convert to cents
          currency: currency || 'usd',
          'metadata[plan_name]': planName || 'DocketChief Plan',
          'metadata[user_id]': userId || '',
          ...(customerEmail ? { 'receipt_email': customerEmail } : {}),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return new Response(JSON.stringify({ 
          success: false, 
          error: errorData.error?.message || 'Failed to create payment intent' 
        }), {
          status: response.status,
          headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
        })
      }

      const paymentIntent = await response.json()

      return new Response(JSON.stringify({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }), {
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      })
    }

    if (action === 'create_checkout_session') {
      const successUrl = body.successUrl || `${origin}/payment-success`
      const cancelUrl = body.cancelUrl || `${origin}/payment-cancel`

      // Create Stripe Checkout Session
      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'mode': 'payment',
          'success_url': successUrl,
          'cancel_url': cancelUrl,
          'line_items[0][price_data][currency]': currency || 'usd',
          'line_items[0][price_data][product_data][name]': planName || 'DocketChief Subscription',
          'line_items[0][price_data][unit_amount]': Math.round(amount * 100).toString(),
          'line_items[0][quantity]': '1',
          ...(customerEmail ? { 'customer_email': customerEmail } : {}),
          ...(userId ? { 'metadata[user_id]': userId } : {}),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return new Response(JSON.stringify({ 
          success: false, 
          error: errorData.error?.message || 'Failed to create checkout session' 
        }), {
          status: response.status,
          headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
        })
      }

      const session = await response.json()

      return new Response(JSON.stringify({
        success: true,
        sessionId: session.id,
        url: session.url,
      }), {
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      })
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Invalid action. Use "create_payment_intent" or "create_checkout_session"' 
    }), {
      status: 400,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })

  } catch (e) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: String(e) 
    }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })
  }
})
