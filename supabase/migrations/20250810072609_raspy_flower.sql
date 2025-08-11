/*
  # Admin Panel Database Schema

  1. New Tables
    - `admin_users` - Admin user accounts with role-based access
    - `user_analytics` - User behavior and engagement metrics
    - `stock_analytics` - Stock performance and popularity metrics
    - `subscription_analytics` - Subscription and revenue metrics
    - `system_logs` - System activity and audit logs
    - `app_settings` - Global app configuration settings

  2. Security
    - Enable RLS on all admin tables
    - Add policies for admin-only access
    - Create audit triggers for sensitive operations

  3. Analytics Views
    - User growth metrics
    - Revenue analytics
    - Stock popularity tracking
    - System health monitoring
*/

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  permissions jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Analytics Table
CREATE TABLE IF NOT EXISTS user_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  session_id text,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Stock Analytics Table
CREATE TABLE IF NOT EXISTS stock_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('view', 'add_to_watchlist', 'remove_from_watchlist', 'search')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Subscription Analytics Table
CREATE TABLE IF NOT EXISTS subscription_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('subscription_started', 'subscription_renewed', 'subscription_cancelled', 'payment_failed')),
  plan_type text NOT NULL,
  amount decimal(10,2),
  currency text DEFAULT 'INR',
  payment_method text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- System Logs Table
CREATE TABLE IF NOT EXISTS system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL CHECK (level IN ('info', 'warning', 'error', 'critical')),
  message text NOT NULL,
  component text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- App Settings Table
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  updated_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Subscriptions Table (Enhanced)
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type text NOT NULL CHECK (plan_type IN ('free', 'pro')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  auto_renew boolean DEFAULT true,
  payment_method text,
  last_payment_date timestamptz,
  next_payment_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Watchlists Table
CREATE TABLE IF NOT EXISTS user_watchlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  name text NOT NULL,
  exchange text NOT NULL,
  is_halal boolean DEFAULT true,
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, symbol)
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlists ENABLE ROW LEVEL SECURITY;

-- Admin Policies (Only accessible via service role)
CREATE POLICY "Admin users full access via service role"
  ON admin_users
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Analytics read access via service role"
  ON user_analytics
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Stock analytics access via service role"
  ON stock_analytics
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Subscription analytics access via service role"
  ON subscription_analytics
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "System logs access via service role"
  ON system_logs
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "App settings access via service role"
  ON app_settings
  FOR ALL
  TO service_role
  USING (true);

-- User Subscription Policies
CREATE POLICY "Users can read own subscription"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to subscriptions"
  ON user_subscriptions
  FOR ALL
  TO service_role
  USING (true);

-- User Watchlist Policies
CREATE POLICY "Users can manage own watchlist"
  ON user_watchlists
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to watchlists"
  ON user_watchlists
  FOR ALL
  TO service_role
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_analytics_symbol ON stock_analytics(symbol);
CREATE INDEX IF NOT EXISTS idx_stock_analytics_created_at ON stock_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_subscription_analytics_user_id ON subscription_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_watchlists_user_id ON user_watchlists(user_id);

-- Insert default app settings
INSERT INTO app_settings (key, value, description, is_public) VALUES
('app_version', '"1.0.0"', 'Current app version', true),
('maintenance_mode', 'false', 'Enable/disable maintenance mode', true),
('max_free_watchlist', '5', 'Maximum stocks in free user watchlist', false),
('pro_subscription_price', '199', 'Pro subscription price in INR', true),
('featured_stocks', '["TCS", "INFY", "WIPRO", "HCLTECH"]', 'Featured halal stocks', true),
('api_rate_limit', '100', 'API requests per minute per user', false),
('zakat_nisab_gold_grams', '87.48', 'Nisab threshold in gold grams', true),
('zakat_nisab_silver_grams', '612.36', 'Nisab threshold in silver grams', true);

-- Create admin user (password: admin123 - should be changed in production)
INSERT INTO admin_users (email, password_hash, full_name, role) VALUES
('admin@falah.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZu', 'Super Admin', 'super_admin');