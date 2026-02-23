-- Club Recruitments feature migration
-- Run in Supabase SQL editor

CREATE TABLE IF NOT EXISTS club_recruitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_name TEXT NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  form_url TEXT NOT NULL,
  departments TEXT[] DEFAULT '{}'::text[],
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (status IN ('open', 'closed'))
);

ALTER TABLE club_recruitments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view club recruitments" ON club_recruitments;
DROP POLICY IF EXISTS "Publishers can insert club recruitments" ON club_recruitments;
DROP POLICY IF EXISTS "Publishers can update club recruitments" ON club_recruitments;
DROP POLICY IF EXISTS "Publishers can delete club recruitments" ON club_recruitments;

CREATE POLICY "Authenticated users can view club recruitments"
  ON club_recruitments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Publishers can insert club recruitments"
  ON club_recruitments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Publishers can update club recruitments"
  ON club_recruitments FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Publishers can delete club recruitments"
  ON club_recruitments FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);
