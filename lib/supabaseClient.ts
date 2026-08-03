import { createClient } from '@supabase/supabase-js';

// Supabase URL & Anon Key from Environment Variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper: Fetch all Teams from Supabase PostgreSQL
export async function fetchTeamsFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('teams').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching teams from Supabase:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase teams fetch failed:', err);
    return null;
  }
}

// Helper: Sync / Save Team to Supabase
export async function upsertTeamToSupabase(team: any) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('teams').upsert(
      {
        team_id: team.teamId,
        team_name: team.teamName,
        team_size: team.teamSize || (team.members ? team.members.length : 4),
        leader_name: team.leaderName,
        leader_email: team.leaderEmail,
        leader_phone: team.leaderPhone,
        gender: team.gender || null,
        college: team.college,
        department: team.department,
        year_of_study: team.yearOfStudy || null,
        roll_number: team.rollNumber || null,
        members: team.members || [],
        accommodation_required: team.accommodationRequired ?? false,
        selected_theme_id: team.selectedThemeId || null,
        attendance_status: team.attendanceStatus || 'Not Checked In',
        check_in_time: team.checkInTime || null,
        checked_in_by: team.checkedInBy || null,
        password_hash: team.password || 'hackathon2026',
        registration_status: team.registrationStatus || 'Verified',
        email_status: team.emailStatus || 'Pending',
        qr_code_url: team.qrCodeUrl || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'team_id' }
    );
    if (error) {
      console.error('Error upserting team to Supabase:', error.message);
    }
    return data;
  } catch (err) {
    console.error('Supabase team upsert failed:', err);
    return null;
  }
}

// Helper: Fetch Problem Statements from Supabase
export async function fetchProblemStatementsFromSupabase() {
  if (!supabase) return null;
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
  if (!supabase) return null;
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

// Helper: Fetch Announcements from Supabase
export async function fetchAnnouncementsFromSupabase() {
  if (!supabase) return null;
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

// Helper: Sync Announcement to Supabase
export async function upsertAnnouncementToSupabase(announcement: any) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('announcements').upsert(
      {
        id: announcement.id,
        title: announcement.title,
        message: announcement.message,
        category: announcement.category || 'General',
        is_published: announcement.isPublished ?? true,
        created_at: announcement.timestamp || new Date().toISOString(),
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
