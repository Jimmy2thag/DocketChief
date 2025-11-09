import { serve } from "jsr:@supabase/functions"

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s => s.trim()).filter(Boolean)

function corsHeaders(origin: string | null) {
  const o = origin && ALLOWED_ORIGINS.includes(origin) ? origin : '*'
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  }
}

interface SearchQuery {
  query: string
  court?: string
  caseName?: string
  citation?: string
  dateFrom?: string
  dateTo?: string
  maxResults?: number
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) })
  }

  try {
    const courtListenerToken = Deno.env.get('COURTLISTENER_API_TOKEN')
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!courtListenerToken) {
      return new Response(
        JSON.stringify({ error: 'COURTLISTENER_API_TOKEN not configured' }),
        {
          status: 500,
          headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
        }
      )
    }

    const body = await req.json().catch(() => ({}))
    const { op } = body

    switch (op) {
      case 'search': {
        // Search CourtListener for cases
        const searchQuery: SearchQuery = body
        
        if (!searchQuery.query) {
          return new Response(
            JSON.stringify({ error: 'query required' }),
            {
              status: 400,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        // Build CourtListener API URL
        const params = new URLSearchParams()
        params.append('q', searchQuery.query)
        if (searchQuery.court) params.append('court', searchQuery.court)
        if (searchQuery.caseName) params.append('case_name', searchQuery.caseName)
        if (searchQuery.citation) params.append('citation', searchQuery.citation)
        if (searchQuery.dateFrom) params.append('filed_after', searchQuery.dateFrom)
        if (searchQuery.dateTo) params.append('filed_before', searchQuery.dateTo)
        
        const maxResults = searchQuery.maxResults || 10
        params.append('page_size', maxResults.toString())

        const searchUrl = `https://www.courtlistener.com/api/rest/v3/search/?${params.toString()}`

        const searchResponse = await fetch(searchUrl, {
          headers: {
            'Authorization': `Token ${courtListenerToken}`,
            'Content-Type': 'application/json',
          },
        })

        if (!searchResponse.ok) {
          const errorText = await searchResponse.text()
          return new Response(
            JSON.stringify({ error: 'CourtListener search failed', details: errorText }),
            {
              status: 502,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        const searchData = await searchResponse.json()

        return new Response(
          JSON.stringify({ 
            results: searchData.results || [],
            count: searchData.count || 0,
            next: searchData.next,
            previous: searchData.previous,
          }),
          {
            headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
          }
        )
      }

      case 'get_opinion': {
        // Get specific opinion from CourtListener
        const { opinionId } = body
        
        if (!opinionId) {
          return new Response(
            JSON.stringify({ error: 'opinionId required' }),
            {
              status: 400,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        const opinionUrl = `https://www.courtlistener.com/api/rest/v3/opinions/${opinionId}/`

        const opinionResponse = await fetch(opinionUrl, {
          headers: {
            'Authorization': `Token ${courtListenerToken}`,
            'Content-Type': 'application/json',
          },
        })

        if (!opinionResponse.ok) {
          return new Response(
            JSON.stringify({ error: 'Failed to fetch opinion' }),
            {
              status: 502,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        const opinionData = await opinionResponse.json()

        return new Response(
          JSON.stringify({ opinion: opinionData }),
          {
            headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
          }
        )
      }

      case 'get_docket': {
        // Get docket information
        const { docketId } = body
        
        if (!docketId) {
          return new Response(
            JSON.stringify({ error: 'docketId required' }),
            {
              status: 400,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        const docketUrl = `https://www.courtlistener.com/api/rest/v3/dockets/${docketId}/`

        const docketResponse = await fetch(docketUrl, {
          headers: {
            'Authorization': `Token ${courtListenerToken}`,
            'Content-Type': 'application/json',
          },
        })

        if (!docketResponse.ok) {
          return new Response(
            JSON.stringify({ error: 'Failed to fetch docket' }),
            {
              status: 502,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        const docketData = await docketResponse.json()

        return new Response(
          JSON.stringify({ docket: docketData }),
          {
            headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
          }
        )
      }

      case 'summarize': {
        // Generate AI summary of legal text
        const { text, focusArea } = body
        
        if (!text) {
          return new Response(
            JSON.stringify({ error: 'text required for summarization' }),
            {
              status: 400,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        if (!openaiApiKey) {
          return new Response(
            JSON.stringify({ error: 'OPENAI_API_KEY not configured for AI summaries' }),
            {
              status: 500,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        const systemPrompt = focusArea
          ? `You are a legal research assistant. Provide a concise summary of the following legal text, focusing on: ${focusArea}. Include key holdings, reasoning, and relevant precedents.`
          : 'You are a legal research assistant. Provide a concise summary of the following legal text. Include key holdings, reasoning, and relevant precedents.'

        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'authorization': `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: text.substring(0, 10000) }, // Limit text length
            ],
            temperature: 0.3,
            max_tokens: 1000,
          }),
        })

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text()
          return new Response(
            JSON.stringify({ error: 'AI summarization failed', details: errorText }),
            {
              status: 502,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        const aiData = await aiResponse.json()
        const summary = aiData?.choices?.[0]?.message?.content || ''

        return new Response(
          JSON.stringify({ summary, usage: aiData.usage }),
          {
            headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
          }
        )
      }

      case 'search_and_summarize': {
        // Combined search and AI summary
        const searchQuery: SearchQuery = body
        
        if (!searchQuery.query) {
          return new Response(
            JSON.stringify({ error: 'query required' }),
            {
              status: 400,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        if (!openaiApiKey) {
          return new Response(
            JSON.stringify({ error: 'OPENAI_API_KEY not configured for AI summaries' }),
            {
              status: 500,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        // First, search CourtListener
        const params = new URLSearchParams()
        params.append('q', searchQuery.query)
        if (searchQuery.court) params.append('court', searchQuery.court)
        params.append('page_size', '5')

        const searchUrl = `https://www.courtlistener.com/api/rest/v3/search/?${params.toString()}`

        const searchResponse = await fetch(searchUrl, {
          headers: {
            'Authorization': `Token ${courtListenerToken}`,
            'Content-Type': 'application/json',
          },
        })

        if (!searchResponse.ok) {
          return new Response(
            JSON.stringify({ error: 'CourtListener search failed' }),
            {
              status: 502,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        const searchData = await searchResponse.json()
        const results = searchData.results || []

        // Generate AI summary of search results
        const resultsText = results
          .map((r: any, i: number) => `${i + 1}. ${r.caseName || 'Unknown'}: ${r.snippet || 'No snippet available'}`)
          .join('\n\n')

        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'authorization': `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a legal research assistant. Analyze the following search results and provide a summary of the key legal principles and holdings.',
              },
              { role: 'user', content: `Query: ${searchQuery.query}\n\nResults:\n${resultsText}` },
            ],
            temperature: 0.3,
            max_tokens: 800,
          }),
        })

        if (!aiResponse.ok) {
          // Return results without summary if AI fails
          return new Response(
            JSON.stringify({ 
              results,
              count: searchData.count,
              summary: null,
              error: 'AI summary generation failed',
            }),
            {
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }

        const aiData = await aiResponse.json()
        const summary = aiData?.choices?.[0]?.message?.content || ''

        return new Response(
          JSON.stringify({ 
            results,
            count: searchData.count,
            summary,
            usage: aiData.usage,
          }),
          {
            headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
          }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown operation: ${op}. Valid operations: search, get_opinion, get_docket, summarize, search_and_summarize` }),
          {
            status: 400,
            headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
          }
        )
    }
  } catch (e) {
    console.error('Error in legal-research:', e)
    return new Response(
      JSON.stringify({ error: String(e) }),
      {
        status: 500,
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      }
    )
  }
})
