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
    
    if (!courtListenerToken) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'CourtListener API token not configured. Set COURTLISTENER_API_TOKEN environment variable.',
        count: 0,
        results: []
      }), {
        status: 503,
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      })
    }

    const body = await req.json().catch(() => ({}))
    const { searchParams } = body

    if (!searchParams || !searchParams.query) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Search query is required',
        count: 0,
        results: []
      }), {
        status: 400,
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      })
    }

    // Build CourtListener API v4 search parameters
    const params = new URLSearchParams()
    params.append('q', searchParams.query)
    params.append('type', searchParams.type || 'o') // opinions by default
    
    if (searchParams.court) {
      params.append('court', searchParams.court)
    }
    
    if (searchParams.filed_after) {
      params.append('filed_after', searchParams.filed_after)
    }
    
    if (searchParams.filed_before) {
      params.append('filed_before', searchParams.filed_before)
    }
    
    if (searchParams.order_by) {
      params.append('order_by', searchParams.order_by)
    }
    
    if (searchParams.page) {
      params.append('page', searchParams.page.toString())
    }
    
    if (searchParams.page_size) {
      params.append('page_size', searchParams.page_size.toString())
    }

    // Make request to CourtListener API v4
    const response = await fetch(
      `https://www.courtlistener.com/api/rest/v4/search/?${params.toString()}`,
      {
        headers: {
          'Authorization': `Token ${courtListenerToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      return new Response(JSON.stringify({ 
        success: false, 
        error: `CourtListener API error: ${response.status} - ${errorText}`,
        count: 0,
        results: []
      }), {
        status: response.status,
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      })
    }

    const data = await response.json()
    
    // Transform results to match expected format
    const transformedResults = (data.results || []).map((item: any) => ({
      id: String(item.id || ''),
      title: item.caseName || item.case_name || 'Untitled Case',
      court: item.court || 'Unknown Court',
      court_id: item.court_id || item.court || '',
      date_filed: item.dateFiled || item.date_filed || '',
      citation: Array.isArray(item.citation) ? item.citation : (item.citation ? [item.citation] : []),
      docket_number: item.docketNumber || item.docket_number || '',
      snippet: item.snippet || '',
      absolute_url: item.absolute_url || '',
      status: item.precedential_status || item.status || 'Published',
      cite_count: item.citeCount || item.citation_count || 0,
      opinions: item.opinions || [],
      type: searchParams.type || 'o',
    }))

    return new Response(JSON.stringify({
      success: true,
      count: data.count || 0,
      next: data.next || null,
      previous: data.previous || null,
      results: transformedResults,
    }), {
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })

  } catch (e) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: String(e),
      count: 0,
      results: []
    }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })
  }
})
