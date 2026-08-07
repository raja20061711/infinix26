import { NextResponse } from 'next/server';
import { supabase, updateAttendanceStatusInSupabase } from '@/lib/supabaseClient';

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

    const cleanTeamId = teamId.trim();

    // Check if team is already checked in to enforce 1-time check-in
    if (status === 'Checked In') {
      const { data: existingTeam } = await supabase
        .from('registrations')
        .select('attendance_status, team_name')
        .ilike('team_id', cleanTeamId)
        .maybeSingle();

      if (existingTeam && existingTeam.attendance_status === 'Checked In') {
        return NextResponse.json(
          {
            success: false,
            error: `Team ${existingTeam.team_name || cleanTeamId} is ALREADY Checked In! Duplicate check-in is not allowed. Check-in can only happen 1 time.`,
            alreadyCheckedIn: true,
          },
          { status: 400 }
        );
      }
    }

    const result = await updateAttendanceStatusInSupabase(
      cleanTeamId,
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
