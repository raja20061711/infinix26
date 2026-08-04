import { NextRequest, NextResponse } from 'next/server';
import { upsertRegistrationToSupabase } from '@/lib/supabaseClient';
import { sendStudentWelcomeEmail, sendAdminNotificationEmail } from '@/lib/emailService';
import { syncToGoogleSheets } from '@/utils/sheetSync';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      teamName,
      leaderName,
      leaderEmail,
      leaderPhone,
      gender,
      college,
      department,
      yearOfStudy,
      rollNumber,
      upiTransactionId,
      paymentProofUrl,
      accommodationRequired,
      members,
    } = body;

    // Basic Validation
    if (!teamName || !leaderName || !leaderEmail || !leaderPhone || !college || !department) {
      return NextResponse.json(
        { error: 'Missing required fields (Team Name, Leader Name, Email, Phone, College, Department)' },
        { status: 400 }
      );
    }

    const totalMembers = (members?.length || 0) + 1;
    if (totalMembers < 3 || totalMembers > 5) {
      return NextResponse.json(
        { error: `Team size must be between 3 and 5 members (including Team Leader). Current size: ${totalMembers}.` },
        { status: 400 }
      );
    }

    if (!upiTransactionId || !upiTransactionId.trim()) {
      return NextResponse.json(
        { error: 'UPI Transaction Reference ID / UTR is required.' },
        { status: 400 }
      );
    }

    // Fee calculation (per participant)
    const isRamcoStudent = college.trim().toLowerCase().includes('ramco');
    const feePerHead = isRamcoStudent ? 250 : 350;
    const calculatedPaymentAmount = totalMembers * feePerHead;

    // Generate unique Team ID (e.g. INF26-7842)
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const teamId = `INF26-${randomDigits}`;
    const password = `inf26-${Math.random().toString(36).substring(2, 7)}`;

    const newTeam = {
      team_id: teamId,
      team_name: teamName.trim(),
      team_size: totalMembers,
      leader_name: leaderName.trim(),
      leader_email: leaderEmail.trim().toLowerCase(),
      leader_phone: leaderPhone.trim(),
      gender: gender || 'Other',
      college: college.trim(),
      department: department.trim(),
      year_of_study: yearOfStudy || '3rd Year',
      roll_number: rollNumber?.trim() || '',
      selected_theme_id: 'Not Selected',
      members: members || [],
      accommodation_required: Boolean(accommodationRequired),
      upi_transaction_id: upiTransactionId.trim(),
      payment_proof_url: paymentProofUrl || null,
      payment_amount: calculatedPaymentAmount,
      payment_status: 'Pending Verification',
      attendance_status: 'Not Checked In',
      password_hash: password,
      registration_status: 'Pending Payment Verification',
      email_status: 'Not Sent',
    };

    // Save to Supabase PostgreSQL DB
    const supabaseResult = await upsertRegistrationToSupabase(newTeam);

    // Automatic Live Mirror Sync to Google Sheets (Non-blocking backup)
    await syncToGoogleSheets(newTeam, 'create');

    // Send Admin notification email immediately so Admin can verify payment
    try {
      await sendAdminNotificationEmail(newTeam);
    } catch (adminEmailErr) {
      console.error('Admin notification email error:', adminEmailErr);
    }

    return NextResponse.json({
      success: true,
      teamId,
      password,
      team: newTeam,
      emailSent: false,
      message: 'Registration submitted! Credentials & Pass will be emailed to you after Admin verifies payment.',
      supabaseResult,
    });
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while saving registration' },
      { status: 500 }
    );
  }
}
