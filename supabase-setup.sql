-- PaintQuote Pro - Supabase Setup Script
-- Run this in your Supabase SQL Editor

-- Clean up existing tables (comment out if you want to preserve data)
DROP TABLE IF EXISTS public.quotes CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id SERIAL PRIMARY KEY,
  access_code VARCHAR(50) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  name VARCHAR(255), -- Alias for company_name for compatibility
  phone VARCHAR(50),
  email VARCHAR(255),
  logo_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quotes table with all required fields
CREATE TABLE IF NOT EXISTS public.quotes (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  quote_id VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  address TEXT,
  project_type VARCHAR(100),
  rooms TEXT,
  paint_quality VARCHAR(100),
  prep_work TEXT,
  timeline VARCHAR(100),
  special_requests TEXT,
  walls_sqft INTEGER DEFAULT 0,
  ceilings_sqft INTEGER DEFAULT 0,
  trim_sqft INTEGER DEFAULT 0,
  doors_count INTEGER DEFAULT 0,
  windows_count INTEGER DEFAULT 0,
  priming_sqft INTEGER DEFAULT 0,
  painting_rate DECIMAL(10,2) DEFAULT 2.50,
  priming_rate DECIMAL(10,2) DEFAULT 0.40,
  trim_rate DECIMAL(10,2) DEFAULT 1.92,
  door_rate DECIMAL(10,2) DEFAULT 100.00,
  window_rate DECIMAL(10,2) DEFAULT 25.00,
  walls_rate DECIMAL(10,2) DEFAULT 2.50,
  ceilings_rate DECIMAL(10,2) DEFAULT 2.50,
  walls_paint_cost DECIMAL(10,2) DEFAULT 26.00,
  ceilings_paint_cost DECIMAL(10,2) DEFAULT 25.00,
  trim_paint_cost DECIMAL(10,2) DEFAULT 35.00,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  total_materials DECIMAL(12,2) DEFAULT 0,
  paint_cost DECIMAL(12,2) DEFAULT 0,
  sundries_cost DECIMAL(12,2) DEFAULT 0,
  sundries_percentage INTEGER DEFAULT 12,
  projected_labor DECIMAL(12,2) DEFAULT 0,
  labor_percentage INTEGER DEFAULT 30,
  projected_profit DECIMAL(12,2) DEFAULT 0,
  paint_coverage INTEGER DEFAULT 350,
  tax_rate DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  subtotal DECIMAL(12,2) DEFAULT 0,
  base_cost DECIMAL(12,2),
  markup_percentage DECIMAL(10,2),
  final_price DECIMAL(12,2),
  room_data TEXT,
  room_count INTEGER,
  confirmed_rates TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  conversation_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_access_code ON companies(access_code);
CREATE INDEX IF NOT EXISTS idx_quotes_company_id ON quotes(company_id);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_id ON quotes(quote_id);

-- Insert demo company
INSERT INTO companies (access_code, company_name, name, phone, email) 
VALUES (
  'DEMO2024', 
  'Demo Painting Company',
  'Demo Painting Company', 
  '(555) 123-4567', 
  'demo@paintingcompany.com'
)
ON CONFLICT (access_code) DO UPDATE
SET 
  company_name = EXCLUDED.company_name,
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  updated_at = NOW();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at 
  BEFORE UPDATE ON companies
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
CREATE TRIGGER update_quotes_updated_at 
  BEFORE UPDATE ON quotes
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional but recommended)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for now (adjust for production)
DROP POLICY IF EXISTS "Enable all access for companies" ON public.companies;
CREATE POLICY "Enable all access for companies" ON public.companies
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for quotes" ON public.quotes;
CREATE POLICY "Enable all access for quotes" ON public.quotes
  FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions to anon and authenticated roles
GRANT ALL ON public.companies TO anon, authenticated;
GRANT ALL ON public.quotes TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Verify setup
SELECT 
  'Companies table' as component,
  COUNT(*) as count,
  'Should have at least 1 (demo company)' as expected
FROM companies
UNION ALL
SELECT 
  'Quotes table' as component,
  COUNT(*) as count,
  'Initially 0' as expected
FROM quotes;