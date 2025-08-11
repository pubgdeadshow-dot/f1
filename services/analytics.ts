import { supabase } from '@/lib/supabase';

export class AnalyticsService {
  // Track user events
  static async trackEvent(eventType: string, eventData: any = {}, sessionId?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('user_analytics').insert({
        user_id: user?.id,
        event_type: eventType,
        event_data: eventData,
        session_id: sessionId,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  // Track stock-related events
  static async trackStockEvent(symbol: string, eventType: 'view' | 'add_to_watchlist' | 'remove_from_watchlist' | 'search', metadata: any = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('stock_analytics').insert({
        symbol,
        event_type: eventType,
        user_id: user?.id,
        metadata,
      });
    } catch (error) {
      console.error('Stock analytics tracking error:', error);
    }
  }

  // Track subscription events
  static async trackSubscriptionEvent(eventType: string, planType: string, amount?: number, metadata: any = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('subscription_analytics').insert({
        user_id: user?.id,
        event_type: eventType,
        plan_type: planType,
        amount,
        currency: 'INR',
        metadata,
      });
    } catch (error) {
      console.error('Subscription analytics tracking error:', error);
    }
  }

  // Log system events
  static async logSystemEvent(level: 'info' | 'warning' | 'error' | 'critical', message: string, component: string, metadata: any = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('system_logs').insert({
        level,
        message,
        component,
        user_id: user?.id,
        metadata,
      });
    } catch (error) {
      console.error('System logging error:', error);
    }
  }

  // Get client IP (mock implementation)
  private static async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return '0.0.0.0';
    }
  }

  // Track app lifecycle events
  static trackAppStart() {
    this.trackEvent('app_start', {
      platform: 'web',
      timestamp: new Date().toISOString(),
    });
  }

  static trackScreenView(screenName: string) {
    this.trackEvent('screen_view', {
      screen_name: screenName,
      timestamp: new Date().toISOString(),
    });
  }

  static trackUserAction(action: string, details: any = {}) {
    this.trackEvent('user_action', {
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  // Watchlist analytics
  static trackWatchlistAdd(symbol: string, stockName: string) {
    this.trackStockEvent(symbol, 'add_to_watchlist', {
      stock_name: stockName,
      timestamp: new Date().toISOString(),
    });
  }

  static trackWatchlistRemove(symbol: string, stockName: string) {
    this.trackStockEvent(symbol, 'remove_from_watchlist', {
      stock_name: stockName,
      timestamp: new Date().toISOString(),
    });
  }

  static trackStockView(symbol: string, stockName: string) {
    this.trackStockEvent(symbol, 'view', {
      stock_name: stockName,
      timestamp: new Date().toISOString(),
    });
  }

  static trackStockSearch(query: string, resultsCount: number) {
    this.trackEvent('stock_search', {
      query,
      results_count: resultsCount,
      timestamp: new Date().toISOString(),
    });
  }

  // Calculator analytics
  static trackCalculatorUse(calculatorType: 'zakat' | 'inheritance', inputs: any, result: any) {
    this.trackEvent('calculator_use', {
      calculator_type: calculatorType,
      inputs,
      result,
      timestamp: new Date().toISOString(),
    });
  }

  // Subscription analytics
  static trackSubscriptionUpgrade(fromPlan: string, toPlan: string, amount: number) {
    this.trackSubscriptionEvent('subscription_started', toPlan, amount, {
      from_plan: fromPlan,
      upgrade: true,
      timestamp: new Date().toISOString(),
    });
  }

  static trackSubscriptionCancel(plan: string, reason?: string) {
    this.trackSubscriptionEvent('subscription_cancelled', plan, 0, {
      reason,
      timestamp: new Date().toISOString(),
    });
  }
}