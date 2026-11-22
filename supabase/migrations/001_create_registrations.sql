-- Supabase Migration: Create registrations table
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  student_id TEXT NOT NULL UNIQUE,
  major TEXT NOT NULL,
  batch TEXT NOT NULL,
  motivation TEXT NOT NULL,
  division_preference TEXT NOT NULL,
  division_preferences TEXT[] NOT NULL DEFAULT '{}',
  division_reasons JSONB NOT NULL DEFAULT '{}',
  instagram TEXT NOT NULL,
  linkedin TEXT,
  portfolio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  notes TEXT
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_student_id ON registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_registrations_division ON registrations(division_preference);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for public registration form)
CREATE POLICY "Allow public registration inserts" ON registrations
  FOR INSERT TO anon
  WITH CHECK (true);

-- Policy: Allow authenticated users to read all registrations (for admin panel)
CREATE POLICY "Allow authenticated read" ON registrations
  FOR SELECT TO authenticated
  USING (true);

-- Policy: Allow authenticated users to update status (for admin panel)
CREATE POLICY "Allow authenticated update" ON registrations
  FOR UPDATE TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON registrations TO anon, authenticated;