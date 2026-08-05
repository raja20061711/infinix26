import { NextRequest, NextResponse } from 'next/server';
import { upsertRegistrationToSupabase, uploadPaymentSlipToSupabase } from '@/lib/supabaseClient';
import { sendAdminNotificationEmail } from '@/lib/emailService';
import { syncToGoogleSheets } from '@/utils/sheetSync';
import { isRegistrationOpen } from '@/lib/registrationSettings';

export const maxDuration = 60; // Allow up to 60 seconds for Vercel Serverless Function execution

export async function POST(req: NextRequest) {
  try {
    // Check if registrations are currently open
    const isOpen = await isRegistrationOpen();
    if (!isOpen) {
      return NextResponse.json(
        {
          success: false,
          error: "There is no longer accepting registrations. Thank you for your interest in INFINIX'26!",
        },
        { status: 403 }
      );
    }

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
    const colLower = college.trim().toLowerCase();
    const isRamcoStudent = colLower.includes('ramco') || colLower.includes('rit');
    const feePerHead = isRamcoStudent ? 200 : 350;
    const calculatedPaymentAmount = totalMembers * feePerHead;
    const normalizedCollege = isRamcoStudent ? 'Ramco Institute of Technology' : college.trim();

    // Generate unique Team ID (e.g. INF26-7842)
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const teamId = `INF26-${randomDigits}`;
    const password = `inf26-${Math.random().toString(36).substring(2, 7)}`;

    // Upload base64 payment slip image to Supabase Storage bucket to get short public HTTP URL
    let finalPaymentProofUrl: string | null = null;
    if (paymentProofUrl && typeof paymentProofUrl === 'string') {
      if (paymentProofUrl.startsWith('data:')) {
        try {
          finalPaymentProofUrl = await uploadPaymentSlipToSupabase(paymentProofUrl, teamId);
        } catch (uploadErr: any) {
          console.error('[Register API] Image Upload Error:', uploadErr);
          return NextResponse.json(
            { error: `Payment slip upload failed: ${uploadErr.message || 'Storage error'}. Please try re-uploading your payment proof.` },
            { status: 400 }
          );
        }
      } else if (paymentProofUrl.startsWith('http://') || paymentProofUrl.startsWith('https://')) {
        finalPaymentProofUrl = paymentProofUrl;
      }
    }

    if (!finalPaymentProofUrl || (!finalPaymentProofUrl.startsWith('http://') && !finalPaymentProofUrl.startsWith('https://'))) {
      return NextResponse.json(
        { error: 'A valid payment proof image is required. Please upload your payment slip image.' },
        { status: 400 }
      );
    }

    const newTeam = {
      team_id: teamId,
      team_name: teamName.trim(),
      team_size: totalMembers,
      leader_name: leaderName.trim(),
      leader_email: leaderEmail.trim().toLowerCase(),
      leader_phone: leaderPhone.trim(),
      gender: gender || 'Other',
      college: normalizedCollege,
      department: department.trim(),
      year_of_study: yearOfStudy || '3rd Year',
      roll_number: rollNumber?.trim() || '',
      selected_theme_id: 'Not Selected',
      members: members || [],
      accommodation_required: Boolean(accommodationRequired),
      upi_transaction_id: upiTransactionId.trim(),
      payment_proof_url: finalPaymentProofUrl,
      payment_amount: calculatedPaymentAmount,
      payment_status: 'Pending Verification',
      attendance_status: 'Not Checked In',
      password_hash: password,
      registration_status: 'Pending Payment Verification',
      email_status: 'Not Sent',
    };

    // Save to Supabase PostgreSQL DB
    const supabaseResult = await upsertRegistrationToSupabase(newTeam);

    // Non-blocking Background Execution: Fire Google Sheets mirror sync & Admin Alert concurrently
    Promise.allSettled([
      syncToGoogleSheets(newTeam, 'create'),
      sendAdminNotificationEmail(newTeam),
    ]).then(([sheetResult, adminEmailResult]) => {
      if (sheetResult.status === 'rejected') {
        console.error('[Register API Background] Sheet Sync error:', sheetResult.reason);
      } else {
        console.log('[Register API Background] ✅ Google Sheets sync complete!');
      }
      if (adminEmailResult.status === 'rejected') {
        console.error('[Register API Background] Admin Email error:', adminEmailResult.reason);
      } else {
        console.log('[Register API Background] ✅ Admin Notification Email complete!');
      }
    });

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
