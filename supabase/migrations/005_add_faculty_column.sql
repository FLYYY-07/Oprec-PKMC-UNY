-- Supabase Migration: Add faculty column to registrations table
-- Run this in Supabase SQL Editor AFTER 004_system_settings_and_user_policies.sql

ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS faculty TEXT;

CREATE INDEX IF NOT EXISTS idx_registrations_faculty ON registrations(faculty);
