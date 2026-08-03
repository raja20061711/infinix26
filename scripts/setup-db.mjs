import { createClient } from '@supabase/supabase-js';

const url = 'https://zznpxqtyalvrekqlkpel.supabase.co';
const key = 'sb_publishable_vAzKzuE0elAuVnbPMdxdPA_CjV3Zll_';

const supabase = createClient(url, key);

const DEFAULT_THEMES = [
  { id: 'theme-ai', title: 'Smart Intelligence (AI/ML)', domain: 'Artificial Intelligence & Machine Learning', description: 'AI, Machine Learning, Computer Vision, NLP, Generative AI', is_active: true },
  { id: 'theme-cyber', title: 'Secure Computing in Modern World', domain: 'Cybersecurity', description: 'Cyber Defense, Privacy, Encryption, Threat Detection', is_active: true },
  { id: 'theme-medtech', title: 'Healthcare & MedTech', domain: 'Biotechnology & Health', description: 'Digital Health, Medical Devices, Diagnostics, AI Healthcare', is_active: true },
  { id: 'theme-cloud', title: 'Cloud Computing & DevOps', domain: 'Cloud & Infrastructure', description: 'Cloud-Native Apps, Microservices, CI/CD, Containerization', is_active: true },
  { id: 'theme-fintech', title: 'FinTech', domain: 'Financial Technology', description: 'Smart Banking, Fraud Detection, Digital Payments, Analytics', is_active: true },
  { id: 'theme-open', title: 'Open Innovation', domain: 'Interdisciplinary', description: 'Software & Hardware Real-World Innovations', is_active: true },
  { id: 'theme-energy', title: 'Energy Innovation & Smart Grid', domain: 'EEE & ECE', description: 'Renewable Energy, Smart Grids, Power Management', is_active: true },
];

const DEFAULT_ANNOUNCEMENTS = [
  { id: 'ann-1', title: '🚀 Registrations Open on Unstop!', message: 'Registration via Unstop: ₹250 for Internal Ramco Students & ₹350 for External Students.', category: 'Urgent', is_published: true },
  { id: 'ann-2', title: '🏆 Total ₹30,000 Prize Pool', message: 'Compete across 7 exciting hackathon themes & win cash prizes + certificates!', category: 'Update', is_published: true },
  { id: 'ann-3', title: '📌 Hardware Notice for Open Innovation', message: 'Participants working on Hardware/IoT must bring their own components & boards.', category: 'General', is_published: true },
];

const DEFAULT_TEAMS = [
  {
    team_id: 'INF-2026-001',
    team_name: 'Cyber Voyagers',
    leader_name: 'Arun Kumar',
    leader_email: 'arunkumar@ritrjpm.ac.in',
    leader_phone: '+91 98765 43210',
    college: 'Ramco Institute of Technology',
    department: 'Information Technology',
    members: [
      { name: 'Arun Kumar', email: 'arunkumar@ritrjpm.ac.in', phone: '+91 98765 43210', role: 'Leader' },
      { name: 'Priya Sharma', email: 'priya.s@gmail.com', phone: '+91 98765 43211', role: 'Member' },
    ],
    attendance_status: 'Not Checked In',
    password_hash: 'hackathon2026',
    registration_status: 'Verified',
  },
];

async function setupDatabase() {
  console.log('🚀 Setting up Supabase Database Tables & Seed Data...');

  // 1. Sync Themes
  console.log('1. Syncing Themes...');
  const { error: themesErr } = await supabase.from('themes').upsert(DEFAULT_THEMES, { onConflict: 'id' });
  if (themesErr) console.log('Themes status:', themesErr.message);
  else console.log('✅ Themes table READY!');

  // 2. Sync Announcements
  console.log('2. Syncing Announcements...');
  const { error: annErr } = await supabase.from('announcements').upsert(DEFAULT_ANNOUNCEMENTS, { onConflict: 'id' });
  if (annErr) console.log('Announcements status:', annErr.message);
  else console.log('✅ Announcements table READY!');

  // 3. Sync Teams
  console.log('3. Syncing Teams...');
  const { error: teamErr } = await supabase.from('teams').upsert(DEFAULT_TEAMS, { onConflict: 'team_id' });
  if (teamErr) console.log('Teams status:', teamErr.message);
  else console.log('✅ Teams table READY!');

  // 4. Sync Event Config
  console.log('4. Syncing Event Config...');
  const { error: cfgErr } = await supabase.from('event_config').upsert([{ key: 'theme_selection_enabled', value: false }], { onConflict: 'key' });
  if (cfgErr) console.log('Event Config status:', cfgErr.message);
  else console.log('✅ Event Config table READY!');

  console.log('\n🎉 Setup complete check finished!');
}

setupDatabase();
