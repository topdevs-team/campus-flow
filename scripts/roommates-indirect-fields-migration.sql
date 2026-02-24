-- Add indirect-question fields for roommate matching preferences.
-- Run this in Supabase SQL Editor on existing databases.

ALTER TABLE preferences ADD COLUMN IF NOT EXISTS study_style TEXT;
ALTER TABLE preferences ADD COLUMN IF NOT EXISTS conflict_style TEXT;
ALTER TABLE preferences ADD COLUMN IF NOT EXISTS routine_flexibility TEXT;
ALTER TABLE preferences ADD COLUMN IF NOT EXISTS social_energy TEXT;
