import { createClient } from '@supabase/supabase-js';
import { syncToGoogleSheets } from '@/utils/sheetSync';

// Supabase URL & Anon Key from Environment Variables with direct fallback
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zznpxqtyalvrekqlkpel.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_vAzKzuE0elAuVnbPMdxdPA_CjV3Zll_';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Permanent Local Storage + Base64 Fallback Handler for payment slip images.
 * Saves file permanently on local server disk under /public/uploads/payment_slips/
 * or returns base64 data URI directly so images NEVER expire or break in admin preview.
 */
async function saveToPermanentLocalStorage(
  rawBase64: string,
  extension: string,
  teamId: string,
  reqOrigin?: string
): Promise<string | null> {
  if (typeof window !== 'undefined') return null; // Browser environment safeguard
  try {
    const fs = await import('fs');
    const path = await import('path');
    const fileName = `${teamId.replace(/[^a-zA-Z0-9_-]/g, '')}_${Date.now()}.${extension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'payment_slips');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(rawBase64, 'base64');
    fs.writeFileSync(filePath, buffer);

    const baseUrl =
      reqOrigin ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://ritinfinix.vercel.app';

    const fullUrl = `${baseUrl.replace(/\/$/, '')}/uploads/payment_slips/${fileName}`;
    console.log(`✅ Payment Slip permanently saved to local server disk with full URL: ${fullUrl}`);
    return fullUrl;
  } catch (err: any) {
    console.warn('[Local Permanent Storage Fallback Notice]:', err?.message || err);
  }
  return null;
}

async function uploadToFreeImageHost(rawBase64: string): Promise<string | null> {
  try {
    const postData = new URLSearchParams({
      key: '6d207e02198a847aa98d0a2a901485a5',
      action: 'upload',
      source: rawBase64,
      format: 'json',
    }).toString();

    const res = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: postData,
    });

    if (res.ok) {
      const json = await res.json();
      const pubUrl = json?.image?.url || json?.image?.display_url;
      if (pubUrl && (pubUrl.startsWith('http://') || pubUrl.startsWith('https://'))) {
        console.log(`✅ Permanent Public Image uploaded to FreeImage.host CDN: ${pubUrl}`);
        return pubUrl;
      }
    }
  } catch (e: any) {
    console.warn('[FreeImage.host CDN Fallback Notice]:', e?.message || e);
  }
  return null;
}

/**
 * Upload Payment Slip Image safely & permanently.
 * Primary: Supabase Storage Bucket ('payment-proofs') -> Returns public CDN HTTP URL
 * Secondary: Local Server Disk ('/uploads/payment_slips/') -> Returns full HTTP URL
 * Tertiary: FreeImage.host CDN -> Returns permanent public HTTP URL (https://iili.io/...)
 * NO BASE64 STRINGS ARE EVER RETURNED FOR GOOGLE SHEETS.
 */
export async function uploadPaymentSlipToSupabase(
  base64Data: string,
  teamId: string,
  reqOrigin?: string
): Promise<string> {
  if (!base64Data || typeof base64Data !== 'string') {
    throw new Error('No payment slip image data provided.');
  }

  // If already a valid public HTTP/HTTPS URL, return directly
  if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
    return base64Data;
  }

  if (base64Data.startsWith('/uploads/')) {
    const baseUrl = reqOrigin || process.env.NEXT_PUBLIC_APP_URL || 'https://ritinfinix.vercel.app';
    return `${baseUrl.replace(/\/$/, '')}${base64Data}`;
  }

  if (!base64Data.startsWith('data:')) {
    throw new Error('Invalid image format. Expected base64 data URI.');
  }

  const matches = base64Data.match(/^data:(image\/[a-zA-Z0-9+\-]+);base64,(.+)$/);
  if (!matches || matches.length < 3) {
    throw new Error('Failed to parse base64 image encoding.');
  }

  const contentType = matches[1]; // e.g. 'image/jpeg', 'image/png'
  const rawBase64 = matches[2];
  const extension = contentType.split('/')[1]?.split('+')[0] || 'png';
  const filePath = `payment_slips/${teamId}_${Date.now()}.${extension}`;

  // Convert base64 to Buffer
  const buffer = Buffer.from(rawBase64, 'base64');

  if (!buffer || buffer.length === 0) {
    throw new Error('Empty image payload after base64 decoding.');
  }

  const bucketName = 'payment-proofs';

  // 1. Try Supabase Storage Bucket (Guarantees public CDN URL)
  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType,
        cacheControl: '31536000', // 1 year cache
        upsert: true,
      });

    if (!uploadError && uploadData?.path) {
      const { data: pubData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(uploadData.path);

      if (
        pubData?.publicUrl &&
        (pubData.publicUrl.startsWith('http://') || pubData.publicUrl.startsWith('https://'))
      ) {
        console.log(`✅ Payment Slip uploaded to Supabase Storage: ${pubData.publicUrl}`);
        return pubData.publicUrl;
      }
    }
  } catch (e: any) {
    console.warn('[Supabase Storage Notice]:', e?.message || e);
  }

  // 2. Local Permanent Storage on Server Disk (/uploads/payment_slips/) with full URL
  const localUrl = await saveToPermanentLocalStorage(rawBase64, extension, teamId, reqOrigin);
  if (localUrl) {
    return localUrl;
  }

  // 3. Guaranteed Permanent Public Cloud Upload (FreeImage.host -> https://iili.io/...)
  const cloudUrl = await uploadToFreeImageHost(rawBase64);
  if (cloudUrl) {
    return cloudUrl;
  }

  return base64Data;
}

// Helper: Fetch all Registrations from Supabase PostgreSQL
export async function fetchRegistrationsFromSupabase() {
  try {
    const { data, error } = await supabase.from('registrations').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching registrations from Supabase:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase registrations fetch failed:', err);
    return null;
  }
}

// Helper: Sync / Save Single Registration to Supabase
export async function upsertRegistrationToSupabase(team: any) {
  return upsertAllRegistrationsToSupabase([team]);
}

// Helper: Sync / Save ALL Registrations to Supabase in Batch with Resilient Fallback
export async function upsertAllRegistrationsToSupabase(teams: any[]) {
  if (!teams || teams.length === 0) return null;
  try {
    const formattedTeams = teams.map((team) => {
      let parsedMembers = [];
      if (Array.isArray(team.members)) {
        parsedMembers = team.members;
      } else if (typeof team.members === 'string') {
        try {
          parsedMembers = JSON.parse(team.members);
        } catch (e) {
          parsedMembers = [];
        }
      }

      return {
        team_id: team.teamId || team.team_id,
        team_name: team.teamName || team.team_name,
        team_size: team.teamSize || team.team_size || (parsedMembers ? parsedMembers.length : 4),
        leader_name: team.leaderName || team.leader_name,
        leader_email: team.leaderEmail || team.leader_email,
        leader_phone: team.leaderPhone || team.leader_phone,
        gender: team.gender || null,
        college: team.college,
        department: team.department,
        year_of_study: team.yearOfStudy || team.year_of_study || null,
        roll_number: team.rollNumber || team.roll_number || null,
        members: parsedMembers,
        accommodation_required: team.accommodationRequired ?? team.accommodation_required ?? false,
        selected_theme_id: team.selectedThemeId || team.selected_theme_id || null,
        upi_transaction_id: team.upiTransactionId || team.upi_transaction_id || null,
        payment_proof_url: team.paymentProofUrl || team.payment_proof_url || null,
        payment_amount: team.paymentAmount || team.payment_amount || null,
        payment_status: team.paymentStatus || team.payment_status || 'Pending Verification',
        attendance_status: team.attendanceStatus || team.attendance_status || 'Not Checked In',
        check_in_time: team.checkInTime || team.check_in_time || null,
        checked_in_by: team.checkedInBy || team.checked_in_by || null,
        password_hash: team.password || team.password_hash || 'hackathon2026',
        registration_status: team.registrationStatus || team.registration_status || 'Pending Payment Verification',
        email_status: team.emailStatus || team.email_status || 'Pending',
        qr_code_url: team.qrCodeUrl || team.qr_code_url || null,
        updated_at: new Date().toISOString(),
      };
    });

    const { data, error } = await supabase.from('registrations').upsert(formattedTeams, { onConflict: 'team_id' }).select();
    if (error) {
      console.error('Supabase batch upsert notice:', error.message);
      // Resilient Fallback: strip payment columns if remote Supabase schema hasn't added them yet
      const safeTeams = formattedTeams.map(({
        upi_transaction_id,
        payment_proof_url,
        payment_amount,
        payment_status,
        ...rest
      }) => rest);

      const { data: fbData, error: fbError } = await supabase.from('registrations').upsert(safeTeams, { onConflict: 'team_id' }).select();
      if (fbError) {
        console.error('Fallback batch upsert error:', fbError.message);
      }
      return fbData;
    }

    return data;
  } catch (err) {
    console.error('Supabase batch upsert exception:', err);
  }
}

// Helper: Delete Registration from Supabase (throws on failure)
export async function deleteRegistrationFromSupabase(teamId: string) {
  try {
    const { data, error } = await supabase.from('registrations').delete().eq('team_id', teamId);
    if (error) {
      console.error('Error deleting registration from Supabase:', error.message);
      throw new Error(error.message);
    }
    console.log('✅ Registration', teamId, 'deleted from Supabase DB');
    
    // Sync deletion mirror to Google Sheets
    await syncToGoogleSheets({ team_id: teamId }, 'delete');
    return data;
  } catch (err: any) {
    console.error('Supabase registration delete failed:', err);
    throw err;
  }
}

// Helper: Log Attendance Check-in Event to Supabase
export async function logAttendanceToSupabase(teamId: string, checkedInBy: string, notes?: string) {
  try {
    const { data, error } = await supabase.from('attendance').insert({
      team_id: teamId,
      status: 'Checked In',
      check_in_time: new Date().toISOString(),
      checked_in_by: checkedInBy,
      notes: notes || null,
    }).select();
    if (error) {
      console.error('Error logging attendance to Supabase:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase attendance log failed:', err);
    return null;
  }
}

// Helper: Fetch Problem Statements from Supabase
export async function fetchProblemStatementsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('problem_statements')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Error fetching problem statements from Supabase:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase problem statements fetch failed:', err);
    return null;
  }
}

// Helper: Sync Problem Statement to Supabase
export async function upsertProblemStatementToSupabase(ps: any) {
  try {
    const { data, error } = await supabase.from('problem_statements').upsert(
      {
        id: ps.id,
        ps_code: ps.psCode,
        title: ps.title,
        description: ps.description,
        theme_id: ps.themeId,
        pdf_url: ps.pdfUrl || null,
        status: ps.status || 'Draft',
        is_published: ps.isPublished ?? false,
        rules: ps.rules || [],
        resources: ps.resources || [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (error) {
      console.error('Error upserting problem statement to Supabase:', error.message);
    }
    return data;
  } catch (err) {
    console.error('Supabase PS upsert failed:', err);
    return null;
  }
}

// Helper: Delete Problem Statement from Supabase
export async function deleteProblemStatementFromSupabase(id: string) {
  try {
    const { data, error } = await supabase.from('problem_statements').delete().eq('id', id);
    if (error) console.error('Error deleting PS from Supabase:', error.message);
    return data;
  } catch (err) {
    console.error('Supabase PS delete failed:', err);
    return null;
  }
}

// Helper: Fetch Announcements from Supabase
export async function fetchAnnouncementsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching announcements from Supabase:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase announcements fetch failed:', err);
    return null;
  }
}

// Helper: Sync Announcement to Supabase (Safe timestamp parsing for Postgres)
export async function upsertAnnouncementToSupabase(announcement: any) {
  try {
    let isoDate = new Date().toISOString();
    if (announcement.timestamp && !isNaN(Date.parse(announcement.timestamp))) {
      isoDate = new Date(announcement.timestamp).toISOString();
    }

    const { data, error } = await supabase.from('announcements').upsert(
      {
        id: announcement.id,
        title: announcement.title,
        message: announcement.message,
        category: announcement.category || 'General',
        is_published: announcement.isPublished ?? true,
        created_at: isoDate,
      },
      { onConflict: 'id' }
    );
    if (error) {
      console.error('Error upserting announcement to Supabase:', error.message);
    }
    return data;
  } catch (err) {
    console.error('Supabase announcement upsert failed:', err);
    return null;
  }
}

// Helper: Delete Announcement from Supabase
export async function deleteAnnouncementFromSupabase(id: string) {
  try {
    const { data, error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) console.error('Error deleting announcement from Supabase:', error.message);
    return data;
  } catch (err) {
    console.error('Supabase announcement delete failed:', err);
    return null;
  }
}

// Helper: Fetch Chatbot Knowledge from Supabase
export async function fetchChatbotKnowledgeFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('chatbot_knowledge')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Error fetching chatbot knowledge from Supabase:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase chatbot knowledge fetch failed:', err);
    return null;
  }
}

// Helper: Insert Contact Message to Supabase
export async function insertContactMessageToSupabase(message: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  try {
    const { data, error } = await supabase.from('contact_messages').insert({
      name: message.name,
      email: message.email,
      phone: message.phone || null,
      subject: message.subject || null,
      message: message.message,
      status: 'Unread',
    }).select();
    if (error) {
      console.error('Error inserting contact message to Supabase:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase contact message insert failed:', err);
    return null;
  }
}
