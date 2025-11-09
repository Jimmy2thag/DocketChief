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

const LEGAL_SYSTEM_PROMPT = `You are an advanced legal AI assistant specialized in providing comprehensive legal research and drafting support. Your capabilities include:

1. Legal Research & Analysis: Analyze case law, statutes, and regulations with precision
2. Document Review: Identify key issues, risks, and opportunities in legal documents
3. Motion & Brief Assistance: Help draft persuasive legal arguments with proper structure
4. Citation Support: Format legal citations correctly (though you should note you cannot verify current law)
5. Procedural Guidance: Provide information on legal procedures and requirements

Important Guidelines:
- Be precise and accurate in your responses
- Never fabricate case citations or legal authorities
- Clearly distinguish between general legal information and specific legal advice
- Note limitations in your knowledge cutoff date
- Recommend consulting with a licensed attorney for specific legal matters
- Use clear, professional language appropriate for legal professionals`

serve(async (req) => {
  const origin = req.headers.get('origin')
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const provider = body?.provider || 'openai'

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
        : LEGAL_SYSTEM_PROMPT

    // Route to appropriate AI provider
    if (provider === 'gemini') {
      return await handleGemini(messages, system, body?.model, origin)
    } else {
      return await handleOpenAI(messages, system, body?.model, origin)
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })
  }
})

async function handleOpenAI(
  messages: { role: string; content: string }[],
  system: string,
  modelOverride: string | undefined,
  origin: string | null
): Promise<Response> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY missing' }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })
  }

  const model = typeof modelOverride === 'string' && modelOverride.trim().length > 0 
    ? modelOverride 
    : 'gpt-4o'

  const payload = {
    model,
    messages: [{ role: 'system', content: system }, ...messages],
    temperature: 0.2,
    max_tokens: 4000,
  }

  try {
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
      console.error('OpenAI API error:', txt)
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
    console.error('OpenAI handler error:', e)
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })
  }
}

async function handleGemini(
  messages: { role: string; content: string }[],
  system: string,
  modelOverride: string | undefined,
  origin: string | null
): Promise<Response> {
  const apiKey = Deno.env.get('GOOGLE_AI_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GOOGLE_AI_API_KEY missing, falling back to OpenAI' }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })
  }

  const model = typeof modelOverride === 'string' && modelOverride.trim().length > 0 
    ? modelOverride 
    : 'gemini-pro'

  try {
    // Convert messages to Gemini format
    // Gemini doesn't use system role the same way, so we prepend system to first user message
    const geminiContents = []
    let systemPrepended = false

    for (const msg of messages) {
      if (msg.role === 'system') continue // Skip system messages as they're handled separately
      
      const role = msg.role === 'assistant' ? 'model' : 'user'
      let text = msg.content
      
      // Prepend system prompt to first user message
      if (role === 'user' && !systemPrepended) {
        text = `${system}\n\n${text}`
        systemPrepended = true
      }
      
      geminiContents.push({
        role,
        parts: [{ text }]
      })
    }

    const payload = {
      contents: geminiContents,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4000,
      }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!r.ok) {
      const txt = await r.text()
      console.error('Gemini API error:', txt)
      return new Response(JSON.stringify({ error: 'Gemini request failed', details: txt }), {
        status: 502,
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      })
    }

    const data = await r.json()
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const usage = {
      prompt_tokens: data?.usageMetadata?.promptTokenCount ?? 0,
      completion_tokens: data?.usageMetadata?.candidatesTokenCount ?? 0,
      total_tokens: data?.usageMetadata?.totalTokenCount ?? 0,
    }

    return new Response(JSON.stringify({ content, usage }), {
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })
  } catch (e) {
    console.error('Gemini handler error:', e)
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })
  }
}
