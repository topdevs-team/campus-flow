-- Resume V1 migration (LaTeX wizard)
ALTER TABLE resumes
  ADD COLUMN IF NOT EXISTS template_id TEXT NOT NULL DEFAULT 'classic',
  ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]'::jsonb;

-- Ensure updated_at is refreshed during writes from API
-- (handled in app layer via explicit updated_at writes)
