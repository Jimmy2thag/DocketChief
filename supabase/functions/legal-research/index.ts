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
    const courtListenerToken = Deno.env.get('COURTLISTENER_API_TOKEN')
    
    const body = await req.json().catch(() => ({}))
    const { query, jurisdiction, dateRange, caseType, citationFormat, fullText } = body

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Query is required' 
      }), {
        status: 400,
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      })
    }

    // If CourtListener API token is available, use it
    if (courtListenerToken) {
      try {
        const searchParams = new URLSearchParams({
          q: query,
          type: 'o', // opinions
        })
        
        if (jurisdiction && jurisdiction !== 'all') {
          searchParams.append('court', jurisdiction)
        }
        
        if (dateRange?.start) {
          searchParams.append('filed_after', dateRange.start)
        }
        
        if (dateRange?.end) {
          searchParams.append('filed_before', dateRange.end)
        }

        const response = await fetch(
          `https://www.courtlistener.com/api/rest/v4/search/?${searchParams.toString()}`,
          {
            headers: {
              'Authorization': `Token ${courtListenerToken}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          throw new Error(`CourtListener API error: ${response.status}`)
        }

        const data = await response.json()
        
        // Transform CourtListener results to match our interface
        const results = (data.results || []).slice(0, 10).map((item: any, index: number) => ({
          id: String(item.id || index),
          title: item.caseName || item.case_name || 'Untitled Case',
          citation: item.citation?.[0] || 'No citation',
          parsedCitation: item.citation?.join(', ') || item.citation?.[0] || 'No citation',
          court: item.court || 'Unknown Court',
          date: item.dateFiled || item.date_filed || new Date().toISOString().split('T')[0],
          summary: item.snippet || 'No summary available',
          docketNumber: item.docketNumber || item.docket_number || 'N/A',
          status: item.precedential_status || 'Published',
          citeCount: item.citeCount || item.citation_count || 0,
          relevanceScore: Math.floor((item.score || 0.5) * 100),
          url: item.absolute_url ? `https://www.courtlistener.com${item.absolute_url}` : undefined,
        }))

        return new Response(JSON.stringify({
          success: true,
          results,
          totalResults: data.count || results.length,
        }), {
          headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
        })
      } catch (apiError) {
        console.error('CourtListener API error:', apiError)
        // Fall through to mock response if API fails
      }
    }

    // Mock response if no API token or if API call fails
    return new Response(JSON.stringify({
      success: false,
      error: 'CourtListener API integration not configured. Set COURTLISTENER_API_TOKEN environment variable.',
      results: [],
      totalResults: 0,
    }), {
      status: 503,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })

  } catch (e) {
    console.error('Legal research error:', e);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error',
      results: [],
      totalResults: 0,
    }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })
  }
})
