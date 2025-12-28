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

interface CaseLawAnalysisRequest {
  caseText: string
  analysisType?: 'summary' | 'precedents' | 'holdings' | 'full' | 'compare'
  compareWith?: string
  jurisdiction?: string
  focusAreas?: string[]
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) })
  }

  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY not configured' }),
        {
          status: 500,
          headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
        }
      )
    }

    const body: CaseLawAnalysisRequest = await req.json().catch(() => ({}))
    
    if (!body.caseText) {
      return new Response(
        JSON.stringify({ error: 'caseText required' }),
        {
          status: 400,
          headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
        }
      )
    }

    const analysisType = body.analysisType || 'full'
    
    // Build appropriate system prompt based on analysis type
    let systemPrompt = ''
    let userPrompt = body.caseText.substring(0, 15000) // Limit text length

    switch (analysisType) {
      case 'summary':
        systemPrompt = `You are a legal analyst. Provide a concise summary of the case law provided. Include:
1. Case name and citation
2. Court and date
3. Key facts
4. Legal issues
5. Holding/Decision
6. Rationale

Be precise and use legal terminology appropriately.`
        break

      case 'precedents':
        systemPrompt = `You are a legal research specialist. Analyze the case law and identify:
1. Key precedents cited
2. How they were applied
3. Any precedents distinguished or overruled
4. The precedential value of this case

Focus on the chain of legal authority.`
        break

      case 'holdings':
        systemPrompt = `You are a legal analyst. Extract and explain the legal holdings from this case. For each holding:
1. State the legal principle clearly
2. Explain the reasoning
3. Identify any limitations or qualifications
4. Note the binding authority

Be thorough and precise.`
        break

      case 'compare':
        if (!body.compareWith) {
          return new Response(
            JSON.stringify({ error: 'compareWith text required for comparison analysis' }),
            {
              status: 400,
              headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
            }
          )
        }
        systemPrompt = `You are a legal analyst comparing two cases. Analyze and compare:
1. Similarities in facts
2. Differences in facts
3. Similar legal issues
4. Different legal issues
5. Consistency or conflict in holdings
6. Potential implications of any differences

Provide a clear comparison matrix.`
        userPrompt = `CASE 1:\n${body.caseText.substring(0, 7000)}\n\n---\n\nCASE 2:\n${body.compareWith.substring(0, 7000)}`
        break

      case 'full':
      default:
        systemPrompt = `You are an expert legal analyst. Provide a comprehensive analysis of this case law including:

1. **Case Information**
   - Name, citation, court, date

2. **Facts**
   - Key factual background
   - Procedural history

3. **Legal Issues**
   - Questions presented
   - Area(s) of law involved

4. **Holdings**
   - Court's decision(s)
   - Legal principles established

5. **Reasoning**
   - Court's analysis
   - Precedents relied upon
   - Policy considerations

6. **Significance**
   - Impact on law
   - Precedential value
   - Practical implications

${body.jurisdiction ? `Focus on implications for ${body.jurisdiction} jurisdiction.` : ''}
${body.focusAreas && body.focusAreas.length > 0 ? `Pay special attention to: ${body.focusAreas.join(', ')}` : ''}

Be thorough, accurate, and use proper legal terminology.`
        break
    }

    // Call OpenAI API
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
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2, // Lower temperature for more consistent legal analysis
        max_tokens: 2000,
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      return new Response(
        JSON.stringify({ error: 'AI analysis failed', details: errorText }),
        {
          status: 502,
          headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
        }
      )
    }

    const aiData = await aiResponse.json()
    const analysis = aiData?.choices?.[0]?.message?.content || ''
    const usage = aiData?.usage || null

    // Extract key information using a follow-up structured extraction if full analysis
    let structuredData = null
    if (analysisType === 'full' || analysisType === 'holdings') {
      const extractionPrompt = `From the following case analysis, extract key information in JSON format with these fields:
- caseName: string
- citation: string (if available)
- court: string
- year: string
- keyHoldings: string[] (array of main legal holdings)
- precedentsCited: string[] (array of cases cited)

Analysis:
${analysis.substring(0, 3000)}

Respond with valid JSON only.`

      const extractionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a data extraction assistant. Respond only with valid JSON.' },
            { role: 'user', content: extractionPrompt },
          ],
          temperature: 0.1,
          max_tokens: 800,
        }),
      })

      if (extractionResponse.ok) {
        const extractionData = await extractionResponse.json()
        const extractionText = extractionData?.choices?.[0]?.message?.content || ''
        
        try {
          // Extract JSON from response (might be wrapped in markdown code blocks)
          const jsonMatch = extractionText.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            structuredData = JSON.parse(jsonMatch[0])
          }
        } catch (e) {
          console.error('Failed to parse structured data:', e)
          // Continue without structured data
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        analysis,
        analysisType,
        structuredData,
        usage,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      }
    )
  } catch (e) {
    console.error('Error in case-law-analysis:', e)
    return new Response(
      JSON.stringify({ error: 'An error occurred processing the case analysis request' }),
      {
        status: 500,
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      }
    )
  }
})
