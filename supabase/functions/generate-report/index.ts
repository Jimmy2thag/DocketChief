import { serve } from "jsr:@supabase/functions"
import { createClient } from 'jsr:@supabase/supabase-js@2'

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
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Supabase configuration missing' 
      }), {
        status: 500,
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await req.json().catch(() => ({}))
    const { reportName, reportType, dateRange, metrics, filters, userId } = body

    if (!reportName || !reportType || !metrics || metrics.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required parameters: reportName, reportType, and metrics' 
      }), {
        status: 400,
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      })
    }

    // Validate user
    if (!userId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'User ID is required' 
      }), {
        status: 401,
        headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
      })
    }

    // Build date filter
    let startDate: string | undefined
    let endDate: string | undefined
    
    if (dateRange) {
      const now = new Date()
      switch (dateRange) {
        case 'last-7-days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
          break
        case 'last-30-days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
          break
        case 'last-90-days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
          break
        case 'last-6-months':
          startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString()
          break
        case 'last-year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString()
          break
      }
      endDate = now.toISOString()
    }

    // Collect data based on selected metrics
    const reportData: any = {
      reportName,
      reportType,
      dateRange,
      generatedAt: new Date().toISOString(),
      userId,
      metrics: {},
    }

    // Fetch data for each metric
    for (const metric of metrics) {
      try {
        switch (metric) {
          case 'case-win-rate': {
            let query = supabase
              .from('cases')
              .select('status, outcome')
              .eq('user_id', userId)
            
            if (startDate) query = query.gte('created_at', startDate)
            if (endDate) query = query.lte('created_at', endDate)
            
            const { data, error } = await query
            
            if (!error && data) {
              const won = data.filter(c => c.outcome === 'won').length
              const total = data.length
              reportData.metrics['case-win-rate'] = {
                winRate: total > 0 ? (won / total * 100).toFixed(2) : 0,
                won,
                total,
              }
            }
            break
          }

          case 'revenue': {
            let query = supabase
              .from('invoices')
              .select('amount, status')
              .eq('user_id', userId)
            
            if (startDate) query = query.gte('created_at', startDate)
            if (endDate) query = query.lte('created_at', endDate)
            
            const { data, error } = await query
            
            if (!error && data) {
              const totalRevenue = data
                .filter(inv => inv.status === 'paid')
                .reduce((sum, inv) => sum + (inv.amount || 0), 0)
              
              reportData.metrics.revenue = {
                totalRevenue,
                invoiceCount: data.length,
              }
            }
            break
          }

          case 'time-tracking': {
            let query = supabase
              .from('time_entries')
              .select('duration_minutes')
              .eq('user_id', userId)
            
            if (startDate) query = query.gte('created_at', startDate)
            if (endDate) query = query.lte('created_at', endDate)
            
            const { data, error } = await query
            
            if (!error && data) {
              const totalMinutes = data.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0)
              reportData.metrics['time-tracking'] = {
                totalHours: (totalMinutes / 60).toFixed(2),
                totalMinutes,
                entries: data.length,
              }
            }
            break
          }

          case 'deadline-compliance': {
            let query = supabase
              .from('deadlines')
              .select('status, due_date, completed_date')
              .eq('user_id', userId)
            
            if (startDate) query = query.gte('created_at', startDate)
            if (endDate) query = query.lte('created_at', endDate)
            
            const { data, error } = await query
            
            if (!error && data) {
              const onTime = data.filter(d => 
                d.status === 'completed' && 
                d.completed_date && 
                d.due_date &&
                new Date(d.completed_date) <= new Date(d.due_date)
              ).length
              
              const total = data.filter(d => d.status === 'completed').length
              
              reportData.metrics['deadline-compliance'] = {
                complianceRate: total > 0 ? (onTime / total * 100).toFixed(2) : 0,
                onTime,
                total,
              }
            }
            break
          }

          // Add more metric cases as needed
          default:
            reportData.metrics[metric] = { 
              status: 'not_implemented',
              message: `Metric "${metric}" data collection not yet implemented` 
            }
        }
      } catch (metricError) {
        console.error(`Error collecting metric ${metric}:`, metricError)
        reportData.metrics[metric] = { 
          error: String(metricError) 
        }
      }
    }

    // Save report to database
    const { data: savedReport, error: saveError } = await supabase
      .from('reports')
      .insert({
        user_id: userId,
        name: reportName,
        type: reportType,
        date_range: dateRange,
        metrics: metrics,
        filters: filters || [],
        data: reportData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving report:', saveError)
      // Continue even if save fails - still return the generated data
    }

    return new Response(JSON.stringify({
      success: true,
      reportData,
      reportId: savedReport?.id,
      message: 'Report generated successfully'
    }), {
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })

  } catch (e) {
    console.error('Report generation error:', e);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    })
  }
})
