ALTER TABLE public.career_experiences
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS end_date date,
  ADD COLUMN IF NOT EXISTS is_current boolean NOT NULL DEFAULT false;