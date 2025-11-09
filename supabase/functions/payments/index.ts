import { serve } from "jsr:@supabase/functions"
import Stripe from 'npm:stripe@14.14.0'

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s => s.trim()).filter(Boolean)

function corsHeaders(origin: string | null) {
  const o = origin && ALLOWED_ORIGINS.includes(origin) ? origin : '*'
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
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
      return new Response(
        JSON.stringify({ error: 'STRIPE_SECRET_KEY not configured' }),
        {
          status: 500,
          headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
        }
      )
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const body = await req.json().catch(() => ({}))
    const { op } = body

    // Handle different operations
    switch (op) {
      case 'create_payment_intent': {
        const { amount, currency = 'usd', customerEmail } = body
        
        if (!amount || amount <= 0) {
          return new Response(
            JSON.stringify({ error: 'Invalid amount' }),
            {
              status: 400,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount),
          currency,
          ...(customerEmail && { receipt_email: customerEmail }),
          metadata: {
            source: 'docketchief',
          },
        })

        return new Response(
          JSON.stringify({ 
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id 
          }),
          {
            headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
          }
        )
      }

      case 'create_subscription': {
        const { customerId, priceId } = body
        
        if (!customerId || !priceId) {
          return new Response(
            JSON.stringify({ error: 'customerId and priceId required' }),
            {
              status: 400,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: priceId }],
          payment_behavior: 'default_incomplete',
          payment_settings: { save_default_payment_method: 'on_subscription' },
          expand: ['latest_invoice.payment_intent'],
        })

        return new Response(
          JSON.stringify({ 
            subscriptionId: subscription.id,
            clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
          }),
          {
            headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
          }
        )
      }

      case 'create_customer': {
        const { email, name, metadata } = body
        
        if (!email) {
          return new Response(
            JSON.stringify({ error: 'email required' }),
            {
              status: 400,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        const customer = await stripe.customers.create({
          email,
          name,
          metadata: metadata || {},
        })

        return new Response(
          JSON.stringify({ customerId: customer.id }),
          {
            headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
          }
        )
      }

      case 'cancel_subscription': {
        const { subscriptionId } = body
        
        if (!subscriptionId) {
          return new Response(
            JSON.stringify({ error: 'subscriptionId required' }),
            {
              status: 400,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        const subscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        })

        return new Response(
          JSON.stringify({ 
            success: true,
            subscriptionId: subscription.id,
            cancelAtPeriodEnd: subscription.cancel_at_period_end 
          }),
          {
            headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
          }
        )
      }

      case 'get_subscription': {
        const { subscriptionId } = body
        
        if (!subscriptionId) {
          return new Response(
            JSON.stringify({ error: 'subscriptionId required' }),
            {
              status: 400,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        return new Response(
          JSON.stringify({ subscription }),
          {
            headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
          }
        )
      }

      case 'webhook': {
        // Handle Stripe webhook events
        const signature = req.headers.get('stripe-signature')
        const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

        if (!signature || !webhookSecret) {
          return new Response(
            JSON.stringify({ error: 'Missing signature or webhook secret' }),
            {
              status: 400,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        const rawBody = await req.text()
        
        let event
        try {
          event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
        } catch (err) {
          return new Response(
            JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
            {
              status: 400,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        // Log the event
        console.log('Stripe webhook event:', event.type, event.id)

        return new Response(
          JSON.stringify({ received: true, eventType: event.type }),
          {
            headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
          }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown operation: ${op}` }),
          {
            status: 400,
            headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
          }
        )
    }
  } catch (e) {
    console.error('Error in payments function:', e)
    return new Response(
      JSON.stringify({ error: String(e) }),
      {
        status: 500,
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      }
    )
  }
})
