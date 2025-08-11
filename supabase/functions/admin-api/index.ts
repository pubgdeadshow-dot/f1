import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface AdminRequest {
  action: string;
  data?: any;
  filters?: any;
  pagination?: {
    page: number;
    limit: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify admin authentication
    const token = authHeader.replace('Bearer ', '')
    const { data: adminUser, error: authError } = await supabaseClient
      .from('admin_users')
      .select('*')
      .eq('id', token)
      .eq('is_active', true)
      .single()

    if (authError || !adminUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, data, filters, pagination }: AdminRequest = await req.json()

    let result;

    switch (action) {
      case 'get_dashboard_stats':
        result = await getDashboardStats(supabaseClient)
        break

      case 'get_users':
        result = await getUsers(supabaseClient, filters, pagination)
        break

      case 'get_user_details':
        result = await getUserDetails(supabaseClient, data.userId)
        break

      case 'update_user':
        result = await updateUser(supabaseClient, data.userId, data.updates)
        break

      case 'get_subscriptions':
        result = await getSubscriptions(supabaseClient, filters, pagination)
        break

      case 'update_subscription':
        result = await updateSubscription(supabaseClient, data.subscriptionId, data.updates)
        break

      case 'get_analytics':
        result = await getAnalytics(supabaseClient, data.type, data.dateRange)
        break

      case 'get_system_logs':
        result = await getSystemLogs(supabaseClient, filters, pagination)
        break

      case 'get_app_settings':
        result = await getAppSettings(supabaseClient)
        break

      case 'update_app_setting':
        result = await updateAppSetting(supabaseClient, data.key, data.value, adminUser.id)
        break

      case 'get_stock_analytics':
        result = await getStockAnalytics(supabaseClient, filters, pagination)
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Admin API Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function getDashboardStats(supabase: any) {
  const [
    { count: totalUsers },
    { count: activeSubscriptions },
    { count: totalWatchlistItems },
    { count: todaySignups }
  ] = await Promise.all([
    supabase.from('auth.users').select('*', { count: 'exact', head: true }),
    supabase.from('user_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('user_watchlists').select('*', { count: 'exact', head: true }),
    supabase.from('auth.users').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date().toISOString().split('T')[0])
  ])

  // Calculate revenue
  const { data: revenueData } = await supabase
    .from('subscription_analytics')
    .select('amount')
    .eq('event_type', 'subscription_started')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const monthlyRevenue = revenueData?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0

  return {
    totalUsers,
    activeSubscriptions,
    totalWatchlistItems,
    todaySignups,
    monthlyRevenue,
    conversionRate: totalUsers > 0 ? ((activeSubscriptions / totalUsers) * 100).toFixed(2) : 0
  }
}

async function getUsers(supabase: any, filters: any = {}, pagination: any = { page: 1, limit: 20 }) {
  const { page, limit } = pagination
  const offset = (page - 1) * limit

  let query = supabase
    .from('auth.users')
    .select(`
      *,
      user_subscriptions(*)
    `)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  if (filters.search) {
    query = query.or(`email.ilike.%${filters.search}%,raw_user_meta_data->full_name.ilike.%${filters.search}%`)
  }

  if (filters.subscriptionStatus) {
    query = query.eq('user_subscriptions.status', filters.subscriptionStatus)
  }

  const { data, error, count } = await query

  if (error) throw error

  return {
    users: data,
    totalCount: count,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page
  }
}

async function getUserDetails(supabase: any, userId: string) {
  const { data: user, error: userError } = await supabase
    .from('auth.users')
    .select(`
      *,
      user_subscriptions(*),
      user_watchlists(*),
      user_analytics(*)
    `)
    .eq('id', userId)
    .single()

  if (userError) throw userError

  // Get user activity stats
  const { data: activityStats } = await supabase
    .from('user_analytics')
    .select('event_type')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const activitySummary = activityStats?.reduce((acc: any, item: any) => {
    acc[item.event_type] = (acc[item.event_type] || 0) + 1
    return acc
  }, {}) || {}

  return {
    user,
    activitySummary
  }
}

async function updateUser(supabase: any, userId: string, updates: any) {
  const { data, error } = await supabase
    .from('auth.users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error

  // Log the admin action
  await supabase.from('system_logs').insert({
    level: 'info',
    message: `User ${userId} updated`,
    component: 'admin_panel',
    metadata: { updates, userId }
  })

  return data
}

async function getSubscriptions(supabase: any, filters: any = {}, pagination: any = { page: 1, limit: 20 }) {
  const { page, limit } = pagination
  const offset = (page - 1) * limit

  let query = supabase
    .from('user_subscriptions')
    .select(`
      *,
      auth.users(email, raw_user_meta_data)
    `)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.planType) {
    query = query.eq('plan_type', filters.planType)
  }

  const { data, error, count } = await query

  if (error) throw error

  return {
    subscriptions: data,
    totalCount: count,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page
  }
}

async function updateSubscription(supabase: any, subscriptionId: string, updates: any) {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .update(updates)
    .eq('id', subscriptionId)
    .select()
    .single()

  if (error) throw error

  return data
}

async function getAnalytics(supabase: any, type: string, dateRange: any) {
  const { startDate, endDate } = dateRange

  let query;
  switch (type) {
    case 'user_growth':
      query = supabase
        .from('auth.users')
        .select('created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
      break

    case 'revenue':
      query = supabase
        .from('subscription_analytics')
        .select('amount, created_at')
        .eq('event_type', 'subscription_started')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
      break

    case 'engagement':
      query = supabase
        .from('user_analytics')
        .select('event_type, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
      break

    default:
      throw new Error('Invalid analytics type')
  }

  const { data, error } = await query

  if (error) throw error

  return data
}

async function getSystemLogs(supabase: any, filters: any = {}, pagination: any = { page: 1, limit: 50 }) {
  const { page, limit } = pagination
  const offset = (page - 1) * limit

  let query = supabase
    .from('system_logs')
    .select('*')
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  if (filters.level) {
    query = query.eq('level', filters.level)
  }

  if (filters.component) {
    query = query.eq('component', filters.component)
  }

  const { data, error, count } = await query

  if (error) throw error

  return {
    logs: data,
    totalCount: count,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page
  }
}

async function getAppSettings(supabase: any) {
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .order('key')

  if (error) throw error

  return data
}

async function updateAppSetting(supabase: any, key: string, value: any, adminId: string) {
  const { data, error } = await supabase
    .from('app_settings')
    .upsert({
      key,
      value,
      updated_by: adminId,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error

  // Log the setting change
  await supabase.from('system_logs').insert({
    level: 'info',
    message: `App setting '${key}' updated`,
    component: 'admin_panel',
    admin_id: adminId,
    metadata: { key, value }
  })

  return data
}

async function getStockAnalytics(supabase: any, filters: any = {}, pagination: any = { page: 1, limit: 20 }) {
  const { page, limit } = pagination
  const offset = (page - 1) * limit

  // Get popular stocks
  const { data: popularStocks, error } = await supabase
    .from('stock_analytics')
    .select('symbol, event_type')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  if (error) throw error

  // Aggregate by symbol
  const stockStats = popularStocks?.reduce((acc: any, item: any) => {
    if (!acc[item.symbol]) {
      acc[item.symbol] = { symbol: item.symbol, views: 0, adds: 0, searches: 0 }
    }
    
    switch (item.event_type) {
      case 'view':
        acc[item.symbol].views++
        break
      case 'add_to_watchlist':
        acc[item.symbol].adds++
        break
      case 'search':
        acc[item.symbol].searches++
        break
    }
    
    return acc
  }, {}) || {}

  const sortedStocks = Object.values(stockStats)
    .sort((a: any, b: any) => (b.views + b.adds + b.searches) - (a.views + a.adds + a.searches))
    .slice(offset, offset + limit)

  return {
    stocks: sortedStocks,
    totalCount: Object.keys(stockStats).length,
    totalPages: Math.ceil(Object.keys(stockStats).length / limit),
    currentPage: page
  }
}