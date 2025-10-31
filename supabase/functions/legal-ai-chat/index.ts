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
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY missing' }), {
        status: 500,
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      })
    }

    const body = await req.json().catch(() => ({}))
    const messages = body?.messages ?? []
    const system = body?.system ?? 'You are a precise legal drafting assistant. Write clearly, cite rules accurately, and never fabricate citations.'
    const model = body?.model ?? 'gpt-4o-mini'

    const payload = {
      model,
      messages: [{ role: 'system', content: system }, ...messages],
      temperature: 0.2,
    }

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    if (!r.ok) {
      const txt = await r.text()
      return new Response(JSON.stringify({ error: 'OpenAI request failed', details: txt }), {
        status: 502,
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      })
    }
    const data = await r.json()
    const content = data?.choices?.[0]?.message?.content ?? ''
    const usage = data?.usage ?? null

    return new Response(JSON.stringify({ content, usage }), {
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })
  }
})
