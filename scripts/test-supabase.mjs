import { createClient } from '@supabase/supabase-js';

const url = 'https://zznpxqtyalvrekqlkpel.supabase.co';
const key = 'sb_publishable_vAzKzuE0elAuVnbPMdxdPA_CjV3Zll_';

const supabase = createClient(url, key);

async function testConnection() {
  console.log('Testing Supabase Connection to:', url);
  try {
    const { data, error } = await supabase.from('teams').select('*').limit(5);
    if (error) {
      console.log('Supabase Query Response Error (Table might not exist yet):', error.message);
      console.log('Code/Hint:', error.code, error.details);
    } else {
      console.log('Supabase Connection SUCCESS! Found teams:', data.length);
    }
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

testConnection();
