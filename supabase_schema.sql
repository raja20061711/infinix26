-- INFINIX'26 HACKATHON SUPABASE POSTGRESQL SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TEAMS TABLE
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id VARCHAR(50) UNIQUE NOT NULL,
  team_name VARCHAR(255) NOT NULL,
  leader_name VARCHAR(255) NOT NULL,
  leader_email VARCHAR(255) NOT NULL,
  leader_phone VARCHAR(50) NOT NULL,
  college TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'Computer Science',
  members JSONB NOT NULL DEFAULT '[]'::jsonb,
  selected_theme_id VARCHAR(100),
  attendance_status VARCHAR(50) NOT NULL DEFAULT 'Not Checked In',
  check_in_time TIMESTAMP WITH TIME ZONE,
  checked_in_by VARCHAR(255),
  password_hash TEXT NOT NULL,
  registration_status VARCHAR(50) NOT NULL DEFAULT 'Verified',
  email_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  qr_code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. THEMES TABLE
CREATE TABLE IF NOT EXISTS public.themes (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  domain VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PROBLEM STATEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.problem_statements (
  id VARCHAR(100) PRIMARY KEY,
  ps_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  theme_id VARCHAR(100) REFERENCES public.themes(id) ON DELETE CASCADE,
  pdf_url TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Draft', -- 'Draft', 'Published', 'Unpublished'
  is_published BOOLEAN NOT NULL DEFAULT false,
  rules JSONB DEFAULT '[]'::jsonb,
  resources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'General',
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. EVENT CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS public.event_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initialize Default Theme Selection Lock Status (Locked by default)
INSERT INTO public.event_config (key, value)
VALUES ('theme_selection_enabled', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_config ENABLE ROW LEVEL SECURITY;

-- ADMIN FULL PRIVILEGES (Authenticated users with role 'admin' or auth uid)
CREATE POLICY "Admins have full control over teams" ON public.teams
  FOR ALL USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins have full control over themes" ON public.themes
  FOR ALL USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins have full control over problem statements" ON public.problem_statements
  FOR ALL USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins have full control over announcements" ON public.announcements
  FOR ALL USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

-- STUDENT RESTRICTED PRIVILEGES

-- 1. Students can view published themes
CREATE POLICY "Students can read active themes" ON public.themes
  FOR SELECT USING (true);

-- 2. Students can view ONLY published problem statements
CREATE POLICY "Students can read ONLY published problem statements" ON public.problem_statements
  FOR SELECT USING (status = 'Published' AND is_published = true);

-- 3. Students can read published announcements
CREATE POLICY "Students can read published announcements" ON public.announcements
  FOR SELECT USING (is_published = true);

-- 4. Student Teams can read and update their OWN team row (Theme selection submission)
CREATE POLICY "Students can read their own team data" ON public.teams
  FOR SELECT USING (team_id = current_setting('request.jwt.claims', true)::json ->> 'team_id');

CREATE POLICY "Students can update their own team theme selection" ON public.teams
  FOR UPDATE USING (team_id = current_setting('request.jwt.claims', true)::json ->> 'team_id');
