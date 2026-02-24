-- Roommate dummy data seed
-- Run in Supabase SQL Editor after setup-db.sql and rls.sql.
-- This updates existing users and upserts preferences for them.

-- Make script safe even if the indirect-fields migration was not run yet.
ALTER TABLE preferences ADD COLUMN IF NOT EXISTS study_style TEXT;
ALTER TABLE preferences ADD COLUMN IF NOT EXISTS conflict_style TEXT;
ALTER TABLE preferences ADD COLUMN IF NOT EXISTS routine_flexibility TEXT;
ALTER TABLE preferences ADD COLUMN IF NOT EXISTS social_energy TEXT;

WITH seed AS (
  SELECT *
  FROM (
    VALUES
      (1, 'Aarav Menon', 'Computer Science', '3rd Year', 'Builder who likes clean shared spaces and quiet evenings.', 8, 3, 'early_bird', 4500, 7000, false, false, 'rarely', 'North Campus', 'solo', 'direct', 'strict', 'quiet'),
      (2, 'Diya Nair', 'ECE', '2nd Year', 'Friendly, social, and structured about schedules.', 7, 5, 'normal', 5000, 8500, false, true, 'sometimes', 'Main Gate', 'pair', 'calm', 'balanced', 'balanced'),
      (3, 'Kiran Patel', 'Mechanical', '4th Year', 'Project-heavy semester, prefers calm study nights.', 9, 2, 'night_owl', 6000, 9000, false, false, 'rarely', 'South Block', 'solo', 'calm', 'strict', 'quiet'),
      (4, 'Neha Reddy', 'Biotech', '1st Year', 'Organized and easy-going roommate, loves pets.', 6, 4, 'normal', 4000, 6500, false, true, 'sometimes', 'Lake View', 'pair', 'mediated', 'balanced', 'balanced'),
      (5, 'Rohit Sharma', 'Civil', '3rd Year', 'Sports and classes, low-noise room preferred.', 7, 3, 'early_bird', 5500, 8000, false, false, 'rarely', 'North Campus', 'solo', 'direct', 'strict', 'quiet'),
      (6, 'Sana Ali', 'CSE (AI)', '2nd Year', 'Hackathons on weekends, respectful of boundaries.', 6, 6, 'night_owl', 6500, 10000, false, false, 'often', 'Tech Park', 'group', 'calm', 'flexible', 'social'),
      (7, 'Pranav Iyer', 'EEE', '4th Year', 'Minimalist setup, early mornings, no smoking.', 9, 2, 'early_bird', 5000, 7500, false, false, 'rarely', 'Main Gate', 'solo', 'direct', 'strict', 'quiet'),
      (8, 'Meera Joseph', 'Architecture', '3rd Year', 'Creative schedule, prefers moderate noise and flexible timing.', 5, 6, 'night_owl', 7000, 11000, true, true, 'often', 'City Center', 'group', 'mediated', 'flexible', 'social'),
      (9, 'Vikram Rao', 'Information Science', '2nd Year', 'Balanced routine, likes a neat and practical room.', 8, 4, 'normal', 5500, 8500, false, false, 'sometimes', 'South Block', 'pair', 'calm', 'balanced', 'balanced'),
      (10, 'Ananya Das', 'Mathematics', '1st Year', 'Quiet, focused, and highly organized.', 10, 1, 'early_bird', 4500, 7000, false, false, 'rarely', 'Lake View', 'solo', 'direct', 'strict', 'quiet'),
      (11, 'Harish Kumar', 'MBA', '4th Year', 'Team player, comfortable with occasional guests.', 6, 5, 'normal', 8000, 13000, false, false, 'often', 'City Center', 'group', 'calm', 'flexible', 'social'),
      (12, 'Nisha Verma', 'Physics', '3rd Year', 'Research-oriented schedule, prefers tidy common spaces.', 8, 3, 'night_owl', 6000, 9500, false, false, 'sometimes', 'Tech Park', 'pair', 'calm', 'balanced', 'quiet')
  ) AS t(
    seed_id,
    full_name,
    major,
    year,
    bio,
    cleanliness_level,
    noise_level,
    sleep_schedule,
    budget_min,
    budget_max,
    smoking,
    pets,
    guests_frequency,
    preferred_location,
    study_style,
    conflict_style,
    routine_flexibility,
    social_energy
  )
),
ranked_users AS (
  SELECT
    id,
    email,
    ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM users
),
assigned AS (
  SELECT
    u.id AS user_id,
    u.email,
    s.full_name,
    s.major,
    s.year,
    s.bio,
    s.cleanliness_level,
    s.noise_level,
    s.sleep_schedule,
    s.budget_min,
    s.budget_max,
    s.smoking,
    s.pets,
    s.guests_frequency,
    s.preferred_location,
    s.study_style,
    s.conflict_style,
    s.routine_flexibility,
    s.social_energy
  FROM ranked_users u
  JOIN seed s
    ON (((u.rn - 1) % 12) + 1) = s.seed_id
)
UPDATE users u
SET
  full_name = COALESCE(u.full_name, a.full_name),
  major = COALESCE(u.major, a.major),
  year = COALESCE(u.year, a.year),
  bio = COALESCE(u.bio, a.bio),
  updated_at = NOW()
FROM assigned a
WHERE u.id = a.user_id;

WITH seed AS (
  SELECT *
  FROM (
    VALUES
      (1, 'Aarav Menon', 'Computer Science', '3rd Year', 'Builder who likes clean shared spaces and quiet evenings.', 8, 3, 'early_bird', 4500, 7000, false, false, 'rarely', 'North Campus', 'solo', 'direct', 'strict', 'quiet'),
      (2, 'Diya Nair', 'ECE', '2nd Year', 'Friendly, social, and structured about schedules.', 7, 5, 'normal', 5000, 8500, false, true, 'sometimes', 'Main Gate', 'pair', 'calm', 'balanced', 'balanced'),
      (3, 'Kiran Patel', 'Mechanical', '4th Year', 'Project-heavy semester, prefers calm study nights.', 9, 2, 'night_owl', 6000, 9000, false, false, 'rarely', 'South Block', 'solo', 'calm', 'strict', 'quiet'),
      (4, 'Neha Reddy', 'Biotech', '1st Year', 'Organized and easy-going roommate, loves pets.', 6, 4, 'normal', 4000, 6500, false, true, 'sometimes', 'Lake View', 'pair', 'mediated', 'balanced', 'balanced'),
      (5, 'Rohit Sharma', 'Civil', '3rd Year', 'Sports and classes, low-noise room preferred.', 7, 3, 'early_bird', 5500, 8000, false, false, 'rarely', 'North Campus', 'solo', 'direct', 'strict', 'quiet'),
      (6, 'Sana Ali', 'CSE (AI)', '2nd Year', 'Hackathons on weekends, respectful of boundaries.', 6, 6, 'night_owl', 6500, 10000, false, false, 'often', 'Tech Park', 'group', 'calm', 'flexible', 'social'),
      (7, 'Pranav Iyer', 'EEE', '4th Year', 'Minimalist setup, early mornings, no smoking.', 9, 2, 'early_bird', 5000, 7500, false, false, 'rarely', 'Main Gate', 'solo', 'direct', 'strict', 'quiet'),
      (8, 'Meera Joseph', 'Architecture', '3rd Year', 'Creative schedule, prefers moderate noise and flexible timing.', 5, 6, 'night_owl', 7000, 11000, true, true, 'often', 'City Center', 'group', 'mediated', 'flexible', 'social'),
      (9, 'Vikram Rao', 'Information Science', '2nd Year', 'Balanced routine, likes a neat and practical room.', 8, 4, 'normal', 5500, 8500, false, false, 'sometimes', 'South Block', 'pair', 'calm', 'balanced', 'balanced'),
      (10, 'Ananya Das', 'Mathematics', '1st Year', 'Quiet, focused, and highly organized.', 10, 1, 'early_bird', 4500, 7000, false, false, 'rarely', 'Lake View', 'solo', 'direct', 'strict', 'quiet'),
      (11, 'Harish Kumar', 'MBA', '4th Year', 'Team player, comfortable with occasional guests.', 6, 5, 'normal', 8000, 13000, false, false, 'often', 'City Center', 'group', 'calm', 'flexible', 'social'),
      (12, 'Nisha Verma', 'Physics', '3rd Year', 'Research-oriented schedule, prefers tidy common spaces.', 8, 3, 'night_owl', 6000, 9500, false, false, 'sometimes', 'Tech Park', 'pair', 'calm', 'balanced', 'quiet')
  ) AS t(
    seed_id,
    full_name,
    major,
    year,
    bio,
    cleanliness_level,
    noise_level,
    sleep_schedule,
    budget_min,
    budget_max,
    smoking,
    pets,
    guests_frequency,
    preferred_location,
    study_style,
    conflict_style,
    routine_flexibility,
    social_energy
  )
),
ranked_users AS (
  SELECT
    id,
    email,
    ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM users
),
assigned AS (
  SELECT
    u.id AS user_id,
    u.email,
    s.full_name,
    s.major,
    s.year,
    s.bio,
    s.cleanliness_level,
    s.noise_level,
    s.sleep_schedule,
    s.budget_min,
    s.budget_max,
    s.smoking,
    s.pets,
    s.guests_frequency,
    s.preferred_location,
    s.study_style,
    s.conflict_style,
    s.routine_flexibility,
    s.social_energy
  FROM ranked_users u
  JOIN seed s
    ON (((u.rn - 1) % 12) + 1) = s.seed_id
)
INSERT INTO preferences (
  user_id,
  cleanliness_level,
  noise_level,
  sleep_schedule,
  budget_min,
  budget_max,
  smoking,
  pets,
  guests_frequency,
  preferred_location,
  study_style,
  conflict_style,
  routine_flexibility,
  social_energy,
  updated_at
)
SELECT
  a.user_id,
  a.cleanliness_level,
  a.noise_level,
  a.sleep_schedule,
  a.budget_min,
  a.budget_max,
  a.smoking,
  a.pets,
  a.guests_frequency,
  a.preferred_location,
  a.study_style,
  a.conflict_style,
  a.routine_flexibility,
  a.social_energy,
  NOW()
FROM assigned a
ON CONFLICT (user_id) DO UPDATE SET
  cleanliness_level = EXCLUDED.cleanliness_level,
  noise_level = EXCLUDED.noise_level,
  sleep_schedule = EXCLUDED.sleep_schedule,
  budget_min = EXCLUDED.budget_min,
  budget_max = EXCLUDED.budget_max,
  smoking = EXCLUDED.smoking,
  pets = EXCLUDED.pets,
  guests_frequency = EXCLUDED.guests_frequency,
  preferred_location = EXCLUDED.preferred_location,
  study_style = EXCLUDED.study_style,
  conflict_style = EXCLUDED.conflict_style,
  routine_flexibility = EXCLUDED.routine_flexibility,
  social_energy = EXCLUDED.social_energy,
  updated_at = NOW();

-- Quick check
SELECT
  u.email,
  u.full_name,
  p.cleanliness_level,
  p.noise_level,
  p.sleep_schedule,
  p.budget_min,
  p.budget_max
FROM users u
JOIN preferences p ON p.user_id = u.id
ORDER BY u.created_at;
