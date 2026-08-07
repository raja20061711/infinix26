import { createClient } from '@supabase/supabase-js';

const url = 'https://zznpxqtyalvrekqlkpel.supabase.co';
const key = 'sb_publishable_vAzKzuE0elAuVnbPMdxdPA_CjV3Zll_';

const supabase = createClient(url, key);

async function clearAllAnnouncements() {
  console.log('🧹 Clearing all announcements from Supabase DB...');
  const { data, error } = await supabase.from('announcements').delete().neq('id', 'impossible_id_that_never_matches');
  if (error) {
    console.error('❌ Failed to clear announcements:', error.message);
  } else {
    console.log('✅ ALL ANNOUNCEMENTS CLEARED SUCCESSFULLY FROM SUPABASE DB!');
  }
}

clearAllAnnouncements();
