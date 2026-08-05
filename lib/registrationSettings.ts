import { supabase } from './supabaseClient';
import fs from 'fs';
import path from 'path';

// Local storage file for instant persistence
const SETTINGS_FILE = path.join(process.cwd(), 'registration_status.json');
const CONFIG_ID = 'config_registration_status';

declare global {
  var infinix_reg_open: boolean | undefined;
}

/**
 * Checks whether team registrations are currently open or paused/closed.
 */
export async function isRegistrationOpen(): Promise<boolean> {
  // 1. Check in-memory global state
  if (typeof globalThis.infinix_reg_open === 'boolean') {
    return globalThis.infinix_reg_open;
  }

  // 2. Check local file system cache
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const fileData = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (typeof parsed.isOpen === 'boolean') {
        globalThis.infinix_reg_open = parsed.isOpen;
        return parsed.isOpen;
      }
    }
  } catch (err) {
    // Ignore file read error
  }

  // 3. Query Supabase DB `announcements` config row (Guaranteed DB persistence)
  try {
    const { data: annData } = await supabase
      .from('announcements')
      .select('message, is_published')
      .eq('id', CONFIG_ID)
      .maybeSingle();

    if (annData && annData.message !== undefined) {
      const isOpen = annData.message === 'true' && annData.is_published !== false;
      globalThis.infinix_reg_open = isOpen;
      saveLocalStatus(isOpen);
      return isOpen;
    }
  } catch (err) {
    // Ignore
  }

  // 4. Query Supabase DB `site_settings`
  try {
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'registration_open')
      .maybeSingle();

    if (data && data.value !== undefined) {
      const isOpen = data.value === 'true' || data.value === true;
      globalThis.infinix_reg_open = isOpen;
      saveLocalStatus(isOpen);
      return isOpen;
    }
  } catch (err) {
    // Ignore
  }

  return true; // Default to open if no setting stored yet
}

/**
 * Sets team registration status (Open vs Paused/Closed).
 */
export async function setRegistrationOpen(isOpen: boolean): Promise<boolean> {
  globalThis.infinix_reg_open = isOpen;
  saveLocalStatus(isOpen);

  const statusStr = isOpen ? 'true' : 'false';

  // 1. Sync to Supabase `announcements` table (Guaranteed table in database)
  try {
    await supabase.from('announcements').upsert({
      id: CONFIG_ID,
      title: 'REGISTRATION_STATUS',
      message: statusStr,
      category: 'Config',
      is_published: isOpen,
    });
  } catch (err) {
    console.warn('Could not update announcements config row in Supabase:', err);
  }

  // 2. Sync with Supabase DB `site_settings`
  try {
    await supabase.from('site_settings').upsert({
      key: 'registration_open',
      value: statusStr,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    // Table might not exist yet
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
    // Ignore error on read-only serverless filesystems
  }
}
