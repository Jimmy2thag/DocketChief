import { serve } from "jsr:@supabase/functions"

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s => s.trim()).filter(Boolean)

// Rate limiter configuration
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20; // 20 requests per minute per user

function corsHeaders(origin: string | null) {
  // Strict origin validation - only allow whitelisted origins
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : null;
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin || ALLOWED_ORIGINS[0] || 'https://docketchief.com',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  }
}

function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const key = `rate_limit:${identifier}`;
  
  let entry = rateLimitMap.get(key);
  
  // Reset if window has passed
  if (!entry || now >= entry.resetTime) {
    entry = { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };
  }
  
  // Check if limit exceeded
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  // Increment counter
  entry.count++;
  rateLimitMap.set(key, entry);
  
  return { allowed: true };
}

// Cleanup old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now >= entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

function validateChatMessage(msg: unknown): msg is { role: string; content: string } {
  if (typeof msg !== 'object' || msg === null) return false;
  const m = msg as Record<string, unknown>;
  
  if (typeof m.role !== 'string' || !['user', 'assistant', 'system'].includes(m.role)) {
    return false;
  }
  
  if (typeof m.content !== 'string' || m.content.trim().length === 0) {
    return false;
  }
  
  // Max message length: 10,000 characters
  if (m.content.length > 10000) {
    return false;
  }
  
  return true;
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) })
  }

  // Validate origin for non-OPTIONS requests
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
      status: 403,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })
  }

  try {
    // Extract user identifier for rate limiting
    const authHeader = req.headers.get('authorization');
    const userId = authHeader ? authHeader.split(' ')[1] : 'anonymous';
    
    // Check rate limit
    const rateCheck = checkRateLimit(userId);
    if (!rateCheck.allowed) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded',
        retryAfter: rateCheck.retryAfter 
      }), {
        status: 429,
        headers: { 
          'content-type': 'application/json',
          'Retry-After': String(rateCheck.retryAfter || 60),
          ...corsHeaders(origin) 
        },
      })
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY missing' }), {
        status: 500,
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      })
    }

    const body = await req.json().catch(() => ({}))

    // Validate messages array
    let messages: { role: string; content: string }[] = []

    if (Array.isArray(body?.messages)) {
      messages = body.messages.filter(validateChatMessage)
      
      // Limit number of messages
      if (messages.length > 50) {
        return new Response(JSON.stringify({ error: 'Too many messages (max 50)' }), {
          status: 400,
          headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
        })
      }
    }

    if (messages.length === 0) {
      const fallbackMessage =
        typeof body?.message === 'string'
          ? body.message
          : typeof body?.prompt === 'string'
            ? body.prompt
            : null

      if (fallbackMessage && fallbackMessage.trim().length > 0 && fallbackMessage.length <= 10000) {
        messages = [{ role: 'user', content: fallbackMessage }]
      }
    }

    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      })
    }

    // Validate and sanitize system prompt
    const system =
      typeof body?.system === 'string' && body.system.trim().length > 0 && body.system.length <= 1000
        ? body.system
        : 'You are a precise legal drafting assistant. Write clearly, cite rules accurately, and never fabricate citations.'
    
    // Validate model
    const allowedModels = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'];
    const model = typeof body?.model === 'string' && allowedModels.includes(body.model) 
      ? body.model 
      : 'gpt-4o-mini';

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
