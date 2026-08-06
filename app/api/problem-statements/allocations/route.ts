import { NextResponse } from 'next/server';
import { fetchRegistrationsFromSupabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const dbTeams = await fetchRegistrationsFromSupabase();

    const allocations: Record<string, { teamId: string; teamName: string }> = {};

    if (dbTeams && Array.isArray(dbTeams)) {
      dbTeams.forEach((row: any) => {
        if (
          row.selected_theme_id &&
          row.selected_theme_id !== 'Not Selected' &&
          row.selected_theme_id !== 'NONE'
        ) {
          allocations[row.selected_theme_id] = {
            teamId: row.team_id,
            teamName: row.team_name,
          };
        }
      });
    }

    return NextResponse.json(
      {
        success: true,
        allocations,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          Pragma: 'no-cache',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching PS allocations' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          Pragma: 'no-cache',
        },
      }
    );
  }
}
