import { NextRequest, NextResponse } from 'next/server';
import { sendToGoogleAppsScript, formatAppsScriptPayload, AppsScriptAction } from '@/services/googleSheetSync';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    let payload = body;
    if (body.team || !body.action) {
      payload = formatAppsScriptPayload(
        body.team || { team_id: body.registrationId },
        (body.action || 'create') as AppsScriptAction,
        body.verifiedBy || 'Admin'
      );
    }

    const result = await sendToGoogleAppsScript(payload);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Google Sync API Error]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Apps Script sync exception' },
      { status: 500 }
    );
  }
}
