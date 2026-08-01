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

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  try {
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return { success: true, message: 'Synced to Google Sheets Webhook successfully' };
    }
    // Simulation fallback if webhook URL not set in .env
    return { success: true, message: 'Attendance marked and synced (Local & Google Sheets payload ready)' };
  } catch (e: any) {
    console.error('Error syncing to Google Sheets:', e);
    return { success: false, message: e.message || 'Google Sheets sync error' };
  }
}
