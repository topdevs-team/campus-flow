-- ============================================================
-- RLS Policies for CampusSync
-- Run this in Supabase SQL Editor AFTER setup-db.sql
-- Safe to re-run: drops existing policies before recreating
-- ============================================================

-- Enable RLS on all tables (idempotent)
ALTER TABLE users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences  ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets      ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdfs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings   ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Drop existing policies (clean slate)
-- ============================================================
DROP POLICY IF EXISTS "Users can view their own profile"        ON users;
DROP POLICY IF EXISTS "Users can update their own profile"      ON users;
DROP POLICY IF EXISTS "Users can insert their own profile"      ON users;
DROP POLICY IF EXISTS "Users can delete their own profile"      ON users;

DROP POLICY IF EXISTS "Users can view their own preferences"    ON preferences;
DROP POLICY IF EXISTS "Users can view all preferences"          ON preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences"  ON preferences;
DROP POLICY IF EXISTS "Users can update their own preferences"  ON preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences"  ON preferences;

DROP POLICY IF EXISTS "Users can view their own matches"        ON matches;
DROP POLICY IF EXISTS "Authenticated users can insert matches"  ON matches;

DROP POLICY IF EXISTS "Users can view their own notes"          ON notes;
DROP POLICY IF EXISTS "Users can insert their own notes"        ON notes;
DROP POLICY IF EXISTS "Users can update their own notes"        ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes"        ON notes;

DROP POLICY IF EXISTS "Users can view their own tickets"        ON tickets;
DROP POLICY IF EXISTS "Users can insert their own tickets"      ON tickets;
DROP POLICY IF EXISTS "Users can update their own tickets"      ON tickets;

DROP POLICY IF EXISTS "Users can view their own resume"         ON resumes;
DROP POLICY IF EXISTS "Users can insert their own resume"       ON resumes;
DROP POLICY IF EXISTS "Users can update their own resume"       ON resumes;

DROP POLICY IF EXISTS "Users can view their own PDFs"           ON pdfs;
DROP POLICY IF EXISTS "Users can insert their own PDFs"         ON pdfs;
DROP POLICY IF EXISTS "Users can delete their own PDFs"         ON pdfs;

DROP POLICY IF EXISTS "Users can view their own embeddings"     ON embeddings;
DROP POLICY IF EXISTS "Users can insert their own embeddings"   ON embeddings;

-- ============================================================
-- USERS
-- Authenticated users can view all profiles (needed for roommate matching)
-- but can only modify their own
-- ============================================================
CREATE POLICY "Authenticated users can view all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON users FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- ============================================================
-- PREFERENCES
-- Authenticated users can view ALL preferences (roommate matching
-- algorithm needs to compare against every other user)
-- ============================================================
CREATE POLICY "Authenticated users can view all preferences"
  ON preferences FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own preferences"
  ON preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
  ON preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- MATCHES
-- Users can see matches they are part of
-- Any authenticated user can create a match (API handles auth)
-- ============================================================
CREATE POLICY "Users can view their own matches"
  ON matches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Authenticated users can insert matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- ============================================================
-- NOTES
-- ============================================================
CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- TICKETS
-- ============================================================
CREATE POLICY "Users can view their own tickets"
  ON tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tickets"
  ON tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets"
  ON tickets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- RESUMES
-- ============================================================
CREATE POLICY "Users can view their own resume"
  ON resumes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resume"
  ON resumes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resume"
  ON resumes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- PDFS
-- ============================================================
CREATE POLICY "Users can view their own PDFs"
  ON pdfs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own PDFs"
  ON pdfs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own PDFs"
  ON pdfs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- EMBEDDINGS
-- ============================================================
CREATE POLICY "Users can view their own embeddings"
  ON embeddings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own embeddings"
  ON embeddings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE user profile on signup (trigger)
-- Runs as postgres so no RLS issues
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
