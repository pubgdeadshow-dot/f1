const ADMIN_API_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/admin-api`;

class AdminApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async makeRequest(action: string, data?: any, filters?: any, pagination?: any) {
    if (!this.token) {
      throw new Error('No admin token provided');
    }

    const response = await fetch(ADMIN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        action,
        data,
        filters,
        pagination,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  }

  // Dashboard
  async getDashboardStats() {
    return this.makeRequest('get_dashboard_stats');
  }

  // User Management
  async getUsers(filters = {}, pagination = { page: 1, limit: 20 }) {
    return this.makeRequest('get_users', null, filters, pagination);
  }

  async getUserDetails(userId: string) {
    return this.makeRequest('get_user_details', { userId });
  }

  async updateUser(userId: string, updates: any) {
    return this.makeRequest('update_user', { userId, updates });
  }

  // Subscription Management
  async getSubscriptions(filters = {}, pagination = { page: 1, limit: 20 }) {
    return this.makeRequest('get_subscriptions', null, filters, pagination);
  }

  async updateSubscription(subscriptionId: string, updates: any) {
    return this.makeRequest('update_subscription', { subscriptionId, updates });
  }

  // Analytics
  async getAnalytics(type: string, dateRange: { startDate: string; endDate: string }) {
    return this.makeRequest('get_analytics', { type, dateRange });
  }

  async getStockAnalytics(filters = {}, pagination = { page: 1, limit: 20 }) {
    return this.makeRequest('get_stock_analytics', null, filters, pagination);
  }

  // System Management
  async getSystemLogs(filters = {}, pagination = { page: 1, limit: 50 }) {
    return this.makeRequest('get_system_logs', null, filters, pagination);
  }

  async getAppSettings() {
    return this.makeRequest('get_app_settings');
  }

  async updateAppSetting(key: string, value: any) {
    return this.makeRequest('update_app_setting', { key, value });
  }

  // Authentication
  async login(email: string, password: string) {
    // This would typically hash the password and verify against admin_users table
    // For now, using a simple mock implementation
    if (email === 'admin@falah.com' && password === 'admin123') {
      const mockToken = 'admin-token-' + Date.now();
      this.setToken(mockToken);
      return { token: mockToken, user: { email, role: 'super_admin' } };
    }
    throw new Error('Invalid credentials');
  }

  logout() {
    this.token = null;
  }
}

export const adminApi = new AdminApiService();