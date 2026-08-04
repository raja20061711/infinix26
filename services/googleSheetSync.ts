export type AppsScriptAction = 'create' | 'update' | 'delete' | 'approve';

export interface AppsScriptSyncPayload {
  action: AppsScriptAction;
  registrationId?: string;
  paymentStatus?: string;
  registrationStatus?: string;
  verifiedBy?: string;
  verificationTime?: string;
  data?: any;
}

/**
 * Format team object into standardized Google Apps Script Web App payload
 * Automatically maps teamId, team_id, and registrationId for 100% field compatibility
 */
export function formatAppsScriptPayload(
  teamData: any,
  action: AppsScriptAction = 'create',
  verifiedBy: string = 'Admin'
): AppsScriptSyncPayload {
  const regId = teamData?.teamId || teamData?.team_id || teamData?.registrationId || '';
  const nowStr = new Date().toISOString();

  const normalizedTeam = {
    ...teamData,
    teamId: regId,
    team_id: regId,
    registrationId: regId,
  };

  const spreadsheetId = process.env.GOOGLE_SHEET_ID || process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || '';

  if (action === 'delete') {
    return {
      action: 'delete',
      registrationId: regId,
    };
  }

  if (action === 'approve') {
    return {
      action: 'approve',
      registrationId: regId,
      paymentStatus: 'Paid',
      registrationStatus: 'Approved',
      verifiedBy,
      verificationTime: nowStr,
      data: { ...normalizedTeam, spreadsheetId },
    };
  }

  if (action === 'update') {
    return {
      action: 'update',
      registrationId: regId,
      data: { ...normalizedTeam, spreadsheetId },
    };
  }

  // Default 'create'
  return {
    action: 'create',
    registrationId: regId,
    data: { ...normalizedTeam, spreadsheetId },
  };
}

/**
 * Direct fetch caller to GOOGLE_SCRIPT_URL with strict JSON headers & audit logging
 */
export async function sendToGoogleAppsScript(payload: AppsScriptSyncPayload): Promise<{ success: boolean; message?: string }> {
  const scriptUrl =
    process.env.GOOGLE_SCRIPT_URL ||
    process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
    process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL ||
    process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycby6_r2F5QSEkZ232uDQRvPNghCBS2Z7AeLuPuecG1lT8lrLJ1FC4lkV-tkfxVcKJEbo/exec';

  console.log(`[Google Sync] Executing action: ${payload.action} -> URL: ${scriptUrl}`);
  console.log(`[Google Sync] Payload:`, JSON.stringify(payload, null, 2));

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`[Google Sync] Status: ${response.status} ${response.statusText}`);

    const responseText = await response.text();
    console.log(`[Google Sync] Response: ${responseText}`);

    if (!response.ok) {
      console.error(`[Google Sync] Error: Non-200 HTTP response ${response.status}. Full Body:`, responseText);
      return { success: false, message: `HTTP ${response.status}: ${responseText}` };
    }

    let jsonResult: any;
    try {
      jsonResult = JSON.parse(responseText);
    } catch (e) {
      jsonResult = { success: true, message: responseText };
    }

    if (jsonResult && jsonResult.success === false) {
      console.error('[Google Sync] Apps Script returned failure response:', JSON.stringify(jsonResult, null, 2));
    }

    return jsonResult;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('[Google Sync] Error: Timeout error - Request to Google Apps Script exceeded 15 seconds.');
    } else {
      console.error('[Google Sync] Error: Fetch failed. Complete Stack Trace:');
      console.error(error.stack || error);
    }
    return { success: false, message: error?.message || 'Apps Script fetch failed' };
  }
}
