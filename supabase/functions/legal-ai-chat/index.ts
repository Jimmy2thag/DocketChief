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
    return new Response(JSON.stringify({ error: 'OpenAI request failed', details: txt }), {
      status: 502,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })
    throw new Error(`OpenAI request failed: ${txt}`)
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
    throw new Error(`Gemini request failed: ${txt}`)
  }
  
  const data = await r.json()
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const usage = data?.usageMetadata ?? null
  
  return { content, usage }
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

    // Determine provider
    const provider = typeof body?.provider === 'string' ? body.provider : 'openai'

    // Get appropriate API key
    const apiKey = provider === 'gemini' 
      ? Deno.env.get('GOOGLE_AI_API_KEY')
      : Deno.env.get('OPENAI_API_KEY')

    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: `${provider === 'gemini' ? 'GOOGLE_AI_API_KEY' : 'OPENAI_API_KEY'} missing` 
      }), {
        status: 500,
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      })
    }
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
        : 'You are a precise legal drafting assistant. Write clearly, cite rules accurately, and never fabricate citations.'
    const model = typeof body?.model === 'string' && body.model.trim().length > 0 ? body.model : 'gpt-4o-mini'
    const provider = typeof body?.provider === 'string' ? body.provider : 'openai'

    // Route to appropriate AI provider
    if (provider === 'gemini') {
      return await handleGeminiRequest(messages, system, model, origin)
    } else {
      return await handleOpenAIRequest(messages, system, model, origin)
    }
    
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
        : LEGAL_SYSTEM_PROMPT

    // Route to appropriate AI provider
    if (provider === 'gemini') {
      return await handleGemini(messages, system, body?.model, origin)
    } else {
      return await handleOpenAI(messages, system, body?.model, origin)
    }
  } catch (e) {
    console.error('Legal AI chat error:', e)
    return new Response(JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }), {
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

    return new Response(JSON.stringify(result), {
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })
  } catch (e) {
    console.error('OpenAI handler error:', e)
    return new Response(JSON.stringify({ error: 'OpenAI service temporarily unavailable. Please try again.' }), {
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
    return new Response(JSON.stringify({ error: 'Gemini service temporarily unavailable. Please try again.' }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })
  }
}
