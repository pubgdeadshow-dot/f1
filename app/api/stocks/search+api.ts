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
    const query = url.searchParams.get('q');
    
    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Search query must be at least 2 characters' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

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

    // Upstox API endpoint for instrument search
    const upstoxResponse = await fetch(
      `https://api.upstox.com/v2/search/instruments?query=${encodeURIComponent(query)}`,
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
    
    // Transform and filter results for NSE/BSE equity stocks only
    const transformedData = (upstoxData.data || [])
      .filter((item: any) => 
        (item.exchange === 'NSE' || item.exchange === 'BSE') && 
        item.instrument_type === 'EQ'
      )
      .slice(0, 20) // Limit to 20 results
      .map((item: any) => ({
        symbol: item.tradingsymbol,
        name: item.name,
        exchange: item.exchange,
        instrumentKey: item.instrument_key,
        isin: item.isin,
      }));

    return new Response(
      JSON.stringify({
        success: true,
        data: transformedData,
        query,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error searching stocks:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to search stocks',
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