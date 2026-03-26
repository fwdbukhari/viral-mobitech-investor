-- Run this SQL in your Supabase project
-- Go to supabase.com → your project → SQL Editor → paste and run

CREATE TABLE IF NOT EXISTS admin_credentials (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS investors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  share_percent NUMERIC DEFAULT 30,
  email TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS months (
  id TEXT PRIMARY KEY,
  month TEXT NOT NULL,
  fiscal_year TEXT NOT NULL,
  ads_revenue NUMERIC DEFAULT 0,
  subscriptions NUMERIC DEFAULT 0,
  adj_invalid_traffic NUMERIC DEFAULT 0,
  ait_in_marketing BOOLEAN DEFAULT false,
  total_income NUMERIC DEFAULT 0,
  ads_spend NUMERIC DEFAULT 0,
  taxes NUMERIC DEFAULT 0,
  total_marketing NUMERIC DEFAULT 0,
  balance NUMERIC DEFAULT 0,
  investor_share NUMERIC DEFAULT 0,
  pkr_rate NUMERIC DEFAULT 280,
  balance_pkr INTEGER DEFAULT 0,
  investor_share_pkr INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'Pending',
  receipt_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
