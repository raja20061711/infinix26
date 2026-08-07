import { NextRequest, NextResponse } from 'next/server';
import { supabase, upsertRegistrationToSupabase, uploadPaymentSlipToSupabase } from '@/lib/supabaseClient';
import { sendAdminNotificationEmail } from '@/lib/emailService';
import { syncToGoogleSheets } from '@/utils/sheetSync';
import { isRegistrationOpen } from '@/lib/registrationSettings';

export const maxDuration = 60; // Allow up to 60 seconds for Vercel Serverless Function execution
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    // Duplicate check: Prevent duplicate registration in database
    try {
      const cleanEmail = leaderEmail.trim().toLowerCase();
      const cleanPhone = leaderPhone.trim();
      const cleanUpi = upiTransactionId.trim();

      const { data: existingRegs } = await supabase
        .from('registrations')
        .select('team_id, leader_email, leader_phone, upi_transaction_id')
        .or(`leader_email.eq.${cleanEmail},leader_phone.eq.${cleanPhone},upi_transaction_id.eq.${cleanUpi}`);

      if (existingRegs && existingRegs.length > 0) {
        const dup = existingRegs[0];
        let dupField = 'details';
        if (dup.leader_email?.toLowerCase() === cleanEmail) {
          dupField = `Leader Email (${leaderEmail})`;
        } else if (dup.leader_phone === cleanPhone) {
          dupField = `Leader Mobile Number (${leaderPhone})`;
        } else if (dup.upi_transaction_id === cleanUpi) {
          dupField = `UPI Transaction UTR ID (${upiTransactionId})`;
        }
        return NextResponse.json(
          { error: `Duplicate Registration Blocked: A team (ID: ${dup.team_id}) is already registered with this ${dupField}. Duplicates are not allowed in the database.` },
          { status: 400 }
        );
      }
    } catch (checkErr) {
      console.warn('[Register API] Duplicate check error notice:', checkErr);
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

    // Extract request origin or host for full absolute HTTP URLs
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host') || 'ritinfinix.vercel.app';
    const reqOrigin = req.headers.get('origin') || `${proto}://${host}`;

    // Upload base64 payment slip image to Supabase Storage or permanent server disk
    let finalPaymentProofUrl: string | null = null;
    if (paymentProofUrl && typeof paymentProofUrl === 'string') {
      if (paymentProofUrl.startsWith('data:')) {
        try {
          finalPaymentProofUrl = await uploadPaymentSlipToSupabase(paymentProofUrl, teamId, reqOrigin);
        } catch (uploadErr: any) {
          console.error('[Register API] Image Upload Error:', uploadErr);
          return NextResponse.json(
            { error: `Payment slip upload failed: ${uploadErr.message || 'Storage error'}. Please try re-uploading your payment proof.` },
            { status: 400 }
          );
        }
      } else if (
        paymentProofUrl.startsWith('http://') ||
        paymentProofUrl.startsWith('https://')
      ) {
        finalPaymentProofUrl = paymentProofUrl;
      } else if (paymentProofUrl.startsWith('/uploads/')) {
        finalPaymentProofUrl = `${reqOrigin.replace(/\/$/, '')}${paymentProofUrl}`;
      }
    }

    if (finalPaymentProofUrl && finalPaymentProofUrl.startsWith('/uploads/')) {
      finalPaymentProofUrl = `${reqOrigin.replace(/\/$/, '')}${finalPaymentProofUrl}`;
    }

    const isValidProof =
      Boolean(finalPaymentProofUrl) &&
      typeof finalPaymentProofUrl === 'string' &&
      (finalPaymentProofUrl.startsWith('http://') ||
        finalPaymentProofUrl.startsWith('https://') ||
        finalPaymentProofUrl.startsWith('/uploads/') ||
        finalPaymentProofUrl.startsWith('data:image/'));

    if (!isValidProof) {
      return NextResponse.json(
        { error: 'A valid payment proof image is required. Please select & upload your payment slip image.' },
        { status: 400 }
      );
    }

    const newTeam = {
      team_id: teamId,
      teamId: teamId,
      team_name: teamName.trim(),
      teamName: teamName.trim(),
      team_size: totalMembers,
      leader_name: leaderName.trim(),
      leader_email: leaderEmail.trim().toLowerCase(),
      leader_phone: leaderPhone.trim(),
      gender: gender || 'Other',
      college: normalizedCollege,
      department: department.trim(),
      year_of_study: yearOfStudy || '3rd Year',
      roll_number: rollNumber?.trim() || '',
      selected_theme_id: null,
      members: members || [],
      accommodation_required: Boolean(accommodationRequired),
      upi_transaction_id: upiTransactionId.trim(),
      upiTransactionId: upiTransactionId.trim(),
      payment_proof_url: finalPaymentProofUrl,
      paymentProofUrl: finalPaymentProofUrl,
      payment_amount: calculatedPaymentAmount,
      payment_status: 'Pending Verification',
      attendance_status: 'Not Checked In',
      password_hash: password,
      registration_status: 'Pending Payment Verification',
      email_status: 'Not Sent',
    };

    // Save to Supabase PostgreSQL DB
    const supabaseResult = await upsertRegistrationToSupabase(newTeam);

    // Guaranteed Server Execution: Await Google Sheets mirror sync & Admin Alert before returning
    try {
      const [sheetResult, adminEmailResult] = await Promise.allSettled([
        syncToGoogleSheets(newTeam, 'create'),
        sendAdminNotificationEmail(newTeam),
      ]);

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
    } catch (bgErr) {
      console.warn('[Register API Background Sync Error]:', bgErr);
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
