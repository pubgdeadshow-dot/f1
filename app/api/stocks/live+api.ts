export async function GET(request: Request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(request.url);
    const symbols = url.searchParams.get('symbols');
    
    if (!symbols) {
      return new Response(
        JSON.stringify({ error: 'Symbols parameter is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    const symbolArray = symbols.split(',');
    const accessToken = process.env.UPSTOX_ACCESS_TOKEN;
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Upstox access token not configured' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Upstox API endpoint for live market data
    const upstoxResponse = await fetch(
      `https://api.upstox.com/v2/market-quote/ltp?symbol=${symbols}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!upstoxResponse.ok) {
      throw new Error(`Upstox API error: ${upstoxResponse.status}`);
    }

    const upstoxData = await upstoxResponse.json();
    
    // Transform Upstox data to our format
    const transformedData = Object.entries(upstoxData.data || {}).map(([symbol, data]: [string, any]) => ({
      symbol: symbol.replace('NSE_EQ|INE', '').replace('BSE_EQ|', ''),
      price: data.last_price || 0,
      change: data.net_change || 0,
      changePercent: data.percent_change || 0,
      volume: data.volume || 0,
      timestamp: new Date().toISOString(),
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: transformedData,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error fetching live prices:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch live stock prices',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}