import { sendToGoogleAppsScript, formatAppsScriptPayload, AppsScriptAction } from '@/services/googleSheetSync';

/**
 * Reusable Sync Helper for Google Apps Script Web App
 *
 * Calls sendToGoogleAppsScript directly when executed on Node.js server,
 * or POSTs to /api/sync-sheets when executed on browser client.
 */
export async function syncToGoogleSheets(
  teamData: any,
  action: AppsScriptAction = 'create',
  verifiedBy: string = 'Admin'
): Promise<void> {
  if (!teamData) {
    console.warn('[Google Sync] Warning: syncToGoogleSheets called with empty teamData.');
    return;
  }

  const payload = formatAppsScriptPayload(teamData, action, verifiedBy);

  try {
    if (typeof window === 'undefined') {
      // Server-side execution: Call sendToGoogleAppsScript directly (bypassing extra HTTP loop)
      await sendToGoogleAppsScript(payload);
    } else {
      // Browser client-side execution: Call /api/sync-sheets API route
      const response = await fetch('/api/sync-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const resText = await response.text();
      console.log(`[Google Sync Client] API Status: ${response.status} | Response: ${resText}`);
    }
  } catch (err: any) {
    console.error(`[Google Sync Error] Failed to execute ${action} sync:`, err?.stack || err);
  }
}
