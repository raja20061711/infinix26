import { supabase } from './supabaseClient';
import fs from 'fs';
import path from 'path';

// Local storage file for instant zero-latency status persistence
const SETTINGS_FILE = path.join(process.cwd(), 'registration_status.json');

/**
 * Checks whether team registrations are currently open or paused/closed.
 */
export async function isRegistrationOpen(): Promise<boolean> {
  // 1. Check local file system cache (sub-millisecond speed)
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const fileData = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (typeof parsed.isOpen === 'boolean') {
        return parsed.isOpen;
      }
    }
  } catch (err) {
    // Ignore file read error and fall back to Supabase
  }

  // 2. Query Supabase DB `site_settings`
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'registration_open')
      .maybeSingle();

    if (data && data.value !== undefined) {
      const isOpen = data.value === 'true' || data.value === true;
      saveLocalStatus(isOpen);
      return isOpen;
    }
  } catch (err) {
    console.warn('Could not query site_settings from Supabase:', err);
  }

  return true; // Default to open
}

/**
 * Sets team registration status (Open vs Paused/Closed).
 */
export async function setRegistrationOpen(isOpen: boolean): Promise<boolean> {
  saveLocalStatus(isOpen);

  // Sync with Supabase DB `site_settings`
  try {
    await supabase.from('site_settings').upsert({
      key: 'registration_open',
      value: isOpen ? 'true' : 'false',
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Could not update site_settings in Supabase:', err);
  }

  return isOpen;
}

function saveLocalStatus(isOpen: boolean) {
  try {
    fs.writeFileSync(
      SETTINGS_FILE,
      JSON.stringify({ isOpen, updatedAt: new Date().toISOString() })
    );
  } catch (err) {
    console.warn('Could not write local registration status file:', err);
  }
}
