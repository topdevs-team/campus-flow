-- Profile: add new columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'English',
  ADD COLUMN IF NOT EXISTS current_cgpa FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS attendance_percent FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credits_completed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS backlogs INTEGER DEFAULT 0;

-- CGPA history per semester (for the graph)
CREATE TABLE IF NOT EXISTS cgpa_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 12),
  cgpa FLOAT NOT NULL CHECK (cgpa >= 0 AND cgpa <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, semester)
);

-- RLS
ALTER TABLE cgpa_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own cgpa_history" ON cgpa_history;
CREATE POLICY "Users can manage own cgpa_history"
  ON cgpa_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
