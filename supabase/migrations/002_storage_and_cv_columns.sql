-- Supabase Migration: Add CV/Portfolio columns, Storage bucket, and RLS policies
-- Run this in Supabase SQL Editor AFTER 001_create_registrations.sql

-- 1. Add cv_url and portfolio_url columns to registrations table
ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS cv_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT;

-- 2. Drop old policies if they already exist (prevents conflicts)
DROP POLICY IF EXISTS "Allow authenticated upload own CV" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload own portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read own CV" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read own portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update own CV" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update own portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete own CV" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete own portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated admin read all registration files" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload registration documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow read registration documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow update registration documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete registration documents" ON storage.objects;

DROP POLICY IF EXISTS "Allow public registration inserts" ON registrations;
DROP POLICY IF EXISTS "Allow authenticated registration inserts" ON registrations;
DROP POLICY IF EXISTS "Allow authenticated read" ON registrations;
DROP POLICY IF EXISTS "Allow registration inserts" ON registrations;
DROP POLICY IF EXISTS "Allow read registrations" ON registrations;

-- 3. Storage RLS Policies for 'registrations' bucket
CREATE POLICY "Allow upload registration documents"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'registrations'
  AND (storage.foldername(name))[1] IN ('cv', 'portfolio')
);

CREATE POLICY "Allow read registration documents"
ON storage.objects FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'registrations'
  AND (storage.foldername(name))[1] IN ('cv', 'portfolio')
);

CREATE POLICY "Allow update registration documents"
ON storage.objects FOR UPDATE TO anon, authenticated
USING (
  bucket_id = 'registrations'
  AND (storage.foldername(name))[1] IN ('cv', 'portfolio')
);

CREATE POLICY "Allow delete registration documents"
ON storage.objects FOR DELETE TO anon, authenticated
USING (
  bucket_id = 'registrations'
  AND (storage.foldername(name))[1] IN ('cv', 'portfolio')
);

-- 4. Table RLS Policies for 'registrations' (fixes code 42501 on POST /api/register)
CREATE POLICY "Allow registration inserts"
ON registrations FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow read registrations"
ON registrations FOR SELECT TO anon, authenticated
USING (true);

-- 5. Indexes for cv_url and portfolio_url lookups
CREATE INDEX IF NOT EXISTS idx_registrations_cv_url ON registrations(cv_url) WHERE cv_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_registrations_portfolio_url ON registrations(portfolio_url) WHERE portfolio_url IS NOT NULL;

-- 6. Grant permissions
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT ALL ON storage.objects TO anon, authenticated;
GRANT ALL ON storage.buckets TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON registrations TO anon, authenticated;