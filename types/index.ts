export interface User {
  id: string;
  email: string;
  full_name?: string;
  subscription_plan: 'free' | 'pro';
  subscription_expiry?: string;
  created_at: string;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  isHalal?: boolean;
  sector?: string;
  volume?: number;
  timestamp?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'pro';
  is_active: boolean;
  start_date: string;
  expiry_date?: string;
}

export interface ZakatCalculation {
  gold: number;
  silver: number;
  cash: number;
  investments: number;
  total: number;
  zakatAmount: number;
  nisab: number;
}

export interface InheritanceCalculation {
  totalWealth: number;
  debts: number;
  netWealth: number;
  heirs: {
    spouse?: number;
    sons?: number;
    daughters?: number;
    father?: number;
    mother?: number;
  };
  distribution: Record<string, number>;
}

export interface IslamicQuote {
  text: string;
  source: string;
}