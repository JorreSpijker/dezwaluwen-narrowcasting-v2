-- Database Migration: Add logo_url field to settings table
-- Run these queries in your Supabase SQL editor
-- Safe to run multiple times

-- 1. Add logo_url column for logo uploads (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'settings' AND column_name = 'logo_url') THEN
        ALTER TABLE settings ADD COLUMN logo_url TEXT;
        RAISE NOTICE 'Column logo_url added successfully';
    ELSE
        RAISE NOTICE 'Column logo_url already exists, skipping';
    END IF;
END $$;

-- 2. Create storage bucket for logos (Run in Supabase Dashboard → Storage)
-- Bucket name: 'club-logos'
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/svg+xml, image/webp

-- 3. Set up Row Level Security policy for storage (Run in SQL Editor)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('club-logos', 'club-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "Anyone can upload club logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view club logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update club logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete club logos" ON storage.objects;

-- Create policies for club-logos bucket
CREATE POLICY "Anyone can upload club logos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'club-logos');

CREATE POLICY "Anyone can view club logos" ON storage.objects
FOR SELECT USING (bucket_id = 'club-logos');

CREATE POLICY "Anyone can update club logos" ON storage.objects
FOR UPDATE USING (bucket_id = 'club-logos');

CREATE POLICY "Anyone can delete club logos" ON storage.objects
FOR DELETE USING (bucket_id = 'club-logos');

-- 4. Add theme_color column for custom theme colors
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'settings' AND column_name = 'theme_color') THEN
        ALTER TABLE settings ADD COLUMN theme_color TEXT DEFAULT '#FF6600';
        RAISE NOTICE 'Column theme_color added successfully';
    ELSE
        RAISE NOTICE 'Column theme_color already exists, skipping';
    END IF;
END $$;

-- 6. Add slideshow_enabled column for automatic slide transitions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'settings' AND column_name = 'slideshow_enabled') THEN
        ALTER TABLE settings ADD COLUMN slideshow_enabled BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Column slideshow_enabled added successfully';
    ELSE
        RAISE NOTICE 'Column slideshow_enabled already exists, skipping';
    END IF;
END $$;

-- 7. Add slide_duration column for slide timing (in seconds)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'settings' AND column_name = 'slide_duration') THEN
        ALTER TABLE settings ADD COLUMN slide_duration INTEGER DEFAULT 10;
        RAISE NOTICE 'Column slide_duration added successfully';
    ELSE
        RAISE NOTICE 'Column slide_duration already exists, skipping';
    END IF;
END $$;

-- 8. Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'settings' 
ORDER BY ordinal_position;

-- 9. Check current settings data
SELECT * FROM settings;
