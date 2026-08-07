import { NextResponse } from 'next/server';
import { updateAttendanceStatusInSupabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teamId, status = 'Checked In', checkedInBy = 'Admin Control Desk' } = body;

    if (!teamId || typeof teamId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Team ID is required' },
        { status: 400 }
      );
    }

    const result = await updateAttendanceStatusInSupabase(
      teamId,
      status as 'Checked In' | 'Not Checked In',
      checkedInBy
    );

    return NextResponse.json({
      success: true,
      message: `Team ${teamId} attendance updated to ${status}`,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update attendance' },
      { status: 500 }
    );
  }
}
