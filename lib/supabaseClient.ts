import { createClient } from '@supabase/supabase-js';

// Supabase URL & Anon Key from Environment Variables with direct fallback
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zznpxqtyalvrekqlkpel.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_vAzKzuE0elAuVnbPMdxdPA_CjV3Zll_';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
        attendance_status: team.attendanceStatus || team.attendance_status || 'Not Checked In',
        check_in_time: team.checkInTime || team.check_in_time || null,
        checked_in_by: team.checkedInBy || team.checked_in_by || null,
        password_hash: team.password || team.password_hash || 'hackathon2026',
        registration_status: team.registrationStatus || team.registration_status || 'Verified',
        email_status: team.emailStatus || team.email_status || 'Pending',
        qr_code_url: team.qrCodeUrl || team.qr_code_url || null,
        updated_at: new Date().toISOString(),
      };
    });

    const { data, error } = await supabase.from('registrations').upsert(formattedTeams, { onConflict: 'team_id' }).select();
    if (error) {
      console.error('Supabase batch upsert notice:', error.message);
      // Fallback: Sync base columns
      const fallbackTeams = formattedTeams.map(({ team_size, gender, year_of_study, roll_number, accommodation_required, ...rest }) => rest);
      const { data: fbData, error: fbError } = await supabase.from('registrations').upsert(fallbackTeams, { onConflict: 'team_id' }).select();
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
