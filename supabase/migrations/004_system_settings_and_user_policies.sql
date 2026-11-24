-- Supabase Migration: Create system_settings table & allow user delete policy
-- Run this in Supabase SQL Editor AFTER 003_add_current_stage.sql

-- 1. Create system_settings table for global flags (e.g., lock_registrations)
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default value for lock_registrations (false = Edit Pendaftar Dibuka)
INSERT INTO system_settings (key, value)
VALUES ('lock_registrations', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read system_settings" ON system_settings;
CREATE POLICY "Allow read system_settings" ON system_settings
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow write system_settings" ON system_settings;
CREATE POLICY "Allow write system_settings" ON system_settings
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT ALL ON system_settings TO anon, authenticated;

-- 2. Allow authenticated delete on registrations (for cancel registration feature)
DROP POLICY IF EXISTS "Allow authenticated delete" ON registrations;
CREATE POLICY "Allow authenticated delete" ON registrations
  FOR DELETE TO authenticated
  USING (true);
