const GOLDAPI_URL = process.env.EXPO_PUBLIC_GOLDAPI_URL!;
const GOLDAPI_KEY = process.env.EXPO_PUBLIC_GOLDAPI_KEY!;

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8081';

export const apiService = {
  async getGoldPrice(): Promise<number> {
    try {
      const response = await fetch(GOLDAPI_URL, {
        headers: {
          'x-access-token': GOLDAPI_KEY,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch gold price');
      }
      
      const data = await response.json();
      return data.price_gram_24k; // Price per gram in INR
    } catch (error) {
      console.error('Error fetching gold price:', error);
      return 6850; // Fallback price
    }
  },

  async getLivePrices(symbols: string[]): Promise<any[]> {
    try {
      const symbolsParam = symbols.join(',');
      const response = await fetch(`${API_BASE_URL}/api/stocks/live?symbols=${symbolsParam}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching live prices:', error);
      // Return mock data as fallback
      return symbols.map(symbol => ({
        symbol,
        price: Math.random() * 5000 + 1000,
        change: (Math.random() - 0.5) * 200,
        changePercent: (Math.random() - 0.5) * 10,
        volume: Math.floor(Math.random() * 1000000),
        timestamp: new Date().toISOString(),
      }));
    }
  },

  async searchStocks(query: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stocks/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error searching stocks:', error);
      return [];
    }
  },

  async checkShariahCompliance(symbol: string): Promise<boolean> {
    try {
      // Mock implementation - in production, use Zoya API
      const halalStocks = ['TCS', 'INFY', 'WIPRO', 'HCLTECH'];
      return halalStocks.includes(symbol);
    } catch (error) {
      console.error('Error checking Shariah compliance:', error);
      return false;
    }
  },

  async refreshUpstoxToken(): Promise<string | null> {
    try {
      // In production, implement token refresh logic
      // For now, return the existing token
      return process.env.UPSTOX_ACCESS_TOKEN || null;
    } catch (error) {
      console.error('Error refreshing Upstox token:', error);
      return null;
    }
  },
};