-- INFINIX'26 HACKATHON — SIMPLIFIED SUPABASE POSTGRESQL SCHEMA
-- RUN THIS IN YOUR SUPABASE DASHBOARD -> SQL EDITOR (https://app.supabase.com)
-- 7 Tables: registrations, attendance, announcements, themes, problem_statements, chatbot_knowledge, contact_messages

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- STEP 1: DROP OLD & UNNECESSARY TABLES (CLEANUP)
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.registrations CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.themes CASCADE;
DROP TABLE IF EXISTS public.problem_statements CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.chatbot_knowledge CASCADE;
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public.event_config CASCADE;

-- STEP 2: CREATE 7 REQUIRED TABLES FOR INFINIX'26

-- 1. REGISTRATIONS TABLE (Replaces old 'teams' — imported from Unstop CSV)
CREATE TABLE public.registrations (
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
  upi_transaction_id VARCHAR(100),
  payment_proof_url TEXT,
  payment_amount NUMERIC,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending Verification',
  attendance_status VARCHAR(50) NOT NULL DEFAULT 'Not Checked In',
  check_in_time TIMESTAMP WITH TIME ZONE,
  checked_in_by VARCHAR(255),
  password_hash TEXT NOT NULL DEFAULT 'hackathon2026',
  registration_status VARCHAR(50) NOT NULL DEFAULT 'Pending Payment Verification',
  email_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  qr_code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ATTENDANCE TABLE (Audit log of check-in events, FK → registrations)
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id VARCHAR(50) NOT NULL REFERENCES public.registrations(team_id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'Checked In',
  check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checked_in_by VARCHAR(255) NOT NULL DEFAULT 'Admin',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. THEMES TABLE (7 Hackathon Domains)
CREATE TABLE public.themes (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  domain VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PROBLEM STATEMENTS TABLE
CREATE TABLE public.problem_statements (
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
CREATE TABLE public.announcements (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'General',
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CHATBOT KNOWLEDGE TABLE (FAQ / Knowledge Base for Moana Chatbot)
CREATE TABLE public.chatbot_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  keywords JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CONTACT MESSAGES TABLE (Contact Form Submissions)
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Unread',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: INSERT SEED DATA

-- Insert 7 Official Themes
INSERT INTO public.themes (id, title, domain, description, is_active) VALUES
('theme-ai', 'Smart Intelligence (AI/ML)', 'Artificial Intelligence & Machine Learning', 'AI, Machine Learning, Computer Vision, NLP, Generative AI', true),
('theme-cyber', 'Secure Computing in Modern World', 'Cybersecurity', 'Cyber Defense, Privacy, Encryption, Threat Detection', true),
('theme-medtech', 'Healthcare & MedTech', 'Biotechnology & Health', 'Digital Health, Medical Devices, Diagnostics, AI Healthcare', true),
('theme-cloud', 'Cloud Computing & DevOps', 'Cloud & Infrastructure', 'Cloud-Native Apps, Microservices, CI/CD, Containerization', true),
('theme-fintech', 'FinTech', 'Financial Technology', 'Smart Banking, Fraud Detection, Digital Payments, Analytics', true),
('theme-open', 'Open Innovation', 'Interdisciplinary', 'Software & Hardware Real-World Innovations', true),
('theme-energy', 'Energy Innovation & Smart Grid', 'EEE & ECE', 'Renewable Energy, Smart Grids, Power Management', true);

-- Insert Default Announcements
INSERT INTO public.announcements (id, title, message, category, is_published) VALUES
('ann-1', '🚀 Registrations Open on Unstop!', 'Registration via Unstop: ₹250 for Internal Ramco Students & ₹350 for External Students.', 'Urgent', true),
('ann-2', '🏆 Total ₹30,000 Prize Pool', 'Compete across 7 exciting hackathon themes & win cash prizes + certificates!', 'Update', true),
('ann-3', '📌 Hardware Notice for Open Innovation', 'Participants working on Hardware/IoT must bring their own components & boards.', 'General', true);

-- Insert Initial Sample Registration
INSERT INTO public.registrations (team_id, team_name, leader_name, leader_email, leader_phone, college, department, members, password_hash, registration_status, email_status) VALUES
('INF-2026-001', 'Cyber Voyagers', 'Arun Kumar', 'raja20061711@gmail.com', '+91 98765 43210', 'Ramco Institute of Technology', 'Information Technology', '[{"name": "Arun Kumar", "email": "raja20061711@gmail.com", "role": "Leader"}, {"name": "Priya Sharma", "email": "priya.s@gmail.com", "role": "Member"}]'::jsonb, 'hackathon2026', 'Verified', 'Sent');

-- STEP 4: ROW LEVEL SECURITY & PERMISSIONS (FULL CRUD)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow Public & Authenticated Read/Write/Delete Access for Hackathon App
CREATE POLICY "Public Full Access Registrations" ON public.registrations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access Attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access Themes" ON public.themes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access PS" ON public.problem_statements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access Announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access Chatbot Knowledge" ON public.chatbot_knowledge FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access Contact Messages" ON public.contact_messages FOR ALL USING (true) WITH CHECK (true);

-- Grant Table Access to Anon & Authenticated Roles
GRANT ALL ON TABLE public.registrations TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.attendance TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.themes TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.problem_statements TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.announcements TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.chatbot_knowledge TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.contact_messages TO anon, authenticated, service_role;

-- STEP 5: SUPABASE STORAGE BUCKET CONFIGURATION FOR PAYMENT PROOFS
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow Public Read & Upload Access for payment-proofs Bucket
DROP POLICY IF EXISTS "Public Read Access for Payment Proofs" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Access for Payment Proofs" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Access for Payment Proofs" ON storage.objects;

CREATE POLICY "Public Read Access for Payment Proofs" ON storage.objects FOR SELECT USING (bucket_id = 'payment-proofs');
CREATE POLICY "Public Upload Access for Payment Proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-proofs');
CREATE POLICY "Public Update Access for Payment Proofs" ON storage.objects FOR UPDATE USING (bucket_id = 'payment-proofs');
