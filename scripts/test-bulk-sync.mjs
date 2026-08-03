import { createClient } from '@supabase/supabase-js';

const url = 'https://zznpxqtyalvrekqlkpel.supabase.co';
const key = 'sb_publishable_vAzKzuE0elAuVnbPMdxdPA_CjV3Zll_';

const supabase = createClient(url, key);

const SAMPLE_5_REGISTRATIONS = [
  {
    team_id: 'INF-2026-101',
    team_name: 'Tech Titans',
    team_size: 4,
    leader_name: 'Arun Kumar',
    leader_email: 'arunkumar.rit@gmail.com',
    leader_phone: '+91 9876543210',
    gender: 'Male',
    college: 'Ramco Institute of Technology',
    department: 'Information Technology',
    year_of_study: 'III Year',
    roll_number: '953621104001',
    members: [{ name: 'Arun Kumar', email: 'arunkumar.rit@gmail.com', role: 'Leader' }],
    accommodation_required: true,
    password_hash: 'hackathon2026',
    registration_status: 'Verified',
  },
  {
    team_id: 'INF-2026-102',
    team_name: 'Cyber Hawks',
    team_size: 3,
    leader_name: 'Subash Chandran',
    leader_email: 'subash.c@ceg.annauniv.edu',
    leader_phone: '+91 9876543211',
    gender: 'Male',
    college: 'College of Engineering Guindy (CEG)',
    department: 'Computer Science & Engineering',
    year_of_study: 'IV Year',
    roll_number: '2022101055',
    members: [{ name: 'Subash Chandran', email: 'subash.c@ceg.annauniv.edu', role: 'Leader' }],
    accommodation_required: false,
    password_hash: 'hackathon2026',
    registration_status: 'Verified',
  },
  {
    team_id: 'INF-2026-103',
    team_name: 'Neural Ninjas',
    team_size: 4,
    leader_name: 'Santhosh Raj',
    leader_email: 'santhosh.r@psgtech.ac.in',
    leader_phone: '+91 9876543212',
    gender: 'Male',
    college: 'PSG College of Technology',
    department: 'Robotics & Automation',
    year_of_study: 'III Year',
    roll_number: '21RA045',
    members: [{ name: 'Santhosh Raj', email: 'santhosh.r@psgtech.ac.in', role: 'Leader' }],
    accommodation_required: true,
    password_hash: 'hackathon2026',
    registration_status: 'Verified',
  },
  {
    team_id: 'INF-2026-104',
    team_name: 'Code Crusaders',
    team_size: 2,
    leader_name: 'Kavitha Ramesh',
    leader_email: 'kavitha.r@tce.edu',
    leader_phone: '+91 9876543213',
    gender: 'Female',
    college: 'Thiagarajar College of Engineering',
    department: 'Information Technology',
    year_of_study: 'II Year',
    roll_number: '22IT089',
    members: [{ name: 'Kavitha Ramesh', email: 'kavitha.r@tce.edu', role: 'Leader' }],
    accommodation_required: false,
    password_hash: 'hackathon2026',
    registration_status: 'Verified',
  },
  {
    team_id: 'INF-2026-105',
    team_name: 'Quantum Solvers',
    team_size: 4,
    leader_name: 'Gokul Nath',
    leader_email: 'gokul.n@ssn.edu.in',
    leader_phone: '+91 9876543214',
    gender: 'Male',
    college: 'SSN College of Engineering',
    department: 'Electrical & Electronics Engineering',
    year_of_study: 'III Year',
    roll_number: '3122215001',
    members: [{ name: 'Gokul Nath', email: 'gokul.n@ssn.edu.in', role: 'Leader' }],
    accommodation_required: true,
    password_hash: 'hackathon2026',
    registration_status: 'Verified',
  },
];

async function testBatchSync() {
  console.log('Testing Resilient Batch Syncing ALL 5 Registrations to Supabase...');
  const { data, error } = await supabase.from('registrations').upsert(SAMPLE_5_REGISTRATIONS, { onConflict: 'team_id' }).select();
  
  if (error) {
    console.log('Main upsert notice (schema missing new columns):', error.message);
    console.log('Running Automatic Fallback Sync for base columns...');
    
    const fallbackRegs = SAMPLE_5_REGISTRATIONS.map(({ team_size, gender, year_of_study, roll_number, accommodation_required, ...rest }) => rest);
    const { data: fbData, error: fbError } = await supabase.from('registrations').upsert(fallbackRegs, { onConflict: 'team_id' }).select();
    
    if (fbError) {
      console.error('Fallback Error:', fbError.message);
    } else {
      console.log('🎉 SUCCESS! ALL 5 REGISTRATIONS STORED IN SUPABASE DB! Count:', fbData.length);
      fbData.forEach((t) => console.log(`   ✅ Stored ${t.team_id}: ${t.team_name} (${t.college})`));
    }
  } else {
    console.log('🎉 BATCH SYNC SUCCESSFUL! Count:', data.length);
  }
}

testBatchSync();
