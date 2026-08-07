import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zznpxqtyalvrekqlkpel.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_vAzKzuE0elAuVnbPMdxdPA_CjV3Zll_';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCheckIn() {
  console.log('Testing Supabase update for team INF26-7185...');
  const { data, error } = await supabase
    .from('registrations')
    .update({
      attendance_status: 'Checked In',
      check_in_time: new Date().toISOString(),
      checked_in_by: 'Admin Control Desk',
      updated_at: new Date().toISOString(),
    })
    .ilike('team_id', 'INF26-7185')
    .select();

  console.log('Update result data:', data);
  console.log('Update result error:', error);
}

testCheckIn();
