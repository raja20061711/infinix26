import { Team } from './portalState';

export interface SyncAttendancePayload {
  action: 'attendance';
  timestamp: string;
  teamId: string;
  teamName: string;
  leaderName: string;
  leaderPhone: string;
  college: string;
  checkInTime: string;
  checkedInBy: string;
}

const DEFAULT_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycby6_r2F5QSEkZ232uDQRvPNghCBS2Z7AeLuPuecG1lT8lrLJ1FC4lkV-tkfxVcKJEbo/exec';

/**
 * Helper: Format current date & time in Indian Standard Time (IST - Asia/Kolkata)
 */
export function getISTTimestamp(): string {
  return new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }) + ' IST';
}

export async function syncAttendanceToGoogleSheets(
  team: Team,
  themeTitle?: string,
  psCode?: string,
  checkedInBy = 'Admin'
): Promise<{ success: boolean; message: string }> {
  const istTime = getISTTimestamp();

  // Essential Attendance Details Only
  const payload: SyncAttendancePayload = {
    action: 'attendance',
    timestamp: istTime,
    teamId: team.teamId || '',
    teamName: team.teamName || '',
    leaderName: team.leaderName || '',
    leaderPhone: team.leaderPhone || '',
    college: team.college || '',
    checkInTime: istTime,
    checkedInBy,
  };

  const webhookUrl =
    process.env.GOOGLE_SCRIPT_URL ||
    process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
    process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL ||
    DEFAULT_WEBHOOK_URL;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    console.log('✅ Google Sheets IST Attendance Sync posted to:', webhookUrl);
    return { success: true, message: 'Attendance marked and synced to Google Sheets!' };
  } catch (e: any) {
    console.error('Error syncing attendance to Google Sheets:', e);
    return { success: false, message: e.message || 'Google Sheets sync error' };
  }
}
