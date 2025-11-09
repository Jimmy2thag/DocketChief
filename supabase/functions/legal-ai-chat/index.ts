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

// Handler for OpenAI API
async function handleOpenAI(
  messages: { role: string; content: string }[],
  model: string,
  system: string,
  apiKey: string
) {
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
    throw new Error(`OpenAI request failed: ${txt}`)
  }
  
  const data = await r.json()
  const content = data?.choices?.[0]?.message?.content ?? ''
  const usage = data?.usage ?? null
  
  return { content, usage }
}

// Handler for Google Gemini API
async function handleGemini(
  messages: { role: string; content: string }[],
  model: string,
  system: string,
  apiKey: string
) {
  // Convert messages to Gemini format
  const geminiMessages = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }))

  // Add system instruction as first user message if provided
  if (system && system.trim().length > 0) {
    geminiMessages.unshift({
      role: 'user',
      parts: [{ text: system }]
    })
  }

  const payload = {
    contents: geminiMessages,
    generationConfig: {
      temperature: 0.2,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    }
  }

  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  )

  if (!r.ok) {
    const txt = await r.text()
    throw new Error(`Gemini request failed: ${txt}`)
  }
  
  const data = await r.json()
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const usage = data?.usageMetadata ?? null
  
  return { content, usage }
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) })
  }

  try {
    const body = await req.json().catch(() => ({}))

    // Determine provider
    const provider = typeof body?.provider === 'string' ? body.provider : 'openai'

    // Get appropriate API key
    const apiKey = provider === 'gemini' 
      ? Deno.env.get('GEMINI_API_KEY')
      : Deno.env.get('OPENAI_API_KEY')

    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: `${provider === 'gemini' ? 'GEMINI_API_KEY' : 'OPENAI_API_KEY'} missing` 
      }), {
        status: 500,
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      })
    }

    type RawMessage = { role?: string; content?: string }

    const isValidRawMessage = (msg: RawMessage): msg is { role: string; content: string } =>
      typeof msg?.role === 'string' && typeof msg?.content === 'string' && msg.content.trim().length > 0

    let messages: { role: string; content: string }[] = []

    if (Array.isArray(body?.messages)) {
      messages = body.messages.filter(isValidRawMessage)
    }

    if (messages.length === 0) {
      const fallbackMessage =
        typeof body?.message === 'string'
          ? body.message
          : typeof body?.prompt === 'string'
            ? body.prompt
            : null

      if (fallbackMessage && fallbackMessage.trim().length > 0) {
        messages = [{ role: 'user', content: fallbackMessage }]
      }
    }

    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      })
    }

    const system =
      typeof body?.system === 'string' && body.system.trim().length > 0
        ? body.system
        : 'You are a precise legal drafting assistant. Write clearly, cite rules accurately, and never fabricate citations.'
    
    // Set default model based on provider
    const defaultModel = provider === 'gemini' ? 'gemini-pro' : 'gpt-4o-mini'
    const model = typeof body?.model === 'string' && body.model.trim().length > 0 ? body.model : defaultModel

    // Call appropriate AI service
    let result
    if (provider === 'gemini') {
      result = await handleGemini(messages, model, system, apiKey)
    } else {
      result = await handleOpenAI(messages, model, system, apiKey)
    }

    return new Response(JSON.stringify(result), {
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })
  }
})
