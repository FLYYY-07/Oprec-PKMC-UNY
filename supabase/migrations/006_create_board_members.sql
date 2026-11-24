-- Supabase Migration: Create board_members table & board-photos public bucket
-- Run this in Supabase SQL Editor AFTER 005_add_faculty_column.sql

-- 1. Create board_members table
CREATE TABLE IF NOT EXISTS board_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  division TEXT NOT NULL CHECK (division IN ('Pengurus Inti', 'Tim System', 'Data', 'Design', 'Public Relation')),
  period TEXT NOT NULL DEFAULT '2025/2026',
  quote TEXT,
  photo_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ordering and filtering
CREATE INDEX IF NOT EXISTS idx_board_members_order ON board_members(display_order ASC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_board_members_division ON board_members(division);

-- Enable RLS
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read board_members" ON board_members;
CREATE POLICY "Allow public read board_members" ON board_members
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated write board_members" ON board_members;
CREATE POLICY "Allow authenticated write board_members" ON board_members
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT ALL ON board_members TO anon, authenticated;

-- 2. Create public storage bucket 'board-photos' if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('board-photos', 'board-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Storage RLS policies for 'board-photos'
DROP POLICY IF EXISTS "Allow public read board-photos" ON storage.objects;
CREATE POLICY "Allow public read board-photos"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'board-photos');

DROP POLICY IF EXISTS "Allow authenticated upload board-photos" ON storage.objects;
CREATE POLICY "Allow authenticated upload board-photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'board-photos');

DROP POLICY IF EXISTS "Allow authenticated update board-photos" ON storage.objects;
CREATE POLICY "Allow authenticated update board-photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'board-photos');

DROP POLICY IF EXISTS "Allow authenticated delete board-photos" ON storage.objects;
CREATE POLICY "Allow authenticated delete board-photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'board-photos');
