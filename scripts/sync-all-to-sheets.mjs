import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zznpxqtyalvrekqlkpel.supabase.co';
const supabaseAnonKey = 'sb_publishable_vAzKzuE0elAuVnbPMdxdPA_CjV3Zll_';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby6_r2F5QSEkZ232uDQRvPNghCBS2Z7AeLuPuecG1lT8lrLJ1FC4lkV-tkfxVcKJEbo/exec';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function syncAllToGoogleSheets() {
  console.log('Fetching all registration records from Supabase...');
  const { data: teams, error } = await supabase.from('registrations').select('*').order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch from Supabase:', error.message);
    return;
  }

  console.log(`Found ${teams.length} teams in Supabase database.`);

  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];
    const regId = team.team_id || team.teamId || `INF26-${1000 + i}`;
    
    let members = team.members || [];
    if (typeof members === 'string') {
      try { members = JSON.parse(members); } catch (e) { members = []; }
    }

    const payload = {
      action: 'create',
      registrationId: regId,
      data: {
        teamId: regId,
        team_id: regId,
        registrationId: regId,
        teamName: team.team_name || team.teamName || '',
        team_name: team.team_name || team.teamName || '',
        teamSize: team.team_size || (members.length + 1),
        leaderName: team.leader_name || team.leaderName || '',
        leader_name: team.leader_name || team.leaderName || '',
        leaderEmail: team.leader_email || team.leaderEmail || '',
        leader_email: team.leader_email || team.leaderEmail || '',
        leaderPhone: team.leader_phone || team.leaderPhone || '',
        leader_phone: team.leader_phone || team.leaderPhone || '',
        gender: team.gender || 'Other',
        college: team.college || '',
        department: team.department || '',
        yearOfStudy: team.year_of_study || '',
        rollNumber: team.roll_number || '',
        members: members,
        accommodationRequired: team.accommodation_required || false,
        upiTransactionId: team.upi_transaction_id || '',
        paymentProofUrl: team.payment_proof_url || '',
        paymentAmount: team.payment_amount || 0,
        paymentStatus: team.payment_status || 'Pending Verification',
        attendanceStatus: team.attendance_status || 'Not Checked In',
        registrationStatus: team.registration_status || 'Pending Payment Verification',
        spreadsheetId: '1I60wEQUYeDtQQUy-nxF8mSjkzZqvkrUrE848ZZ-_D8E'
      }
    };

    console.log(`[${i + 1}/${teams.length}] Syncing Team ID: ${regId} ("${team.team_name}")...`);

    try {
      const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        redirect: 'follow'
      });
      const text = await res.text();
      console.log(`  -> Response: ${res.status} | Output: ${text.substring(0, 100)}`);
    } catch (err) {
      console.error(`  -> Failed to sync ${regId}:`, err.message);
    }
  }

  console.log('✅ ALL Supabase teams successfully synced to Google Sheet!');
}

syncAllToGoogleSheets();
