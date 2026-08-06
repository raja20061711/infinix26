import { NextResponse } from 'next/server';
import { fetchRegistrationsFromSupabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teamId, password } = body;

    if (!teamId || typeof teamId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Please enter your Team ID.' },
        { status: 400 }
      );
    }

    const cleanInputId = teamId.trim().toUpperCase().replace(/\s+/g, '');
    const cleanInputPass = (password || '').trim();

    // 1. Fetch live registrations from Supabase Database
    const dbTeams = await fetchRegistrationsFromSupabase();

    let matchedRow: any = null;
    if (dbTeams && Array.isArray(dbTeams)) {
      matchedRow = dbTeams.find((row: any) => {
        const id = (row.team_id || '').toUpperCase().replace(/\s+/g, '');
        return id === cleanInputId || id.replace('-', '') === cleanInputId.replace('-', '');
      });
    }

    if (!matchedRow) {
      return NextResponse.json(
        { success: false, error: `Team ID "${teamId}" not found. Please verify your Team ID or check your registration confirmation.` },
        { status: 404 }
      );
    }

    // 2. Validate Password if provided
    const storedPassword = matchedRow.password_hash || matchedRow.password;
    if (cleanInputPass && storedPassword) {
      const matchPass = cleanInputPass === storedPassword || cleanInputPass.toLowerCase() === storedPassword.toLowerCase();
      if (!matchPass) {
        return NextResponse.json(
          { success: false, error: 'Incorrect password for this Team ID. Please check your credentials.' },
          { status: 401 }
        );
      }
    }

    // Format team object for portal state
    const formattedTeam = {
      teamId: matchedRow.team_id,
      teamName: matchedRow.team_name,
      teamSize: matchedRow.team_size || 4,
      leaderName: matchedRow.leader_name,
      leaderEmail: matchedRow.leader_email,
      leaderPhone: matchedRow.leader_phone,
      gender: matchedRow.gender || 'Other',
      college: matchedRow.college,
      department: matchedRow.department,
      yearOfStudy: matchedRow.year_of_study || '',
      rollNumber: matchedRow.roll_number || '',
      members: Array.isArray(matchedRow.members)
        ? matchedRow.members
        : typeof matchedRow.members === 'string'
        ? JSON.parse(matchedRow.members || '[]')
        : [],
      accommodationRequired: matchedRow.accommodation_required ?? false,
      selectedThemeId: matchedRow.selected_theme_id || undefined,
      upiTransactionId: matchedRow.upi_transaction_id || undefined,
      paymentProofUrl: matchedRow.payment_proof_url || undefined,
      paymentAmount: matchedRow.payment_amount || undefined,
      paymentStatus: matchedRow.payment_status || 'Pending Verification',
      attendanceStatus: matchedRow.attendance_status || 'Not Checked In',
      checkInTime: matchedRow.check_in_time || undefined,
      checkedInBy: matchedRow.checked_in_by || undefined,
      password: matchedRow.password_hash || 'hackathon2026',
      registrationStatus: matchedRow.registration_status || 'Verified',
      emailStatus: matchedRow.email_status || 'Sent',
      qrCodeUrl: matchedRow.qr_code_url || undefined,
    };

    return NextResponse.json({
      success: true,
      team: formattedTeam,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Server error verifying credentials' },
      { status: 500 }
    );
  }
}
