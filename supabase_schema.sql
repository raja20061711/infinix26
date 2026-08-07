-- INFINIX'26 HACKATHON SUPABASE POSTGRESQL SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Simplified: 7 Tables — registrations, attendance, themes, problem_statements, announcements, chatbot_knowledge, contact_messages

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. REGISTRATIONS TABLE (Replaces old 'teams' — imported from Unstop CSV)
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id VARCHAR(50) UNIQUE NOT NULL,
  team_name VARCHAR(255) NOT NULL,
  team_size INTEGER NOT NULL DEFAULT 4,
  leader_name VARCHAR(255) NOT NULL,
  leader_email VARCHAR(255) NOT NULL,
  leader_phone VARCHAR(50) NOT NULL,
  gender VARCHAR(50),
  college TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'Information Technology',
  year_of_study VARCHAR(50),
  roll_number VARCHAR(100),
  members JSONB NOT NULL DEFAULT '[]'::jsonb,
  accommodation_required BOOLEAN NOT NULL DEFAULT false,
  selected_theme_id VARCHAR(100),
  attendance_status VARCHAR(50) NOT NULL DEFAULT 'Not Checked In',
  check_in_time TIMESTAMP WITH TIME ZONE,
  checked_in_by VARCHAR(255),
  password_hash TEXT NOT NULL DEFAULT 'hackathon2026',
  registration_status VARCHAR(50) NOT NULL DEFAULT 'Verified',
  email_status VARCHAR(50) NOT NULL DEFAULT 'Sent',
  qr_code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ATTENDANCE TABLE (Audit log of check-in events)
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id VARCHAR(50) NOT NULL REFERENCES public.registrations(team_id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'Checked In',
  check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checked_in_by VARCHAR(255) NOT NULL DEFAULT 'Admin',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. THEMES TABLE
CREATE TABLE IF NOT EXISTS public.themes (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  domain VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PROBLEM STATEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.problem_statements (
  id VARCHAR(100) PRIMARY KEY,
  ps_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  theme_id VARCHAR(100) REFERENCES public.themes(id) ON DELETE CASCADE,
  pdf_url TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Draft',
  is_published BOOLEAN NOT NULL DEFAULT false,
  rules JSONB DEFAULT '[]'::jsonb,
  resources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'General',
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CHATBOT KNOWLEDGE TABLE
CREATE TABLE IF NOT EXISTS public.chatbot_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  keywords JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Unread',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- ADMIN FULL PRIVILEGES
CREATE POLICY "Admins have full control over registrations" ON public.registrations
  FOR ALL USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins have full control over attendance" ON public.attendance
  FOR ALL USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins have full control over themes" ON public.themes
  FOR ALL USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins have full control over problem statements" ON public.problem_statements
  FOR ALL USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins have full control over announcements" ON public.announcements
  FOR ALL USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

-- STUDENT RESTRICTED PRIVILEGES

-- Students can view active themes
CREATE POLICY "Students can read active themes" ON public.themes
  FOR SELECT USING (true);

-- Students can view ONLY published problem statements
CREATE POLICY "Students can read ONLY published problem statements" ON public.problem_statements
  FOR SELECT USING (status = 'Published' AND is_published = true);

-- Students can read published announcements
CREATE POLICY "Students can read published announcements" ON public.announcements
  FOR SELECT USING (is_published = true);

-- Students can read their own registration data
CREATE POLICY "Students can read their own registration data" ON public.registrations
  FOR SELECT USING (team_id = current_setting('request.jwt.claims', true)::json ->> 'team_id');

-- Students can update their own registration (theme selection)
CREATE POLICY "Students can update their own registration" ON public.registrations
  FOR UPDATE USING (team_id = current_setting('request.jwt.claims', true)::json ->> 'team_id');

-- Public read for chatbot knowledge
CREATE POLICY "Public can read chatbot knowledge" ON public.chatbot_knowledge
  FOR SELECT USING (is_active = true);

-- Public can submit contact messages
CREATE POLICY "Public can submit contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

-- ENABLE SUPABASE REALTIME FOR ANNOUNCEMENTS TABLE
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER TABLE public.announcements REPLICA IDENTITY FULL;
