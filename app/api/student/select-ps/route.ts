import { NextResponse } from 'next/server';
import { fetchRegistrationsFromSupabase, upsertAllRegistrationsToSupabase } from '@/lib/supabaseClient';
import { syncToGoogleSheets } from '@/utils/sheetSync';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teamId, psId, psCode, psTitle } = body;

    if (!teamId || !psId) {
      return NextResponse.json(
        { success: false, error: 'Team ID and Problem Statement ID are required.' },
        { status: 400 }
      );
    }

    const cleanTeamId = teamId.trim().toUpperCase();

    // 1. Fetch live registrations from Supabase DB to check for race conditions
    const dbTeams = await fetchRegistrationsFromSupabase();

    if (!dbTeams || !Array.isArray(dbTeams)) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed. Please try again.' },
        { status: 500 }
      );
    }

    // 2. Find current team
    const currentTeamRow = dbTeams.find(
      (r: any) => (r.team_id || '').toUpperCase().trim() === cleanTeamId
    );

    if (!currentTeamRow) {
      return NextResponse.json(
        { success: false, error: `Team ${cleanTeamId} not found.` },
        { status: 404 }
      );
    }

    // 3. Check if Problem Statement is ALREADY taken by ANOTHER team
    const conflictingTeam = dbTeams.find(
      (r: any) =>
        (r.team_id || '').toUpperCase().trim() !== cleanTeamId &&
        (r.selected_theme_id === psId || r.selected_theme_id === psCode)
    );

    if (conflictingTeam) {
      return NextResponse.json(
        {
          success: false,
          error: `ALREADY CHOSEN! Problem Statement "${psCode || psId}" was just selected by Team "${conflictingTeam.team_name}". Please pick another available Problem Statement.`,
          takenBy: conflictingTeam.team_name,
        },
        { status: 409 }
      );
    }

    // 4. Update selected_theme_id in current team object
    const updatedTeamObj = {
      ...currentTeamRow,
      selected_theme_id: psId,
      updated_at: new Date().toISOString(),
    };

    // Save to Supabase PostgreSQL DB
    await upsertAllRegistrationsToSupabase([updatedTeamObj]);

    // Mirror selection update to Google Sheets asynchronously
    try {
      syncToGoogleSheets(updatedTeamObj, 'update');
    } catch (e) {}

    return NextResponse.json({
      success: true,
      teamId: cleanTeamId,
      psId,
      message: `🎉 Success! Problem Statement "${psCode || psTitle || psId}" successfully selected and locked for Team "${currentTeamRow.team_name}".`,
      team: updatedTeamObj,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Server error reserving Problem Statement' },
      { status: 500 }
    );
  }
}
