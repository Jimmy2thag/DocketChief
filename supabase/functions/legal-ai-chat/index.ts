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

async function handleOpenAIRequest(
  messages: { role: string; content: string }[],
  system: string,
  model: string,
  origin: string | null
) {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY missing' }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })
  }

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
}

async function handleGeminiRequest(
  messages: { role: string; content: string }[],
  system: string,
  model: string,
  origin: string | null
) {
  const apiKey = Deno.env.get('GOOGLE_AI_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GOOGLE_AI_API_KEY missing' }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })
  }

  // Convert messages to Gemini format
  // Gemini uses 'user' and 'model' roles, and requires a specific format
  const contents = []
  
  // Add system message as first user message if provided
  if (system && system !== 'You are a precise legal drafting assistant. Write clearly, cite rules accurately, and never fabricate citations.') {
    contents.push({
      role: 'user',
      parts: [{ text: system }]
    })
    contents.push({
      role: 'model',
      parts: [{ text: 'I understand. I will act as a precise legal drafting assistant.' }]
    })
  }

  // Convert conversation history
  for (const msg of messages) {
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })
  }

  // Use gemini-pro as default if model isn't specified or use the provided model
  const geminiModel = model === 'gpt-4o-mini' || model === 'gpt-4o' ? 'gemini-pro' : model

  const payload = {
    contents,
    generationConfig: {
      temperature: 0.2,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      }
    ]
  }

  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
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
    return new Response(JSON.stringify({ error: 'Gemini request failed', details: txt }), {
      status: 502,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })
  }

  const data = await r.json()
  
  // Extract content from Gemini response
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const usage = {
    promptTokens: data?.usageMetadata?.promptTokenCount ?? 0,
    completionTokens: data?.usageMetadata?.candidatesTokenCount ?? 0,
    totalTokens: data?.usageMetadata?.totalTokenCount ?? 0,
  }

  return new Response(JSON.stringify({ content, usage }), {
    headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
  })
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) })
  }

  try {
    const body = await req.json().catch(() => ({}))

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
    const model = typeof body?.model === 'string' && body.model.trim().length > 0 ? body.model : 'gpt-4o-mini'
    const provider = typeof body?.provider === 'string' ? body.provider : 'openai'

    // Route to appropriate AI provider
    if (provider === 'gemini') {
      return await handleGeminiRequest(messages, system, model, origin)
    } else {
      return await handleOpenAIRequest(messages, system, model, origin)
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })
  }
})
