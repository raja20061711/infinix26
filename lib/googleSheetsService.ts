import { Team } from './portalState';

export interface SyncAttendancePayload {
  timestamp: string;
  teamId: string;
  teamName: string;
  leaderName: string;
  college: string;
  selectedThemeTitle?: string;
  problemStatementCode?: string;
  checkInTime: string;
  checkedInBy: string;
}

const DEFAULT_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbyuTp5XHj1QMsC6s9yVfUmWpZm_-PQQ85Jz41NIxBzi4JehFcWwoZfrLVEWpxwK-17hmQ/exec';

export async function syncAttendanceToGoogleSheets(
  team: Team,
  themeTitle?: string,
  psCode?: string,
  checkedInBy = 'Admin'
): Promise<{ success: boolean; message: string }> {
  const payload: SyncAttendancePayload = {
    timestamp: new Date().toISOString(),
    teamId: team.teamId,
    teamName: team.teamName,
    leaderName: team.leaderName,
    college: team.college,
    selectedThemeTitle: themeTitle || 'Not Selected',
    problemStatementCode: psCode || 'Not Published',
    checkInTime: new Date().toLocaleTimeString(),
    checkedInBy,
  };

  const webhookUrl =
    process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL ||
    process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
    DEFAULT_WEBHOOK_URL;

  try {
    // Send POST payload to Google Apps Script Webhook (mode: no-cors prevents browser CORS/302 blocking)
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log('✅ Google Sheets Attendance Sync payload posted to:', webhookUrl);
    return { success: true, message: 'Attendance marked and synced to Google Sheets!' };
  } catch (e: any) {
    console.error('Error syncing to Google Sheets:', e);
    return { success: false, message: e.message || 'Google Sheets sync error' };
  }
}
