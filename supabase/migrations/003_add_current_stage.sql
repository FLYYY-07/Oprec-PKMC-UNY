-- Supabase Migration: Add current_stage column to registrations table
-- Run this in Supabase SQL Editor AFTER 002_storage_and_cv_columns.sql

ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS current_stage TEXT DEFAULT 'seleksi_berkas'
  CHECK (current_stage IN ('seleksi_berkas', 'wawancara', 'welcoming_onboarding'));

-- Backfill any existing rows with default stage
UPDATE registrations
SET current_stage = 'seleksi_berkas'
WHERE current_stage IS NULL;

-- Index for filtering/sorting by stage
CREATE INDEX IF NOT EXISTS idx_registrations_current_stage ON registrations(current_stage);
