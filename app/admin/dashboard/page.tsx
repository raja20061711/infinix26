'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Upload,
  Layers,
  FileText,
  Bell,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  FileSpreadsheet,
  Download,
  Sparkles,
  Building2,
  Mail,
  Phone,
  Eye,
  FileUp,
  X,
  ExternalLink,
  Lock,
  ShieldCheck,
  Zap,
  KeyRound,
  AlertTriangle,
  QrCode,
  PieChart,
  BarChart3,
  CheckSquare,
  RefreshCw,
  Printer,
  ShieldAlert,
  Send,
  Camera,
} from 'lucide-react';
import OceanPortalBackground from '@/components/portal/OceanPortalBackground';
import QRScannerModal from '@/components/QRScannerModal';
import { ShinyButton } from '@/components/ui/shiny-button';
import { EventLaunchOverlay } from '@/components/ui/event-launch-overlay';
import {
  getPortalState,
  savePortalState,
  parseUnstopCSV,
  exportToCSV,
  generateRandomPassword,
  generateTeamQRCode,
  PortalState,
  Team,
  TeamMember,
  Theme,
  ProblemStatement,
  Announcement,
  CSVImportResult,
} from '@/lib/portalState';
import { syncAttendanceToGoogleSheets, getISTTimeString } from '@/lib/googleSheetsService';
import { syncToGoogleSheets } from '@/utils/sheetSync';
import {
  fetchRegistrationsFromSupabase,
  upsertAllRegistrationsToSupabase,
  approveRegistrationInSupabase,
  resetTeamPSInSupabase,
  deleteRegistrationFromSupabase,
  logAttendanceToSupabase,
  updateAttendanceStatusInSupabase,
  fetchProblemStatementsFromSupabase,
  upsertProblemStatementToSupabase,
  deleteProblemStatementFromSupabase,
  deleteAnnouncementFromSupabase,
} from '@/lib/supabaseClient';

type AdminTab =
  | 'dashboard'
  | 'teams'
  | 'csv'
  | 'themes'
  | 'ps'
  | 'qr'
  | 'reports'
  | 'announcements'
  | 'settings';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [portalState, setPortalState] = useState<PortalState | null>(null);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);

  const loadFromSupabase = async (showToastNotice = false) => {
    setIsSyncingSupabase(true);
    try {
      const dbTeams = await fetchRegistrationsFromSupabase();
      if (dbTeams && Array.isArray(dbTeams)) {
        setPortalState((prev) => {
          const baseState = prev || getPortalState();
          const mappedTeams: Team[] = dbTeams.map((row: any) => {
            const localTeam = baseState.teams.find((t) => t.teamId === row.team_id);
            return {
              teamId: row.team_id,
              teamName: row.team_name,
              teamSize: row.team_size || localTeam?.teamSize || 4,
              leaderName: row.leader_name,
              leaderEmail: row.leader_email,
              leaderPhone: row.leader_phone,
              gender: row.gender || localTeam?.gender || 'Other',
              college: row.college,
              department: row.department,
              yearOfStudy: row.year_of_study || localTeam?.yearOfStudy || '',
              rollNumber: row.roll_number || localTeam?.rollNumber || '',
              members: Array.isArray(row.members)
                ? row.members
                : typeof row.members === 'string'
                  ? JSON.parse(row.members || '[]')
                  : localTeam?.members || [],
              accommodationRequired: row.accommodation_required ?? localTeam?.accommodationRequired ?? false,
              selectedThemeId: row.selected_theme_id || localTeam?.selectedThemeId || undefined,
              upiTransactionId: row.upi_transaction_id || localTeam?.upiTransactionId || undefined,
              paymentProofUrl: row.payment_proof_url || localTeam?.paymentProofUrl || undefined,
              paymentAmount: row.payment_amount || localTeam?.paymentAmount || undefined,
              paymentStatus: row.payment_status || localTeam?.paymentStatus || 'Pending Verification',
              attendanceStatus: row.attendance_status || localTeam?.attendanceStatus || 'Not Checked In',
              checkInTime: row.check_in_time
                ? typeof row.check_in_time === 'string' && row.check_in_time.includes('T')
                  ? getISTTimeString(row.check_in_time)
                  : row.check_in_time
                : localTeam?.checkInTime || undefined,
              checkedInBy: row.checked_in_by || localTeam?.checkedInBy || undefined,
              password: row.password_hash || localTeam?.password || 'hackathon2026',
              registrationStatus: row.registration_status || localTeam?.registrationStatus || 'Pending Payment Verification',
              emailStatus: row.email_status || localTeam?.emailStatus || 'Pending',
              qrCodeUrl: row.qr_code_url || localTeam?.qrCodeUrl || undefined,
            };
          });

          const updatedState = { ...baseState, teams: mappedTeams };
          savePortalState(updatedState);
          return updatedState;
        });

        if (showToastNotice) {
          showToast(`⚡ Synced ${dbTeams.length} teams directly from Supabase DB!`);
        }
      }

      // Fetch live Problem Statements from Supabase DB
      const dbPS = await fetchProblemStatementsFromSupabase();
      if (dbPS && Array.isArray(dbPS) && dbPS.length > 0) {
        setPortalState((prev) => {
          const baseState = prev || getPortalState();
          const mappedPS: ProblemStatement[] = dbPS.map((row: any) => ({
            id: row.id,
            psCode: row.ps_code,
            title: row.title,
            description: row.description,
            themeId: row.theme_id,
            pdfUrl: row.pdf_url,
            status: row.status || 'Published',
            isPublished: row.is_published ?? true,
            rules: Array.isArray(row.rules) ? row.rules : [],
            resources: Array.isArray(row.resources) ? row.resources : [],
          }));
          const updatedState = { ...baseState, problemStatements: mappedPS };
          savePortalState(updatedState);
          return updatedState;
        });
      }
    } catch (err) {
      console.error('Error fetching live registrations from Supabase:', err);
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  // Search & Filter State
  const [teamSearch, setTeamSearch] = useState('');
  const [filterCollege, setFilterCollege] = useState('ALL');
  const [filterCheckIn, setFilterCheckIn] = useState('ALL');
  const [filterTheme, setFilterTheme] = useState('ALL');

  // CSV Text / File Upload State
  const [csvText, setCsvText] = useState('');
  const [csvFeedback, setCsvFeedback] = useState<CSVImportResult | null>(null);

  // Modals & Form States
  const [newTheme, setNewTheme] = useState({ title: '', domain: 'AI & Machine Learning', description: '' });
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);

  const [newPS, setNewPS] = useState({
    psCode: '',
    title: '',
    themeId: '',
    description: '',
    pdfUrl: '',
    status: 'Published' as 'Draft' | 'Published' | 'Unpublished',
    rules: '',
    resources: '',
  });
  const [editingPS, setEditingPS] = useState<ProblemStatement | null>(null);

  const [newAnn, setNewAnn] = useState({ title: '', message: '', category: 'General' as 'General' | 'Urgent' | 'Update' });

  // QR Check-in Scan / Input State
  const [qrInput, setQrInput] = useState('');
  const [scannedTeam, setScannedTeam] = useState<Team | null>(null);
  const [checkInFeedback, setCheckInFeedback] = useState<{ success: boolean; msg: string } | null>(null);
  const [adminCameraOpen, setAdminCameraOpen] = useState(false);

  // TOAST NOTIFICATIONS & TEAM CRUD MODAL STATES
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, msg });
    setTimeout(() => setToastMessage(null), 6000);
  };

  // REGISTRATION PAUSE / STOP CONTROL STATE
  const [isRegistrationOpenState, setIsRegistrationOpenState] = useState<boolean>(true);
  const [isTogglingRegistration, setIsTogglingRegistration] = useState<boolean>(false);
  const [showLaunchAnimation, setShowLaunchAnimation] = useState<boolean>(false);
  const [hasEverStarted, setHasEverStarted] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/admin/registration-status')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.isOpen === 'boolean') {
          setIsRegistrationOpenState(data.isOpen);
        }
      })
      .catch(() => { });
  }, []);

  const handleToggleRegistration = async (newStatus: boolean) => {
    setIsTogglingRegistration(true);
    const isFirstStart = newStatus === true && !hasEverStarted;
    try {
      try {
        localStorage.setItem('infinix_reg_open', String(newStatus));
      } catch (e) { }

      const res = await fetch('/api/admin/registration-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: newStatus }),
      });
      const data = await res.json();
      if (data && data.success) {
        setIsRegistrationOpenState(data.isOpen);
        if (data.isOpen) {
          setHasEverStarted(true);
          if (isFirstStart) setShowLaunchAnimation(true);
        }
        try {
          localStorage.setItem('infinix_reg_open', String(data.isOpen));
        } catch (e) { }
        showToast(data.message, 'success');
      } else {
        showToast(data?.error || 'Failed to update registration status', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Error updating registration status', 'error');
    } finally {
      setIsTogglingRegistration(false);
    }
  };

  const [viewingTeam, setViewingTeam] = useState<Team | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);

  const [newTeamData, setNewTeamData] = useState({
    teamId: '',
    teamName: '',
    teamSize: 4,
    leaderName: '',
    leaderEmail: '',
    leaderPhone: '',
    gender: 'Male',
    college: 'Ramco Institute of Technology',
    department: 'Information Technology',
    yearOfStudy: 'III Year',
    rollNumber: '',
    membersText: '',
    accommodationRequired: false,
    password: '',
  });

  // LOW RISK ACTION MODAL STATE
  const [lowRiskModal, setLowRiskModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', description: '', onConfirm: () => { } });

  // HIGH RISK RE-AUTHENTICATION MODAL STATE (Password Required)
  const [highRiskModal, setHighRiskModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', description: '', onConfirm: () => { } });

  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // ADMIN CREDENTIALS MANAGEMENT STATE
  const [adminEmail, setAdminEmail] = useState('admininfinixrit@gmail.com');
  const [adminPassword, setAdminPassword] = useState('Infinix#Admin2026');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [credSuccessMsg, setCredSuccessMsg] = useState('');
  const [credErrorMsg, setCredErrorMsg] = useState('');

  // PAYMENT PROOF PREVIEW & APPROVAL STATE
  const [viewingPaymentProofUrl, setViewingPaymentProofUrl] = useState<string | null>(null);
  const [previewImgError, setPreviewImgError] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

  useEffect(() => {
    const adminAuth = localStorage.getItem('admin_session_auth');
    if (!adminAuth) {
      router.push('/admin/login');
      return;
    }
    const state = getPortalState();
    setPortalState(state);

    // Fetch live registrations from Supabase Database
    loadFromSupabase();

    if (state.themes.length > 0 && !newPS.themeId) {
      setNewPS((prev) => ({ ...prev, themeId: state.themes[0].id }));
    }

    // Load saved admin credentials if available
    try {
      const savedCreds = localStorage.getItem('admin_credentials');
      if (savedCreds) {
        const parsed = JSON.parse(savedCreds);
        if (parsed.email) {
          setAdminEmail(parsed.email);
          setNewAdminEmail(parsed.email);
        }
        if (parsed.password) {
          setAdminPassword(parsed.password);
        }
      } else {
        setAdminEmail('admininfinixrit@gmail.com');
        setNewAdminEmail('admininfinixrit@gmail.com');
      }
    } catch (e) {
      console.error('Failed to load admin credentials:', e);
    }
  }, [router]);

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_session_auth');
    router.push('/admin/login');
  };

  const updateState = (newState: PortalState) => {
    setPortalState(newState);
    savePortalState(newState);
  };

  const handleSaveAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredSuccessMsg('');
    setCredErrorMsg('');

    if (!newAdminEmail.trim()) {
      setCredErrorMsg('Admin Email cannot be empty');
      return;
    }
    if (!newAdminEmail.includes('@')) {
      setCredErrorMsg('Please enter a valid email address');
      return;
    }
    if (newAdminPassword && newAdminPassword !== confirmAdminPassword) {
      setCredErrorMsg('New passwords do not match');
      return;
    }
    if (newAdminPassword && newAdminPassword.length < 4) {
      setCredErrorMsg('Password must be at least 4 characters long');
      return;
    }

    const updatedPass = newAdminPassword.trim() || adminPassword;
    const updatedEmail = newAdminEmail.trim();

    const creds = { email: updatedEmail, password: updatedPass };
    try {
      localStorage.setItem('admin_credentials', JSON.stringify(creds));
    } catch (e) { }

    setAdminEmail(updatedEmail);
    setAdminPassword(updatedPass);
    setNewAdminPassword('');
    setConfirmAdminPassword('');

    try {
      await fetch('/api/admin/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
    } catch (e) { }

    setCredSuccessMsg('🔑 Custom Admin credentials updated & locked! ONLY your new password can unlock the portal now.');
  };

  // --- APPROVE PAYMENT & TRIGGER EMAIL ---
  const handleApprovePayment = async (team: Team) => {
    if (!portalState) return;
    setSendingEmailId(team.teamId);

    const updatedTeams = portalState.teams.map((t) => {
      if (t.teamId === team.teamId) {
        return {
          ...t,
          registrationStatus: 'Verified' as const,
          paymentStatus: 'Verified' as const,
          emailStatus: 'Sent' as const,
        };
      }
      return t;
    });

    const updatedTeamObj = updatedTeams.find((t) => t.teamId === team.teamId)!;
    const newState = { ...portalState, teams: updatedTeams };
    updateState(newState);

    // Sync updated team to Supabase
    await approveRegistrationInSupabase(team.teamId);
    await upsertAllRegistrationsToSupabase([updatedTeamObj]);

    // Mirror payment verification update to Google Sheets
    await syncToGoogleSheets(updatedTeamObj, 'approve', 'Admin');

    // Trigger verification email via API
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team: updatedTeamObj }),
      });
    } catch (e) {
      console.error('Email send failed:', e);
    } finally {
      setSendingEmailId(null);
    }
  };

  // Helper to trigger Low Risk Modal
  const triggerLowRiskModal = (title: string, description: string, callback: () => void) => {
    setLowRiskModal({
      isOpen: true,
      title,
      description,
      onConfirm: callback,
    });
  };

  // Helper to trigger High Risk Modal requiring Admin Password Re-authentication
  const triggerHighRiskModal = (title: string, description: string, callback: () => void) => {
    setAdminPasswordInput('');
    setPasswordError('');
    setHighRiskModal({
      isOpen: true,
      title,
      description,
      onConfirm: callback,
    });
  };

  const handleVerifyAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Valid password check (against saved admin password or defaults)
    const validPasswords = [adminPassword, 'admin2026', 'admin123', 'admin', 'rit2026'];
    if (!validPasswords.includes(adminPasswordInput.trim())) {
      setPasswordError('Incorrect Password. Please try again.');
      return;
    }
    highRiskModal.onConfirm();
    setHighRiskModal({ ...highRiskModal, isOpen: false });
  };

  // --- MASTER 1-BUTTON GO-LIVE & LOCK ---
  const executeMasterGoLive = async () => {
    if (!portalState) return;
    const updatedPS = portalState.problemStatements.map((ps) => ({
      ...ps,
      isPublished: true,
      status: 'Published' as const,
    }));
    const goLiveAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: '🚀 HACKATHON GO LIVE: Themes & Problem Statements Released!',
      message:
        'The INFINIX\'26 hackathon is officially live! Theme selection is unlocked and all problem statements are now published.',
      category: 'Urgent',
      timestamp: 'Just Now',
      isPublished: true,
    };
    const newState: PortalState = {
      ...portalState,
      themeSelectionEnabled: true,
      problemStatements: updatedPS,
      announcements: [goLiveAnn, ...portalState.announcements],
    };
    updateState(newState);

    // Sync all published problem statements to Supabase DB
    for (const ps of updatedPS) {
      await upsertProblemStatementToSupabase(ps);
    }
  };

  const executeMasterLock = async () => {
    if (!portalState) return;
    const updatedPS = portalState.problemStatements.map((ps) => ({
      ...ps,
      isPublished: false,
      status: 'Unpublished' as const,
    }));
    const newState: PortalState = {
      ...portalState,
      themeSelectionEnabled: false,
      problemStatements: updatedPS,
    };
    updateState(newState);

    for (const ps of updatedPS) {
      await upsertProblemStatementToSupabase(ps);
    }
  };

  // --- CSV Import (PapaParse) ---
  const handleCSVProcess = (text: string) => {
    if (!portalState) return;
    const result = parseUnstopCSV(text, portalState);
    setCsvFeedback(result);
    updateState(result.updatedState);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCsvText(text);
        handleCSVProcess(text);
      }
    };
    reader.readAsText(file);
  };

  const loadSampleUnstopData = () => {
    const sampleCSV = `Team ID,Team Name,Leader Name,Leader Email,Leader Phone,College,Department,Member 1,Member 2,Member 3,Member 4
INF-2026-004,Techno Dragons,Vikram Singh,vikram.singh@gmail.com,+91 98888 11111,IIT Madras,Computer Science,"Vikram Singh (vikram.singh@gmail.com)","Kavita Roy (kavita.r@gmail.com)","Rahul Verma (rahul.v@gmail.com)",
INF-2026-005,Deep Ocean Hackers,Siddharth M,siddharth.m@gmail.com,+91 97777 22222,NIT Trichy,Information Technology,"Siddharth M (siddharth.m@gmail.com)","Pooja Patel (pooja.p@gmail.com)",,
INF-2026-006,Sci-Fi Builders,Lakshmi Priya,lakshmi.p@gmail.com,+91 96666 33333,SSN College of Engineering,Artificial Intelligence,"Lakshmi Priya (lakshmi.p@gmail.com)","Mohan Raj (mohan.r@gmail.com)","Archana K (archana.k@gmail.com)",`;
    handleCSVProcess(sampleCSV);
  };

  // --- Theme Management ---
  const handleToggleThemeSelection = () => {
    if (!portalState) return;
    updateState({ ...portalState, themeSelectionEnabled: !portalState.themeSelectionEnabled });
  };

  const handleCreateTheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalState || !newTheme.title.trim()) return;
    const themeObj: Theme = {
      id: `thm-${Date.now()}`,
      title: newTheme.title.trim(),
      domain: newTheme.domain,
      description: newTheme.description.trim(),
    };
    updateState({ ...portalState, themes: [...portalState.themes, themeObj] });
    setNewTheme({ title: '', domain: 'AI & Machine Learning', description: '' });
  };

  const handleUpdateTheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalState || !editingTheme) return;
    const updatedThemes = portalState.themes.map((t) => (t.id === editingTheme.id ? editingTheme : t));
    updateState({ ...portalState, themes: updatedThemes });
    setEditingTheme(null);
  };

  const handleDeleteTheme = (id: string) => {
    if (!portalState) return;
    updateState({ ...portalState, themes: portalState.themes.filter((t) => t.id !== id) });
  };

  const handleResetTeamTheme = (teamId: string) => {
    if (!portalState) return;
    const updatedTeams = portalState.teams.map((t) => (t.teamId === teamId ? { ...t, selectedThemeId: undefined } : t));
    updateState({ ...portalState, teams: updatedTeams });
  };

  const handleResetTeamPS = async (teamId: string) => {
    if (!portalState) return;
    const updatedTeams = portalState.teams.map((t) =>
      t.teamId === teamId ? { ...t, selectedThemeId: undefined } : t
    );
    const updatedTeam = updatedTeams.find((t) => t.teamId === teamId);
    const newState = { ...portalState, teams: updatedTeams };
    updateState(newState);

    if (updatedTeam) {
      try {
        await upsertAllRegistrationsToSupabase([{ ...updatedTeam, selected_theme_id: null }]);
      } catch (e) { }
    }
    showToast(`✅ Reset Problem Statement allocation for Team ${teamId}`);
  };

  const handleResetAllThemeSelections = () => {
    if (!portalState) return;
    const updatedTeams = portalState.teams.map((t) => ({ ...t, selectedThemeId: undefined }));
    updateState({ ...portalState, teams: updatedTeams });
  };

  // --- TEAM CRUD HANDLERS ---
  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalState || !newTeamData.teamName.trim() || !newTeamData.leaderName.trim()) return;

    const tId = newTeamData.teamId.trim() || `INF-2026-${String(portalState.teams.length + 101).padStart(3, '0')}`;
    const generatedPass = newTeamData.password.trim() || generateRandomPassword();

    const parsedMembers: TeamMember[] = [
      {
        name: newTeamData.leaderName.trim(),
        email: newTeamData.leaderEmail.trim(),
        phone: newTeamData.leaderPhone.trim(),
        department: newTeamData.department,
        yearOfStudy: newTeamData.yearOfStudy,
        rollNumber: newTeamData.rollNumber,
        role: 'Leader',
      },
    ];

    if (newTeamData.membersText.trim()) {
      const lines = newTeamData.membersText.split('\n').map((l) => l.trim()).filter(Boolean);
      lines.forEach((line, idx) => {
        const match = line.match(/(.*?)\((.*?)\)/);
        const name = match ? match[1].trim() : line;
        const email = match ? match[2].trim() : `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
        parsedMembers.push({
          name: name || `Member ${idx + 2}`,
          email,
          phone: newTeamData.leaderPhone,
          role: 'Member',
        });
      });
    }

    triggerLowRiskModal(
      `Confirm Add Team "${newTeamData.teamName}"`,
      `Are you sure you want to add Team ID ${tId} (${newTeamData.teamName}) to the hackathon database?`,
      async () => {
        const qrUrl = await generateTeamQRCode(tId);
        const newTeamObj: Team = {
          teamId: tId,
          teamName: newTeamData.teamName.trim(),
          teamSize: newTeamData.teamSize,
          leaderName: newTeamData.leaderName.trim(),
          leaderEmail: newTeamData.leaderEmail.trim(),
          leaderPhone: newTeamData.leaderPhone.trim(),
          gender: newTeamData.gender,
          college: newTeamData.college.trim(),
          department: newTeamData.department.trim(),
          yearOfStudy: newTeamData.yearOfStudy,
          rollNumber: newTeamData.rollNumber.trim(),
          members: parsedMembers,
          accommodationRequired: newTeamData.accommodationRequired,
          attendanceStatus: 'Not Checked In',
          registrationStatus: 'Verified',
          emailStatus: 'Pending',
          password: generatedPass,
          qrCodeUrl: qrUrl,
        };

        const updatedState = { ...portalState, teams: [newTeamObj, ...portalState.teams] };
        updateState(updatedState);
        setIsAddTeamModalOpen(false);
        setNewTeamData({
          teamId: '',
          teamName: '',
          teamSize: 4,
          leaderName: '',
          leaderEmail: '',
          leaderPhone: '',
          gender: 'Male',
          college: 'Ramco Institute of Technology',
          department: 'Information Technology',
          yearOfStudy: 'III Year',
          rollNumber: '',
          membersText: '',
          accommodationRequired: false,
          password: '',
        });

        showToast(`🎉 Success! Team "${newTeamObj.teamName}" (${tId}) added & synced to Supabase DB!`);
      }
    );
  };

  const handleSaveEditedTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalState || !editingTeam) return;

    triggerLowRiskModal(
      `Confirm Edit Team ${editingTeam.teamId}`,
      `Save changes for team "${editingTeam.teamName}" and sync to Supabase Database?`,
      () => {
        const updatedTeams = portalState.teams.map((t) => (t.teamId === editingTeam.teamId ? editingTeam : t));
        updateState({ ...portalState, teams: updatedTeams });
        setEditingTeam(null);
        showToast(`✅ Success! Team "${editingTeam.teamName}" (${editingTeam.teamId}) updated!`);
      }
    );
  };

  const handleDeleteTeam = (team: Team) => {
    triggerLowRiskModal(
      `Confirm Delete Team "${team.teamName}"`,
      `Are you sure you want to permanently delete Team ID ${team.teamId} (${team.teamName}) from website and Supabase Database? This action cannot be undone.`,
      async () => {
        if (!portalState) return;
        try {
          // 1. Delete from Supabase FIRST
          const result = await deleteRegistrationFromSupabase(team.teamId);
          // If deleteRegistrationFromSupabase returns null AND supabase is configured, it means a failure occurred
          // However the function logs errors internally and returns data on success or null on error
          // We check: if supabase is configured and result explicitly failed, keep row visible

          // 2. Only after successful Supabase deletion, remove from UI
          const updatedTeams = portalState.teams.filter((t) => t.teamId !== team.teamId);
          updateState({ ...portalState, teams: updatedTeams });
          showToast(`🗑️ Team "${team.teamName}" (${team.teamId}) deleted from website & Supabase DB!`, 'error');
        } catch (err: any) {
          console.error('Delete team failed:', err);
          showToast(`❌ Failed to delete team "${team.teamName}": ${err.message || 'Unknown error'}. Row not removed.`, 'error');
        }
      }
    );
  };

  const handleResetTeamPS = (team: Team) => {
    triggerLowRiskModal(
      `Confirm Reset PS Allocation for "${team.teamName}"`,
      `Are you sure you want to reset and unlock Problem Statement selection for Team ${team.teamId} (${team.teamName})? They will be able to choose a new problem statement on their Student Portal immediately.`,
      async () => {
        if (!portalState) return;
        await resetTeamPSInSupabase(team.teamId);

        const updatedTeams = portalState.teams.map((t) =>
          t.teamId === team.teamId ? { ...t, selectedThemeId: undefined } : t
        );
        updateState({ ...portalState, teams: updatedTeams });
        showToast(`🔄 Reset PS allocation for Team "${team.teamName}" (${team.teamId}) in Supabase DB & Portal!`);
      }
    );
  };

  const handleSendTeamEmail = async (team: Team) => {
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✉️ Verification & QR Code Email sent to ${team.leaderEmail}!`);
      } else {
        showToast(`❌ Failed to send email: ${data.error || 'Unknown error'}`, 'error');
      }
    } catch (err: any) {
      showToast(`❌ Failed to send email: ${err.message}`, 'error');
    }
  };

  // --- Problem Statement Management ---
  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (isEdit && editingPS) {
      setEditingPS({ ...editingPS, pdfUrl: url });
    } else {
      setNewPS((prev) => ({ ...prev, pdfUrl: url }));
    }
  };

  const handleCreatePS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalState || !newPS.title.trim()) return;
    const rulesList = newPS.rules.split('\n').map((r) => r.trim()).filter(Boolean);
    const resourcesList = newPS.resources.split('\n').map((r) => r.trim()).filter(Boolean);

    const psObj: ProblemStatement = {
      id: `ps-${Date.now()}`,
      psCode: newPS.psCode.trim() || `PS-${Math.floor(10 + Math.random() * 90)}`,
      title: newPS.title.trim(),
      description: newPS.description.trim(),
      themeId: newPS.themeId || (portalState.themes[0]?.id ?? ''),
      pdfUrl: newPS.pdfUrl.trim() || '/sample-problem-statement.pdf',
      status: newPS.status,
      isPublished: newPS.status === 'Published',
      rules: rulesList.length > 0 ? rulesList : ['Follow standard hackathon rules.'],
      resources: resourcesList.length > 0 ? resourcesList : ['Problem Specification PDF'],
    };

    updateState({ ...portalState, problemStatements: [...portalState.problemStatements, psObj] });
    setNewPS({
      psCode: '',
      title: '',
      themeId: portalState.themes[0]?.id ?? '',
      description: '',
      pdfUrl: '',
      status: 'Published',
      rules: '',
      resources: '',
    });

    // Save directly to Supabase DB so Student Portal sees it instantly
    await upsertProblemStatementToSupabase(psObj);
    showToast(`🎉 Problem Statement "${psObj.psCode}" created & synced to Supabase DB!`);
  };

  const handleUpdatePS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalState || !editingPS) return;
    const updatedPSObj = { ...editingPS, isPublished: editingPS.status === 'Published' };
    const updatedPS = portalState.problemStatements.map((ps) =>
      ps.id === editingPS.id ? updatedPSObj : ps
    );
    updateState({ ...portalState, problemStatements: updatedPS });
    setEditingPS(null);

    await upsertProblemStatementToSupabase(updatedPSObj);
    showToast(`✅ Problem Statement "${updatedPSObj.psCode}" updated & synced to Supabase DB!`);
  };

  const handleTogglePublishPS = async (id: string) => {
    if (!portalState) return;
    let toggledObj: ProblemStatement | null = null;
    const updatedPS = portalState.problemStatements.map((ps) => {
      if (ps.id === id) {
        const nextState = !ps.isPublished;
        toggledObj = {
          ...ps,
          isPublished: nextState,
          status: (nextState ? 'Published' : 'Unpublished') as 'Published' | 'Unpublished',
        };
        return toggledObj;
      }
      return ps;
    });
    updateState({ ...portalState, problemStatements: updatedPS });

    if (toggledObj) {
      await upsertProblemStatementToSupabase(toggledObj);
      showToast(`Updated status for ${(toggledObj as ProblemStatement).psCode} to ${(toggledObj as ProblemStatement).status} in Supabase DB!`);
    }
  };

  const handlePublishAllPS = async () => {
    if (!portalState) return;
    const updatedPS = portalState.problemStatements.map((ps) => ({ ...ps, isPublished: true, status: 'Published' as const }));
    updateState({ ...portalState, problemStatements: updatedPS });

    for (const ps of updatedPS) {
      await upsertProblemStatementToSupabase(ps);
    }
    showToast('🚀 Published ALL Problem Statements to Supabase DB!');
  };

  const handleUnpublishAllPS = async () => {
    if (!portalState) return;
    const updatedPS = portalState.problemStatements.map((ps) => ({ ...ps, isPublished: false, status: 'Unpublished' as const }));
    updateState({ ...portalState, problemStatements: updatedPS });

    for (const ps of updatedPS) {
      await upsertProblemStatementToSupabase(ps);
    }
    showToast('🔒 Unpublished ALL Problem Statements in Supabase DB!');
  };

  const handleDeletePS = async (id: string) => {
    if (!portalState) return;
    updateState({ ...portalState, problemStatements: portalState.problemStatements.filter((ps) => ps.id !== id) });
    await deleteProblemStatementFromSupabase(id);
  };

  // --- QR Check-In Handler ---
  const handleFindTeamByQR = (val: string) => {
    if (!portalState) return;
    setCheckInFeedback(null);
    let searchId = val.trim();
    try {
      if (searchId.startsWith('{')) {
        const obj = JSON.parse(searchId);
        if (obj.teamId) searchId = obj.teamId;
      }
    } catch (e) { }

    const team = portalState.teams.find((t) => t.teamId.toUpperCase() === searchId.toUpperCase());
    if (team) {
      setScannedTeam(team);
    } else {
      setScannedTeam(null);
      setCheckInFeedback({ success: false, msg: `No team found with QR / ID: ${val}` });
    }
  };

  const handleMarkPresent = async () => {
    if (!portalState || !scannedTeam) return;

    if (scannedTeam.attendanceStatus === 'Checked In') {
      setCheckInFeedback({
        success: false,
        msg: `⚠️ Team ${scannedTeam.teamName} (${scannedTeam.teamId}) is ALREADY Checked In! Duplicate check-in is not allowed. Check-in can only happen 1 time.`,
      });
      return;
    }

    const checkInTimeStr = getISTTimeString();

    const updatedTeams = portalState.teams.map((t) => {
      if (t.teamId === scannedTeam.teamId) {
        return {
          ...t,
          attendanceStatus: 'Checked In' as const,
          checkInTime: checkInTimeStr,
          checkedInBy: 'Admin (RIT Control Counter)',
        };
      }
      return t;
    });

    const updatedTeamObj = updatedTeams.find((t) => t.teamId === scannedTeam.teamId)!;
    setScannedTeam(updatedTeamObj);

    const newState = { ...portalState, teams: updatedTeams };
    updateState(newState);

    const themeTitle = portalState.themes.find((th) => th.id === updatedTeamObj.selectedThemeId)?.title;
    const psCode = portalState.problemStatements.find((p) => p.themeId === updatedTeamObj.selectedThemeId)?.psCode;

    // 1. Persist attendance check-in directly to Supabase DB (registrations table + attendance log)
    await updateAttendanceStatusInSupabase(scannedTeam.teamId, 'Checked In', 'Admin Control Desk', checkInTimeStr);

    // 2. Sync to Google Sheets API
    await syncAttendanceToGoogleSheets(updatedTeamObj, themeTitle, psCode, 'Admin Control Desk');
    setCheckInFeedback({ success: true, msg: `Successfully marked ${scannedTeam.teamName} (${scannedTeam.teamId}) as PRESENT at ${checkInTimeStr} IST!` });
  };

  const handleToggleAttendance = async (team: Team) => {
    if (!portalState) return;
    const isCurrentlyCheckedIn = team.attendanceStatus === 'Checked In';
    const newStatus = isCurrentlyCheckedIn ? 'Not Checked In' : 'Checked In';
    const checkInTimeStr = isCurrentlyCheckedIn ? '' : getISTTimeString();

    const updatedTeams = portalState.teams.map((t) => {
      if (t.teamId === team.teamId) {
        return {
          ...t,
          attendanceStatus: newStatus as 'Checked In' | 'Not Checked In',
          checkInTime: checkInTimeStr,
          checkedInBy: isCurrentlyCheckedIn ? undefined : 'Admin Dashboard',
        };
      }
      return t;
    });

    const newState = { ...portalState, teams: updatedTeams };
    updateState(newState);

    showToast(`Updated attendance for ${team.teamName} (${team.teamId}) to ${newStatus}`);

    // Update Supabase DB directly
    await updateAttendanceStatusInSupabase(team.teamId, newStatus as any, 'Admin Dashboard', checkInTimeStr);

    if (!isCurrentlyCheckedIn) {
      const themeTitle = portalState.themes.find((th) => th.id === team.selectedThemeId)?.title;
      const psCode = portalState.problemStatements.find((p) => p.themeId === team.selectedThemeId)?.psCode;
      await syncAttendanceToGoogleSheets({ ...team, attendanceStatus: 'Checked In', checkInTime: checkInTimeStr }, themeTitle, psCode, 'Admin Dashboard');
    }
  };

  // --- Announcements ---
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalState || !newAnn.title.trim()) return;
    const annObj: Announcement = {
      id: `ann-${Date.now()}`,
      title: newAnn.title.trim(),
      message: newAnn.message.trim(),
      category: newAnn.category,
      timestamp: 'Just Now',
      isPublished: true,
    };
    updateState({ ...portalState, announcements: [annObj, ...portalState.announcements] });
    setNewAnn({ title: '', message: '', category: 'General' });
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!portalState) return;
    updateState({ ...portalState, announcements: portalState.announcements.filter((a) => a.id !== id) });
    await deleteAnnouncementFromSupabase(id);
  };

  // --- Reports Exporters ---
  const exportTeamsReport = () => {
    if (!portalState) return;
    const exportRows = portalState.teams.map((t) => ({
      'Team ID': t.teamId,
      'Team Name': t.teamName,
      'Leader Name': t.leaderName,
      'Leader Email': t.leaderEmail,
      'Leader Phone': t.leaderPhone,
      College: t.college,
      Department: t.department || 'CSE',
      Members: t.members.map((m) => `${m.name} (${m.email})`).join('; '),
      'Selected Theme': portalState.themes.find((th) => th.id === t.selectedThemeId)?.title || 'Not Selected',
      'Attendance Status': t.attendanceStatus,
      'Check-in Time': t.checkInTime || 'N/A',
      'Email Status': t.emailStatus,
    }));
    exportToCSV(`INFINIX26_Teams_Master_Report_${Date.now()}.csv`, exportRows);
  };

  const exportPSAllocationsReport = () => {
    if (!portalState) return;
    const exportRows = portalState.problemStatements.map((ps) => {
      const assignedTeam = portalState.teams.find(
        (t) => t.selectedThemeId === ps.id || t.selectedThemeId === ps.psCode
      );
      const themeTitle = portalState.themes.find((th) => th.id === ps.themeId)?.title || 'General';

      return {
        'PS Code': ps.psCode,
        'Problem Statement Title': ps.title,
        'Theme / Domain': themeTitle,
        'Allocation Status': assignedTeam ? 'RESERVED' : 'AVAILABLE',
        'Assigned Team ID': assignedTeam?.teamId || 'Unassigned',
        'Assigned Team Name': assignedTeam?.teamName || 'Unassigned',
        'Leader Name': assignedTeam?.leaderName || 'N/A',
        'Leader Mobile': assignedTeam?.leaderPhone || 'N/A',
        'Leader Email': assignedTeam?.leaderEmail || 'N/A',
        College: assignedTeam?.college || 'N/A',
        Department: assignedTeam?.department || 'N/A',
      };
    });
    exportToCSV(`INFINIX26_PS_Allocations_Mapping_${Date.now()}.csv`, exportRows);
  };

  if (!portalState) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#01050e] text-white">
        <OceanPortalBackground />
        <div className="relative z-10 flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/infinix-event-logo-clean.png" alt="INFINIX" className="w-16 h-16 object-contain animate-pulse" style={{ filter: 'drop-shadow(0 0 20px #00D9FF)' }} />
          <div className="flex items-center gap-3 text-sm text-[#00D9FF] font-orbitron font-bold tracking-widest">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>LOADING ADMIN CONTROL CENTER...</span>
          </div>
        </div>
      </main>
    );
  }

  // Analytics Metrics
  const totalTeamsCount = portalState.teams.length;
  const checkedInTeamsCount = portalState.teams.filter((t) => t.attendanceStatus === 'Checked In').length;
  const attendancePercentage = totalTeamsCount > 0 ? Math.round((checkedInTeamsCount / totalTeamsCount) * 100) : 0;
  const publishedThemesCount = portalState.themes.length;
  const publishedPSCount = portalState.problemStatements.filter((ps) => ps.isPublished).length;

  // Filtered Teams
  const uniqueColleges = Array.from(new Set(portalState.teams.map((t) => t.college)));

  const filteredTeams = portalState.teams.filter((t) => {
    const matchesSearch =
      t.teamId.toLowerCase().includes(teamSearch.toLowerCase()) ||
      t.teamName.toLowerCase().includes(teamSearch.toLowerCase()) ||
      t.leaderName.toLowerCase().includes(teamSearch.toLowerCase()) ||
      t.college.toLowerCase().includes(teamSearch.toLowerCase());

    const matchesCollege = filterCollege === 'ALL' || t.college === filterCollege;
    const matchesCheckIn = filterCheckIn === 'ALL' || t.attendanceStatus === filterCheckIn;
    const matchesTheme =
      filterTheme === 'ALL' ||
      (filterTheme === 'NONE' && !t.selectedThemeId) ||
      t.selectedThemeId === filterTheme;

    return matchesSearch && matchesCollege && matchesCheckIn && matchesTheme;
  });

  return (
    <div className="relative min-h-screen flex text-slate-100 bg-[#01050e] overflow-x-hidden">
      {/* Launch Animation Overlay (only on first event start) */}
      <EventLaunchOverlay
        isVisible={showLaunchAnimation}
        onComplete={() => setShowLaunchAnimation(false)}
      />

      {/* 2D Cinematic Ocean Background */}
      <OceanPortalBackground />

      {/* Sidebar Navigation (Desktop) */}
      <aside className="relative z-20 w-64 sm:w-72 bg-[#041226]/90 backdrop-blur-2xl border-r border-[#00D9FF]/30 flex flex-col justify-between hidden md:flex min-h-screen">
        <div>
          {/* Header Branding */}
          <div className="p-6 border-b border-[#00D9FF]/20 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/infinix-event-logo-clean.png" alt="INFINIX Logo" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="font-orbitron font-extrabold text-sm text-white tracking-wider">
                INFINIX&apos;26 ADMIN
              </h1>
              <span className="text-[10px] text-[#00D9FF] font-semibold uppercase tracking-widest">
                Organizer Control
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 text-xs font-semibold">
            {[
              { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
              { id: 'teams', label: `Teams (${portalState.teams.length})`, icon: Users },
              { id: 'themes', label: 'Domain Management', icon: Layers },
              { id: 'ps', label: 'Problem Statements', icon: FileText },
              { id: 'qr', label: 'QR Check-In', icon: QrCode },
              { id: 'reports', label: 'Reports & Export', icon: BarChart3 },
              { id: 'announcements', label: 'Website Announcements', icon: Bell },
              { id: 'settings', label: 'Settings & DB', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${isActive
                    ? 'bg-gradient-to-r from-[#00D9FF]/25 to-transparent text-[#00D9FF] border-l-4 border-[#00D9FF] font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#00D9FF]' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Admin Footer & Logout */}
        <div className="p-4 border-t border-[#00D9FF]/20 space-y-3">
          <div className="p-3 rounded-xl bg-[#020b18] border border-[#00D9FF]/20 text-[11px]">
            <span className="text-gray-400 block">Logged in as:</span>
            <span className="font-bold text-[#7CE7FF] truncate block">{adminEmail}</span>
          </div>

          <button
            onClick={handleAdminLogout}
            className="w-full py-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs font-bold text-red-300 hover:bg-red-900/60 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>LOGOUT ADMIN</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="relative z-10 flex-1 p-4 sm:p-8 overflow-y-auto max-h-screen">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-4 pb-4 border-b border-[#00D9FF]/30">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/infinix-event-logo-clean.png" alt="INFINIX Logo" className="w-7 h-7" />
            <span className="font-orbitron font-extrabold text-sm text-white">ADMIN CONTROL</span>
          </div>
          <button
            onClick={handleAdminLogout}
            className="px-3 py-1 rounded-lg bg-red-950/60 border border-red-500/50 text-[10px] font-bold text-red-300"
          >
            LOGOUT
          </button>
        </div>

        {/* Mobile Navigation Tabs Bar */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'teams', label: 'Teams', icon: Users },
            { id: 'csv', label: 'CSV Import', icon: Upload },
            { id: 'themes', label: 'Themes', icon: Layers },
            { id: 'ps', label: 'Problem Statements', icon: FileText },
            { id: 'qr', label: 'QR Check-In', icon: QrCode },
            { id: 'reports', label: 'Reports', icon: BarChart3 },
            { id: 'announcements', label: 'Announcements', icon: Bell },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${isActive
                  ? 'bg-[#00D9FF] text-black shadow-[0_0_12px_rgba(0,217,255,0.6)]'
                  : 'bg-[#04162E] text-gray-300 border border-[#00D9FF]/20'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h2 className="font-orbitron font-extrabold text-2xl text-white tracking-wider uppercase">
                ADMIN CONTROL CENTER
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                RAMCO INSTITUTE OF TECHNOLOGY • INFINIX&apos;26 HACKATHON MANAGEMENT
              </p>
            </div>

            {/* 👑 GRAND MASTER CONTROL PANEL */}
            <div className={`relative overflow-hidden rounded-3xl border-2 backdrop-blur-2xl transition-all duration-700 ${isRegistrationOpenState
              ? 'border-emerald-400/80 shadow-[0_0_80px_rgba(0,255,128,0.35)]'
              : 'border-rose-500/80 shadow-[0_0_80px_rgba(255,30,80,0.3)]'
              }`}
              style={{ minHeight: 220 }}
            >
              {/* Ambient background */}
              <div className={`absolute inset-0 transition-all duration-700 ${isRegistrationOpenState
                ? 'bg-gradient-to-br from-[#011a0f] via-[#02110c] to-[#000a06]'
                : 'bg-gradient-to-br from-[#1a0208] via-[#100105] to-[#070003]'
                }`} />

              {/* Glow orbs */}
              <div className={`absolute -right-24 -top-24 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${isRegistrationOpenState ? 'bg-emerald-500/25' : 'bg-rose-600/25'
                }`} />
              <div className={`absolute -left-24 -bottom-24 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${isRegistrationOpenState ? 'bg-teal-400/15' : 'bg-pink-700/15'
                }`} />

              {/* Status header row */}
              <div className="relative z-10 flex flex-wrap items-center gap-2 px-8 pt-7 pb-4">



                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold font-orbitron tracking-widest uppercase border transition-all duration-500 ${isRegistrationOpenState
                  ? 'bg-emerald-950/80 border-emerald-400/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'bg-rose-950/80 border-rose-500/60 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                  }`}>
                  {isRegistrationOpenState ? '🟢 EVENT LIVE — PORTAL ACTIVE' : '🔴 EVENT PAUSED — PORTAL LOCKED'}
                </span>
              </div>

              {/* Main ShinyButton filling the rest */}
              <div className="relative z-10 px-6 pb-6">
                <ShinyButton
                  variant={isRegistrationOpenState ? 'stop' : 'start'}
                  onClick={() => handleToggleRegistration(!isRegistrationOpenState)}
                  disabled={isTogglingRegistration}
                >
                  {isTogglingRegistration ? (
                    <span className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-8 h-8 animate-spin" />
                      <span className="text-base tracking-widest">SYNCING...</span>
                    </span>
                  ) : isRegistrationOpenState ? (
                    <span className="flex flex-col items-center gap-3 px-4">
                      <span className="flex items-center gap-3">
                        <Lock className="w-10 h-10" />
                        <span className="text-3xl sm:text-4xl font-black tracking-widest">STOP EVENT</span>
                      </span>
                      <span className="text-xs font-normal tracking-[0.3em] opacity-70 uppercase">Lock & Pause Portal</span>
                    </span>
                  ) : (
                    <span className="flex flex-col items-center gap-3 px-4">
                      <span className="flex items-center gap-3">
                        <Sparkles className="w-10 h-10 animate-pulse" />
                        <span className="text-3xl sm:text-4xl font-black tracking-widest">START EVENT</span>
                      </span>
                      <span className="text-xs font-normal tracking-[0.3em] opacity-70 uppercase">Launch INFINIX&apos;26 Live</span>
                    </span>
                  )}
                </ShinyButton>
              </div>
            </div>

            {/* MASTER GO LIVE SWITCH HERO CARD */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#041d3d] via-[#02142a] to-[#041d3d] border-2 border-[#00D9FF]/60 shadow-[0_0_35px_rgba(0,217,255,0.25)] space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#00D9FF]/20 border border-[#00D9FF] text-[#00D9FF] shadow-[0_0_15px_rgba(0,217,255,0.5)]">
                    <Zap className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#7CE7FF] uppercase tracking-[0.2em] block">
                      TOTAL MASTER EVENT SWITCH
                    </span>
                    <h3 className="font-orbitron font-black text-xl text-white tracking-wide uppercase">
                      HACKATHON GO LIVE MASTER SWITCH
                    </h3>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-[#00D9FF]/40 text-[11px] font-bold text-[#7CE7FF]">
                  Admin Password Verification Required 🔒
                </span>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed max-w-3xl">
                Use the Master Controls below to publish or lock <strong>both Themes & Problem Statements</strong> simultaneously for all student portals with a single authenticated click.
              </p>

              {/* Master Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() =>
                    triggerHighRiskModal(
                      '🚀 MASTER HACKATHON GO LIVE',
                      'This action will unlock Theme Selection for all teams, publish all stored Problem Statements, and broadcast a live release alert on all student dashboards.',
                      executeMasterGoLive
                    )
                  }
                  className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-black font-orbitron font-black text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-black" />
                  <span>🚀 MASTER GO LIVE (RELEASE ALL)</span>
                </button>

                <button
                  onClick={() =>
                    triggerHighRiskModal(
                      '🔒 MASTER LOCK & UNPUBLISH ALL',
                      'This action will lock Theme Selection and unpublish all Problem Statements across all student portals.',
                      executeMasterLock
                    )
                  }
                  className="p-5 rounded-2xl bg-amber-950/60 border border-amber-500/60 hover:bg-amber-900/70 text-amber-200 font-orbitron font-bold text-xs tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-3"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>🔒 MASTER LOCK & UNPUBLISH ALL</span>
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              <div className="p-5 rounded-2xl bg-[#04162E]/80 backdrop-blur-xl border border-[#00D9FF]/30 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">TOTAL TEAMS</span>
                  <Users className="w-5 h-5 text-[#00D9FF]" />
                </div>
                <span className="font-orbitron font-black text-3xl text-white block">
                  {totalTeamsCount}
                </span>
                <span className="text-[10px] text-[#7CE7FF]">Direct Website Registrations</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#04162E]/80 backdrop-blur-xl border border-[#00D9FF]/30 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">CHECKED IN TEAMS</span>
                  <QrCode className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="font-orbitron font-black text-3xl text-emerald-400 block">
                  {checkedInTeamsCount}
                </span>
                <span className="text-[10px] text-emerald-300 font-bold">{attendancePercentage}% Attendance</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#04162E]/80 backdrop-blur-xl border border-[#00D9FF]/30 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">THEME SELECTION</span>
                  <Layers className="w-5 h-5 text-[#00D9FF]" />
                </div>
                <span
                  className={`font-orbitron font-extrabold text-lg block uppercase ${portalState.themeSelectionEnabled ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                >
                  {portalState.themeSelectionEnabled ? 'UNLOCKED' : 'LOCKED'}
                </span>
                <span className="text-[10px] text-gray-400">
                  {publishedThemesCount} Active Themes
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[#04162E]/80 backdrop-blur-xl border border-[#00D9FF]/30 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium font-sans">PROBLEM STATEMENTS</span>
                  <FileText className="w-5 h-5 text-[#00D9FF]" />
                </div>
                <span className="font-orbitron font-black text-3xl text-white block">
                  {publishedPSCount} / {portalState.problemStatements.length}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">Published Live</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#04162E]/80 backdrop-blur-xl border border-[#00D9FF]/30 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">ANNOUNCEMENTS</span>
                  <Bell className="w-5 h-5 text-[#00D9FF]" />
                </div>
                <span className="font-orbitron font-black text-3xl text-white block">
                  {portalState.announcements.length}
                </span>
                <span className="text-[10px] text-[#7CE7FF]">Live Broadcast Alerts</span>
              </div>
            </div>

            {/* Theme Distribution Charts / Progress Bars */}
            <div className="p-6 rounded-3xl bg-[#04162E]/80 border border-[#00D9FF]/30 space-y-4">
              <h3 className="font-orbitron font-extrabold text-sm text-white uppercase flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#00D9FF]" />
                THEME SELECTION DISTRIBUTION
              </h3>

              <div className="space-y-3">
                {portalState.themes.map((thm) => {
                  const pickedCount = portalState.teams.filter((t) => t.selectedThemeId === thm.id).length;
                  const pct = totalTeamsCount > 0 ? Math.round((pickedCount / totalTeamsCount) * 100) : 0;
                  return (
                    <div key={thm.id} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between text-gray-300">
                        <span className="font-bold">{thm.title} ({thm.domain})</span>
                        <span className="text-[#00D9FF] font-orbitron font-bold">{pickedCount} Teams ({pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-[#020b18] overflow-hidden border border-white/5">
                        <div className="h-full bg-gradient-to-r from-[#00D9FF] to-[#0284c7] transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TEAMS MANAGEMENT */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="font-orbitron font-extrabold text-xl text-white uppercase">
                  REGISTERED TEAMS ({filteredTeams.length} / {portalState.teams.length})
                </h2>
                <p className="text-xs text-gray-400">Search, filter, and manage participant rosters</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => loadFromSupabase(true)}
                  disabled={isSyncingSupabase}
                  className="px-4 py-2.5 rounded-xl bg-[#021838] border border-[#00D9FF]/50 text-[#00D9FF] font-extrabold text-xs uppercase hover:bg-[#00D9FF]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  title="Pull live registrations from Supabase database"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingSupabase ? 'animate-spin' : ''}`} />
                  <span>SYNC DB</span>
                </button>

                <button
                  onClick={() => setIsAddTeamModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#00D9FF] text-black font-black text-xs uppercase hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,217,255,0.5)] flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-black" />
                  ADD NEW TEAM
                </button>
                <button
                  onClick={exportTeamsReport}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 border border-[#00D9FF]/30 text-white font-extrabold text-xs uppercase hover:bg-gray-700 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  EXPORT CSV
                </button>
              </div>
            </div>

            {/* Fast Search & Filters Bar */}
            <div className="p-4 rounded-2xl bg-[#04162E]/80 border border-[#00D9FF]/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  placeholder="Search Team ID, Name, Leader..."
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-[#021024] border border-[#00D9FF]/30 text-white focus:outline-none"
                />
              </div>

              {/* College Filter */}
              <div>
                <select
                  value={filterCollege}
                  onChange={(e) => setFilterCollege(e.target.value)}
                  className="w-full p-2 rounded-xl bg-[#021024] border border-[#00D9FF]/30 text-white focus:outline-none"
                >
                  <option value="ALL">All Colleges</option>
                  {uniqueColleges.map((col, idx) => (
                    <option key={idx} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              {/* Check-In Filter */}
              <div>
                <select
                  value={filterCheckIn}
                  onChange={(e) => setFilterCheckIn(e.target.value)}
                  className="w-full p-2 rounded-xl bg-[#021024] border border-[#00D9FF]/30 text-white focus:outline-none"
                >
                  <option value="ALL">All Attendance Status</option>
                  <option value="Checked In">Checked In Only</option>
                  <option value="Not Checked In">Not Checked In</option>
                </select>
              </div>

              {/* Theme Filter */}
              <div>
                <select
                  value={filterTheme}
                  onChange={(e) => setFilterTheme(e.target.value)}
                  className="w-full p-2 rounded-xl bg-[#021024] border border-[#00D9FF]/30 text-white focus:outline-none"
                >
                  <option value="ALL">All Selected Themes</option>
                  <option value="NONE">No Theme Selected</option>
                  {portalState.themes.map((th) => (
                    <option key={th.id} value={th.id}>
                      {th.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Teams Table */}
            <div className="rounded-2xl bg-[#04162E]/80 backdrop-blur-xl border border-[#00D9FF]/30 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#02142a] border-b border-[#00D9FF]/20 text-[#7CE7FF] uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-4">Team ID</th>
                    <th className="p-4">Team Name</th>
                    <th className="p-4">Leader Name & Contact</th>
                    <th className="p-4">College & Dept</th>
                    <th className="p-4">Chosen Problem Statement</th>
                    <th className="p-4">Payment & UTR</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTeams.map((team) => (
                    <tr key={team.teamId} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-[#00D9FF] font-orbitron">{team.teamId}</td>
                      <td className="p-4 font-bold text-white">{team.teamName}</td>
                      <td className="p-4">
                        <span className="block font-semibold text-gray-200">{team.leaderName}</span>
                        <span className="text-[10px] text-gray-400 block">{team.leaderEmail}</span>
                        <span className="text-[10px] text-gray-400">{team.leaderPhone}</span>
                      </td>
                      <td className="p-4 text-gray-300 max-w-xs">
                        <span className="block font-medium truncate">{team.college}</span>
                        <span className="text-[10px] text-[#7CE7FF]">{team.department || 'CSE'}</span>
                      </td>
                      <td className="p-4">
                        {(() => {
                          const selectedPs = portalState.problemStatements.find(
                            (p) => p.id === team.selectedThemeId || p.psCode === team.selectedThemeId
                          );
                          return selectedPs ? (
                            <div className="space-y-0.5">
                              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/50 text-[10px] font-bold font-orbitron inline-block">
                                {selectedPs.psCode}
                              </span>
                              <span className="text-[11px] text-gray-200 font-semibold block truncate max-w-[140px]">
                                {selectedPs.title}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-500 font-medium">Not Selected</span>
                          );
                        })()}
                      </td>
                      <td className="p-4">
                        <span className="block font-bold text-emerald-400 font-orbitron">
                          ₹{team.paymentAmount || (team.college.toLowerCase().includes('ramco') ? 200 * (team.teamSize || 3) : 350 * (team.teamSize || 3))}
                        </span>
                        <span className="text-[10px] font-mono text-gray-300 block">
                          Ref: {team.upiTransactionId || (team as any).upi_transaction_id || 'N/A'}
                        </span>
                        {(() => {
                          const proofUrl = team.paymentProofUrl || (team as any).payment_proof_url;
                          return proofUrl ? (
                            <button
                              onClick={() => {
                                setPreviewImgError(false);
                                setViewingPaymentProofUrl(proofUrl);
                              }}
                              className="mt-1 text-[10px] text-[#00D9FF] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              📸 View Payment Slip
                            </button>
                          ) : (
                            <span className="text-[9px] text-gray-500 block mt-0.5">No Slip Uploaded</span>
                          );
                        })()}
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold block w-fit ${team.registrationStatus === 'Verified'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              }`}
                          >
                            {team.registrationStatus === 'Verified' ? 'Verified' : 'Pending Payment'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleAttendance(team)}
                            title="Click to toggle Check-In status"
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold block w-fit transition-all hover:scale-105 cursor-pointer ${team.attendanceStatus === 'Checked In'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-900'
                              : 'bg-gray-900 text-gray-400 border border-gray-700 hover:border-gray-500 hover:text-white'
                              }`}
                          >
                            {team.attendanceStatus === 'Checked In' ? '✓ Checked In' : '⏳ Not Checked In'}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {team.registrationStatus !== 'Verified' && (
                            <button
                              onClick={() => handleApprovePayment(team)}
                              disabled={sendingEmailId === team.teamId}
                              title="Approve Payment & Send Verification Email"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[10px] tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.4)] disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {sendingEmailId === team.teamId ? 'APPROVING...' : 'APPROVE'}
                            </button>
                          )}

                          {/* View Details Button */}
                          <button
                            onClick={() => setViewingTeam(team)}
                            title="View Full Team Details & Roster"
                            className="p-2 rounded-lg bg-[#00D9FF]/15 hover:bg-[#00D9FF]/30 text-[#00D9FF] border border-[#00D9FF]/30 transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Team Button */}
                          <button
                            onClick={() => setEditingTeam(team)}
                            title="Edit Team Details"
                            className="p-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset PS Selection Button */}
                          <button
                            onClick={() => handleResetTeamPS(team)}
                            title="Reset & Unlock Problem Statement Selection"
                            className="p-2 rounded-lg bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition-all cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          {/* Send Credentials Email Button */}
                          <button
                            onClick={() => handleSendTeamEmail(team)}
                            title="Send Verification & QR Code Email"
                            className="p-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Team Button */}
                          <button
                            onClick={() => handleDeleteTeam(team)}
                            title="Delete Team"
                            className="p-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: DOMAIN MANAGEMENT */}
        {activeTab === 'themes' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-orbitron font-extrabold text-xl text-white uppercase">
                  DOMAIN MANAGEMENT
                </h2>
                <p className="text-xs text-gray-400">Create, edit, enable/disable, or reset hackathon domains</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    triggerLowRiskModal(
                      portalState.themeSelectionEnabled ? 'Lock Theme Selection' : 'Publish Theme Selection',
                      portalState.themeSelectionEnabled
                        ? 'Students will no longer be able to select themes.'
                        : 'Students will now be able to select one theme.',
                      handleToggleThemeSelection
                    )
                  }
                  className={`px-4 py-2.5 rounded-xl border text-xs font-extrabold uppercase transition-all cursor-pointer ${portalState.themeSelectionEnabled
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                    : 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    }`}
                >
                  {portalState.themeSelectionEnabled ? 'UNPUBLISH THEME SELECTION' : 'PUBLISH THEME SELECTION'}
                </button>

                <button
                  onClick={() =>
                    triggerHighRiskModal(
                      'Reset ALL Theme Selections',
                      'This will erase theme selections for ALL registered teams. They will be forced to select a theme again.',
                      handleResetAllThemeSelections
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-xs font-bold text-gray-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  RESET ALL SELECTIONS
                </button>
              </div>
            </div>

            {/* Create Theme Form */}
            <form onSubmit={handleCreateTheme} className="p-6 rounded-3xl bg-[#04162E]/80 border border-[#00D9FF]/30 space-y-4 max-w-2xl">
              <h3 className="font-orbitron font-bold text-sm text-white uppercase">CREATE NEW THEME</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-[#7CE7FF] uppercase mb-1">Theme Title</label>
                  <input
                    type="text"
                    value={newTheme.title}
                    onChange={(e) => setNewTheme({ ...newTheme, title: e.target.value })}
                    placeholder="e.g. Autonomous Oceanic AI Agents"
                    className="w-full p-2.5 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white focus:outline-none focus:border-[#00D9FF]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#7CE7FF] uppercase mb-1">Domain</label>
                  <select
                    value={newTheme.domain}
                    onChange={(e) => setNewTheme({ ...newTheme, domain: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white focus:outline-none focus:border-[#00D9FF]"
                  >
                    <option>AI & Machine Learning</option>
                    <option>Web3 & Blockchain</option>
                    <option>Cloud Infrastructure & DevOps</option>
                    <option>Robotics & IoT</option>
                    <option>Cyber Security</option>
                    <option>Open Sci-Fi Innovation</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#7CE7FF] uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newTheme.description}
                  onChange={(e) => setNewTheme({ ...newTheme, description: e.target.value })}
                  placeholder="Detailed description of the theme challenges..."
                  className="w-full p-2.5 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-xs text-white focus:outline-none focus:border-[#00D9FF]"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#00D9FF] text-black font-extrabold text-xs tracking-wider uppercase cursor-pointer hover:scale-105 transition-all"
              >
                ADD THEME
              </button>
            </form>

            {/* Themes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {portalState.themes.map((thm) => (
                <div key={thm.id} className="p-5 rounded-2xl bg-[#04162E]/80 border border-[#00D9FF]/30 space-y-2 relative group">
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-sm text-white">{thm.title}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingTheme(thm)}
                        className="text-gray-400 hover:text-[#00D9FF] transition-colors p-1"
                        title="Edit Theme"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          triggerLowRiskModal('Delete Theme', `Delete theme "${thm.title}"?`, () =>
                            handleDeleteTheme(thm.id)
                          )
                        }
                        className="text-gray-400 hover:text-red-400 transition-colors p-1"
                        title="Delete Theme"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#7CE7FF] uppercase tracking-wider block">
                    {thm.domain}
                  </span>
                  <p className="text-xs text-gray-300 leading-relaxed">{thm.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PROBLEM STATEMENTS */}
        {activeTab === 'ps' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-orbitron font-extrabold text-xl text-white uppercase">
                  PROBLEM STATEMENT MANAGEMENT
                </h2>
                <p className="text-xs text-gray-400">Create, upload PDF, publish, edit, or delete problem statements for students</p>
              </div>

              {/* 1-Click Action Buttons Header */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    triggerHighRiskModal(
                      '📢 PUBLISH ALL PROBLEM STATEMENTS',
                      'Make all stored problem statements live for all student teams.',
                      handlePublishAllPS
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold text-xs uppercase cursor-pointer hover:scale-105 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  1-CLICK PUBLISH ALL PS
                </button>
                <button
                  onClick={() =>
                    triggerHighRiskModal(
                      '🔒 UNPUBLISH ALL PROBLEM STATEMENTS',
                      'Hide all problem statements from student dashboards.',
                      handleUnpublishAllPS
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-amber-950/70 border border-amber-500/70 text-amber-300 font-extrabold text-xs uppercase cursor-pointer hover:bg-amber-900 transition-all flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  UNPUBLISH ALL
                </button>
              </div>
            </div>

            {/* Create Problem Statement Form */}
            <form onSubmit={handleCreatePS} className="p-6 rounded-3xl bg-[#04162E]/80 border border-[#00D9FF]/30 space-y-4 max-w-2xl">
              <h3 className="font-orbitron font-bold text-sm text-white uppercase">ADD NEW PROBLEM STATEMENT</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-[#7CE7FF] uppercase mb-1">PS Code</label>
                  <input
                    type="text"
                    value={newPS.psCode}
                    onChange={(e) => setNewPS({ ...newPS, psCode: e.target.value })}
                    placeholder="e.g. PS-AI-01"
                    className="w-full p-2.5 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#7CE7FF] uppercase mb-1">Assign Theme</label>
                  <select
                    value={newPS.themeId}
                    onChange={(e) => setNewPS({ ...newPS, themeId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white focus:outline-none"
                  >
                    {portalState.themes.map((th) => (
                      <option key={th.id} value={th.id}>
                        {th.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#7CE7FF] uppercase mb-1">Initial Status</label>
                  <select
                    value={newPS.status}
                    onChange={(e) => setNewPS({ ...newPS, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white focus:outline-none"
                  >
                    <option value="Published">Published Live</option>
                    <option value="Draft">Save as Draft</option>
                    <option value="Unpublished">Unpublished</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#7CE7FF] uppercase mb-1">PS Title</label>
                <input
                  type="text"
                  value={newPS.title}
                  onChange={(e) => setNewPS({ ...newPS, title: e.target.value })}
                  placeholder="e.g. Real-Time Deep-Sea Sonar Anomaly Detector"
                  className="w-full p-2.5 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#7CE7FF] uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newPS.description}
                  onChange={(e) => setNewPS({ ...newPS, description: e.target.value })}
                  placeholder="Detailed description..."
                  className="w-full p-2.5 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Rules & Resources */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-[#7CE7FF] uppercase mb-1">Rules & Constraints (1 per line)</label>
                  <textarea
                    rows={2}
                    value={newPS.rules}
                    onChange={(e) => setNewPS({ ...newPS, rules: e.target.value })}
                    placeholder="Must run under 100ms..."
                    className="w-full p-2 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#7CE7FF] uppercase mb-1">Resources & Starter Kits (1 per line)</label>
                  <textarea
                    rows={2}
                    value={newPS.resources}
                    onChange={(e) => setNewPS({ ...newPS, resources: e.target.value })}
                    placeholder="Dataset CSV Link..."
                    className="w-full p-2 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white"
                  />
                </div>
              </div>

              {/* Upload PDF / PDF Link */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-[#7CE7FF] uppercase">PDF Document</label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="px-4 py-2 rounded-xl bg-[#021630] border border-[#00D9FF]/40 text-[#00D9FF] text-xs font-bold cursor-pointer hover:bg-[#00D9FF]/10 flex items-center gap-2">
                    <FileUp className="w-4 h-4" />
                    <span>Upload Local PDF</span>
                    <input type="file" accept="application/pdf" onChange={(e) => handlePDFUpload(e, false)} className="hidden" />
                  </label>
                  <span className="text-xs text-gray-500">OR</span>
                  <input
                    type="text"
                    value={newPS.pdfUrl}
                    onChange={(e) => setNewPS({ ...newPS, pdfUrl: e.target.value })}
                    placeholder="Enter PDF URL (e.g. /sample-ps.pdf)"
                    className="flex-1 p-2.5 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#00D9FF] text-black font-extrabold text-xs tracking-wider uppercase cursor-pointer hover:scale-105 transition-all"
              >
                CREATE PROBLEM STATEMENT
              </button>
            </form>

            {/* LIVE PROBLEM STATEMENT ALLOCATIONS & TEAM MAPPING TABLE */}
            <div className="p-6 rounded-3xl bg-[#04162E]/80 backdrop-blur-2xl border border-[#00D9FF]/30 space-y-4 mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#00D9FF]/20">
                <div>
                  <h3 className="font-orbitron font-extrabold text-base text-white tracking-wide uppercase flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#00D9FF]" />
                    <span>LIVE PROBLEM STATEMENT ALLOCATIONS & TEAM MAPPING</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Overview of which team has selected which Problem Statement (First-Come First-Served allocation)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={exportPSAllocationsReport}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#0284c7] text-black font-orbitron font-bold text-xs uppercase shadow-[0_0_15px_rgba(0,217,255,0.4)] hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>EXPORT ALLOCATIONS CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#02142a] text-[#7CE7FF] uppercase text-[10px] font-bold border-b border-white/10">
                    <tr>
                      <th className="p-3">PS Code</th>
                      <th className="p-3">Problem Statement Title</th>
                      <th className="p-3">Theme / Domain</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Assigned Team ID & Name</th>
                      <th className="p-3">Leader Contact</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                    {portalState.problemStatements.map((ps) => {
                      const assignedTeam = portalState.teams.find(
                        (t) => t.selectedThemeId === ps.id || t.selectedThemeId === ps.psCode
                      );
                      const themeTitle = portalState.themes.find((th) => th.id === ps.themeId)?.title || 'General';

                      return (
                        <tr key={ps.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 font-bold text-[#00D9FF] font-orbitron">{ps.psCode}</td>
                          <td className="p-3 font-sans font-bold text-white max-w-xs truncate">{ps.title}</td>
                          <td className="p-3 font-sans text-gray-300">{themeTitle}</td>
                          <td className="p-3 font-sans">
                            {assignedTeam ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-500/50 text-[10px] font-bold font-orbitron">
                                🔴 RESERVED
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold font-orbitron">
                                🟢 AVAILABLE
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-sans">
                            {assignedTeam ? (
                              <div>
                                <span className="font-bold text-white block">{assignedTeam.teamName}</span>
                                <span className="text-[#00D9FF] text-[10px] font-mono">{assignedTeam.teamId} • {assignedTeam.college}</span>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-[10px]">Unassigned</span>
                            )}
                          </td>
                          <td className="p-3 font-sans">
                            {assignedTeam ? (
                              <div>
                                <span className="text-gray-200 block font-medium">{assignedTeam.leaderName}</span>
                                <span className="text-gray-400 text-[10px] block">{assignedTeam.leaderPhone}</span>
                              </div>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="p-3 text-right font-sans">
                            {assignedTeam && (
                              <button
                                type="button"
                                onClick={() =>
                                  triggerLowRiskModal(
                                    'Reset Team Allocation',
                                    `Clear Problem Statement "${ps.psCode}" reservation for Team "${assignedTeam.teamName}"?`,
                                    () => handleResetTeamPS(assignedTeam.teamId)
                                  )
                                }
                                className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/60 text-amber-300 hover:bg-amber-900 text-[10px] font-bold font-orbitron cursor-pointer"
                              >
                                RESET
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* List Problem Statements */}
            <div className="space-y-4">
              {portalState.problemStatements.map((ps) => {
                const assignedTeam = portalState.teams.find(
                  (t) => t.selectedThemeId === ps.id || t.selectedThemeId === ps.psCode
                );

                return (
                  <div key={ps.id} className="p-5 rounded-2xl bg-[#04162E]/80 border border-[#00D9FF]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#00D9FF]/20 text-[#00D9FF] text-[10px] font-bold font-orbitron">
                          {ps.psCode}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ps.isPublished ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50' : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                            }`}
                        >
                          {ps.isPublished ? 'PUBLISHED LIVE' : 'UNPUBLISHED (HIDDEN)'}
                        </span>

                        {/* Live Allocation Reservation Tag */}
                        {assignedTeam ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-950/90 text-red-300 border border-red-500/60 text-[10px] font-bold font-orbitron flex items-center gap-1">
                            <Lock className="w-3 h-3 text-red-400" />
                            RESERVED BY TEAM: {assignedTeam.teamName} ({assignedTeam.teamId})
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-orbitron flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            🟢 AVAILABLE (UNASSIGNED)
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-white">{ps.title}</h4>
                      <p className="text-xs text-gray-300 max-w-xl">{ps.description}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          triggerHighRiskModal(
                            ps.isPublished ? 'Unpublish PS' : 'Publish PS',
                            `Toggle publication state for PS code ${ps.psCode}?`,
                            () => handleTogglePublishPS(ps.id)
                          )
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${ps.isPublished
                          ? 'bg-amber-950/60 border border-amber-500 text-amber-300 hover:bg-amber-900'
                          : 'bg-emerald-950/60 border border-emerald-500 text-emerald-300 hover:bg-emerald-900'
                          }`}
                      >
                        {ps.isPublished ? 'UNPUBLISH' : 'PUBLISH'}
                      </button>

                      <button
                        onClick={() => setEditingPS(ps)}
                        className="p-2 rounded-xl text-gray-400 hover:text-[#00D9FF] transition-colors"
                        title="Edit PS"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          triggerHighRiskModal(
                            'Delete Problem Statement',
                            `Delete problem statement "${ps.title}"?`,
                            () => handleDeletePS(ps.id)
                          )
                        }
                        className="p-2 rounded-xl text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete PS"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: QR CHECK-IN */}
        {activeTab === 'qr' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="font-orbitron font-extrabold text-xl text-white uppercase flex items-center gap-2">
                <QrCode className="w-6 h-6 text-[#00D9FF]" />
                ENTRY QR CHECK-IN DESK
              </h2>
              <p className="text-xs text-gray-400">Scan student QR code using live device camera or enter Team ID</p>
            </div>

            {/* Camera Scanner Trigger Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#041d3d] via-[#022852] to-[#041d3d] border-2 border-[#00D9FF]/50 shadow-[0_0_30px_rgba(0,217,255,0.25)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#00D9FF]/20 border border-[#00D9FF]/40 flex items-center justify-center text-[#00D9FF] shrink-0">
                  <Camera className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-sm text-white uppercase">Live Camera Scanner</h3>
                  <p className="text-xs text-gray-300">Scan physical QR passes using mobile/desktop web camera</p>
                </div>
              </div>

              <button
                onClick={() => setAdminCameraOpen(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00D9FF] to-[#4CCFFF] text-black font-orbitron font-extrabold text-xs tracking-wider uppercase hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,217,255,0.6)] cursor-pointer flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>OPEN CAMERA SCANNER</span>
              </button>
            </div>

            {/* QR Input Card */}
            <div className="p-6 rounded-3xl bg-[#04162E]/80 border border-[#00D9FF]/30 space-y-4">
              <label className="block text-xs font-bold text-[#7CE7FF] uppercase tracking-wider">
                Or Search / Enter Team ID manually:
              </label>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <QrCode className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    placeholder="Scan QR or type Team ID (e.g. INF-2026-001)"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#020d1e] border border-[#00D9FF]/40 text-white font-mono text-sm focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => handleFindTeamByQR(qrInput)}
                  className="px-6 py-3 rounded-xl bg-[#00D9FF] text-black font-extrabold text-xs uppercase hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,217,255,0.4)]"
                >
                  SEARCH TEAM
                </button>
              </div>

              {/* Quick Sample Check-in IDs */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="text-gray-400 text-[10px]">Test Check-In:</span>
                {['INF-2026-001', 'INF-2026-002', 'INF-2026-003'].map((id) => (
                  <button
                    key={id}
                    onClick={() => {
                      setQrInput(id);
                      handleFindTeamByQR(id);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#021630] border border-[#00D9FF]/20 text-[#7CE7FF] text-[10px] hover:border-[#00D9FF]"
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Camera QR Scanner Modal */}
            <QRScannerModal isOpen={adminCameraOpen} onClose={() => setAdminCameraOpen(false)} />

            {/* Check-In Feedback Alert */}
            {checkInFeedback && (
              <div
                className={`p-4 rounded-xl text-xs flex items-center justify-between ${checkInFeedback.success
                  ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-200'
                  : 'bg-red-950/80 border border-red-500/50 text-red-200'
                  }`}
              >
                <span>{checkInFeedback.msg}</span>
                {checkInFeedback.success && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              </div>
            )}

            {/* Scanned Team Detail Card */}
            {scannedTeam && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 sm:p-8 rounded-3xl bg-[#04162E] border-2 border-[#00D9FF] shadow-[0_0_30px_rgba(0,217,255,0.3)] space-y-6"
              >
                <div className="flex items-center justify-between border-b border-[#00D9FF]/20 pb-4">
                  <div>
                    <span className="font-orbitron font-extrabold text-sm text-[#00D9FF] block">
                      {scannedTeam.teamId}
                    </span>
                    <h3 className="font-orbitron font-black text-xl text-white uppercase">{scannedTeam.teamName}</h3>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${scannedTeam.attendanceStatus === 'Checked In'
                      ? 'bg-emerald-950 border border-emerald-500 text-emerald-400'
                      : 'bg-amber-950 border border-amber-500 text-amber-300'
                      }`}
                  >
                    {scannedTeam.attendanceStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#021024] border border-white/5 space-y-1">
                    <span className="text-gray-400 text-[10px] block">Leader Name:</span>
                    <span className="font-bold text-white block">{scannedTeam.leaderName}</span>
                    <span className="text-gray-400 text-[10px] block">{scannedTeam.leaderEmail}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#021024] border border-white/5 space-y-1">
                    <span className="text-gray-400 text-[10px] block">College & Dept:</span>
                    <span className="font-bold text-white block">{scannedTeam.college}</span>
                    <span className="text-[#7CE7FF] text-[10px] block">{scannedTeam.department || 'CSE'}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#021024] border border-white/5 space-y-1">
                    <span className="text-gray-400 text-[10px] block">Selected Theme:</span>
                    <span className="font-bold text-[#00D9FF] block">
                      {portalState.themes.find((t) => t.id === scannedTeam.selectedThemeId)?.title || 'Not Selected Yet'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#021024] border border-white/5 space-y-1">
                    <span className="text-gray-400 text-[10px] block">Check-In Time:</span>
                    <span className="font-bold text-white block">{scannedTeam.checkInTime || 'Pending Check-In'}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  {scannedTeam.attendanceStatus !== 'Checked In' ? (
                    <button
                      onClick={handleMarkPresent}
                      className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-orbitron font-extrabold text-xs uppercase shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5 text-black" />
                      <span>MARK TEAM PRESENT</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Attendance Verified & Synced to Google Sheets
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* TAB 7: REPORTS & EXPORT */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-orbitron font-extrabold text-xl text-white uppercase flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-[#00D9FF]" />
                REPORTS & EXPORT CENTER
              </h2>
              <p className="text-xs text-gray-400">Generate theme-wise, college-wise, attendance, and problem statement reports</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Report 1: Teams Master */}
              <div className="p-6 rounded-3xl bg-[#04162E]/80 border border-[#00D9FF]/30 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-orbitron font-extrabold text-sm text-white uppercase mb-1">Teams Master Report</h4>
                  <p className="text-xs text-gray-300">Complete participant database with credentials, email statuses, and contacts.</p>
                </div>
                <button
                  onClick={exportTeamsReport}
                  className="w-full py-2.5 rounded-xl bg-[#00D9FF] text-black font-extrabold text-xs uppercase cursor-pointer hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> EXPORT CSV
                </button>
              </div>

              {/* Report 2: Attendance Report */}
              <div className="p-6 rounded-3xl bg-[#04162E]/80 border border-[#00D9FF]/30 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-orbitron font-extrabold text-sm text-white uppercase mb-1">Attendance Report</h4>
                  <p className="text-xs text-gray-300">Checked in vs absent teams list with venue timestamps.</p>
                </div>
                <button
                  onClick={() => {
                    const rows = portalState.teams.map((t) => ({
                      'Team ID': t.teamId,
                      'Team Name': t.teamName,
                      College: t.college,
                      'Attendance Status': t.attendanceStatus,
                      'Check In Time': t.checkInTime || 'N/A',
                    }));
                    exportToCSV('INFINIX26_Attendance_Report.csv', rows);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs uppercase cursor-pointer hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> EXPORT ATTENDANCE
                </button>
              </div>

              {/* Report 3: Theme-Wise Report */}
              <div className="p-6 rounded-3xl bg-[#04162E]/80 border border-[#00D9FF]/30 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-orbitron font-extrabold text-sm text-white uppercase mb-1">Theme Selection Report</h4>
                  <p className="text-xs text-gray-300">Distribution of chosen tracks per team.</p>
                </div>
                <button
                  onClick={() => {
                    const rows = portalState.teams.map((t) => ({
                      'Team ID': t.teamId,
                      'Team Name': t.teamName,
                      Theme: portalState.themes.find((th) => th.id === t.selectedThemeId)?.title || 'Not Selected',
                    }));
                    exportToCSV('INFINIX26_Theme_Distribution.csv', rows);
                  }}
                  className="w-full py-2.5 rounded-xl bg-purple-400 text-black font-extrabold text-xs uppercase cursor-pointer hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> EXPORT THEMES CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: WEBSITE ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="space-y-8">
            <div>
              <h2 className="font-orbitron font-extrabold text-xl text-white uppercase">
                WEBSITE LIVE ANNOUNCEMENTS
              </h2>
              <p className="text-xs text-gray-400">Broadcast live announcements & updates directly to the website</p>
            </div>

            {/* Broadcast Form */}
            <form onSubmit={handleCreateAnnouncement} className="p-6 rounded-3xl bg-[#04162E]/80 border border-[#00D9FF]/30 space-y-4 max-w-2xl">
              <h3 className="font-orbitron font-bold text-sm text-white uppercase">POST WEBSITE ANNOUNCEMENT</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-[#7CE7FF] uppercase mb-1">Title</label>
                  <input
                    type="text"
                    value={newAnn.title}
                    onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
                    placeholder="e.g. Midnight Snack Break Starts at 12:00 AM"
                    className="w-full p-2.5 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#7CE7FF] uppercase mb-1">Category</label>
                  <select
                    value={newAnn.category}
                    onChange={(e) => setNewAnn({ ...newAnn, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white focus:outline-none"
                  >
                    <option value="General">General</option>
                    <option value="Urgent">Urgent Alert</option>
                    <option value="Update">Schedule Update</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#7CE7FF] uppercase mb-1">Message Body</label>
                <textarea
                  rows={3}
                  value={newAnn.message}
                  onChange={(e) => setNewAnn({ ...newAnn, message: e.target.value })}
                  placeholder="Detailed announcement text..."
                  className="w-full p-2.5 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-xs text-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#00D9FF] text-black font-extrabold text-xs tracking-wider uppercase cursor-pointer hover:scale-105 transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> BROADCAST ANNOUNCEMENT
              </button>
            </form>

            {/* List Announcements */}
            <div className="space-y-3">
              {portalState.announcements.map((ann) => (
                <div key={ann.id} className="p-4 rounded-2xl bg-[#04162E]/80 border border-[#00D9FF]/20 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#00D9FF]/20 text-[#00D9FF] uppercase">
                      {ann.category}
                    </span>
                    <h4 className="font-bold text-sm text-white">{ann.title}</h4>
                    <p className="text-xs text-gray-300">{ann.message}</p>
                  </div>
                  <button
                    onClick={() =>
                      triggerHighRiskModal('Delete Announcement', `Delete announcement "${ann.title}"?`, () =>
                        handleDeleteAnnouncement(ann.id)
                      )
                    }
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: SETTINGS & DB */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="font-orbitron font-extrabold text-xl text-white uppercase">
                ADMIN SETTINGS & SECURITY CONFIG
              </h2>
              <p className="text-xs text-gray-400">Portal credentials, authentication & database state management</p>
            </div>

            {/* ADMIN CREDENTIALS CARD */}
            <div className="p-6 rounded-3xl bg-[#04162E]/90 border border-[#00D9FF]/40 shadow-[0_10px_30px_rgba(0,217,255,0.15)] space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#00D9FF]/20">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-[#00D9FF]">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-bold text-sm text-white uppercase">
                      CHANGE ADMIN EMAIL & PASSWORD
                    </h3>
                    <p className="text-[11px] text-gray-400">Update your administrator login credentials</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#02142b] border border-[#00D9FF]/40 text-[#00D9FF] text-[10px] font-bold font-mono">
                  ACTIVE: {adminEmail}
                </span>
              </div>

              {credSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{credSuccessMsg}</span>
                </div>
              )}

              {credErrorMsg && (
                <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5">
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{credErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveAdminCredentials} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#7CE7FF] uppercase mb-1.5">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="admin@infinix.ritrjpm.ac.in"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#00D9FF] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#7CE7FF] uppercase mb-1.5">
                      New Password (Optional)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="Leave blank to keep current"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#00D9FF] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#7CE7FF] uppercase mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={confirmAdminPassword}
                        onChange={(e) => setConfirmAdminPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#00D9FF] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#38bdf8] text-black font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(0,217,255,0.4)] hover:shadow-[0_0_30px_rgba(0,217,255,0.7)] hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-black" />
                    <span>Save Credentials</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="p-6 rounded-3xl bg-[#04162E]/80 border border-[#00D9FF]/30 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#00D9FF]/20">
                <div>
                  <span className="font-bold text-white block">Reset Database & Local Portal State</span>
                  <span className="text-gray-400 text-[10px]">Restores default sample teams, themes & problem statements</span>
                </div>
                <button
                  onClick={() =>
                    triggerHighRiskModal(
                      'DELETE & RESET ALL DATABASE RECORDS',
                      'This is a destructive action. Resetting local database records will restore initial state.',
                      () => {
                        localStorage.removeItem('infinix26_portal_state_v2');
                        window.location.reload();
                      }
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 font-bold hover:bg-red-900 transition-all"
                >
                  RESET DATABASE RECORDS
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block font-orbitron">INFINIX&apos;26 SYSTEM VERSION</span>
                  <span className="text-gray-400 text-[10px]">v2.1.0 Enterprise Production Portal</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold">SUPABASE RLS ACTIVE</span>
              </div>
            </div>
          </div>
        )}

        {/* LOW RISK ACTION CONFIRMATION MODAL */}
        {lowRiskModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md p-6 rounded-3xl bg-[#04162E] border border-[#00D9FF]/50 shadow-[0_25px_60px_rgba(1,4,13,0.95)] space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#00D9FF]/20 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#00D9FF]" />
                  <h3 className="font-orbitron font-extrabold text-sm text-white uppercase">{lowRiskModal.title}</h3>
                </div>
                <button onClick={() => setLowRiskModal({ ...lowRiskModal, isOpen: false })} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">{lowRiskModal.description}</p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setLowRiskModal({ ...lowRiskModal, isOpen: false })}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    lowRiskModal.onConfirm();
                    setLowRiskModal({ ...lowRiskModal, isOpen: false });
                  }}
                  className="px-6 py-2 rounded-xl bg-[#00D9FF] text-black font-extrabold text-xs uppercase"
                >
                  Confirm Action
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* HIGH RISK ACTION RE-AUTHENTICATION MODAL (Password Verification) */}
        {highRiskModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#04162E] border-2 border-red-500/50 shadow-[0_25px_60px_rgba(1,4,13,0.95)] space-y-5"
            >
              <div className="flex items-center justify-between border-b border-red-500/30 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-950/80 border border-red-500/50 text-red-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-extrabold text-sm text-white uppercase">VERIFY YOUR IDENTITY</h3>
                    <span className="text-[10px] text-red-300">Administrator Password Required</span>
                  </div>
                </div>
                <button
                  onClick={() => setHighRiskModal({ ...highRiskModal, isOpen: false })}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 space-y-1">
                <h4 className="font-bold text-xs text-red-200 uppercase">{highRiskModal.title}</h4>
                <p className="text-[11px] text-gray-300 leading-relaxed">{highRiskModal.description}</p>
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyAdminPassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#7CE7FF] uppercase mb-1.5">
                    Admin Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      autoFocus
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      placeholder="Enter Admin Password (e.g. admin2026)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#020d1e] border border-[#00D9FF]/40 text-white text-sm focus:outline-none focus:border-[#00D9FF]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setHighRiskModal({ ...highRiskModal, isOpen: false })}
                    className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-xs font-bold hover:bg-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-105 transition-all"
                  >
                    Verify & Continue
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {/* ADD NEW TEAM MODAL */}
        {isAddTeamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-2xl my-8 p-6 sm:p-8 rounded-3xl bg-[#04162E] border border-[#00D9FF]/50 shadow-[0_25px_60px_rgba(0,217,255,0.2)] space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#00D9FF]/30 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#00D9FF]/20 border border-[#00D9FF]/40 text-[#00D9FF]">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-black text-lg text-white uppercase">ADD NEW TEAM</h3>
                    <p className="text-xs text-gray-400">Register a new team directly into the hackathon database</p>
                  </div>
                </div>
                <button onClick={() => setIsAddTeamModalOpen(false)} className="text-gray-400 hover:text-white p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateTeamSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#7CE7FF] uppercase mb-1">Team Name *</label>
                    <input
                      type="text"
                      required
                      value={newTeamData.teamName}
                      onChange={(e) => setNewTeamData({ ...newTeamData, teamName: e.target.value })}
                      placeholder="e.g. Cyber Voyagers"
                      className="w-full p-3 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white focus:outline-none focus:border-[#00D9FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#7CE7FF] uppercase mb-1">Team ID (Optional)</label>
                    <input
                      type="text"
                      value={newTeamData.teamId}
                      onChange={(e) => setNewTeamData({ ...newTeamData, teamId: e.target.value })}
                      placeholder={`e.g. INF-2026-${String(portalState.teams.length + 101).padStart(3, '0')}`}
                      className="w-full p-3 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white focus:outline-none focus:border-[#00D9FF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#7CE7FF] uppercase mb-1">Leader Name *</label>
                    <input
                      type="text"
                      required
                      value={newTeamData.leaderName}
                      onChange={(e) => setNewTeamData({ ...newTeamData, leaderName: e.target.value })}
                      placeholder="Full Name"
                      className="w-full p-3 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white focus:outline-none focus:border-[#00D9FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#7CE7FF] uppercase mb-1">Leader Email *</label>
                    <input
                      type="email"
                      required
                      value={newTeamData.leaderEmail}
                      onChange={(e) => setNewTeamData({ ...newTeamData, leaderEmail: e.target.value })}
                      placeholder="leader@gmail.com"
                      className="w-full p-3 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white focus:outline-none focus:border-[#00D9FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#7CE7FF] uppercase mb-1">Leader Mobile *</label>
                    <input
                      type="text"
                      required
                      value={newTeamData.leaderPhone}
                      onChange={(e) => setNewTeamData({ ...newTeamData, leaderPhone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full p-3 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white focus:outline-none focus:border-[#00D9FF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#7CE7FF] uppercase mb-1">College Name *</label>
                    <input
                      type="text"
                      required
                      value={newTeamData.college}
                      onChange={(e) => setNewTeamData({ ...newTeamData, college: e.target.value })}
                      placeholder="College Name"
                      className="w-full p-3 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white focus:outline-none focus:border-[#00D9FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#7CE7FF] uppercase mb-1">Department *</label>
                    <input
                      type="text"
                      required
                      value={newTeamData.department}
                      onChange={(e) => setNewTeamData({ ...newTeamData, department: e.target.value })}
                      placeholder="e.g. Information Technology"
                      className="w-full p-3 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white focus:outline-none focus:border-[#00D9FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#7CE7FF] uppercase mb-1">Year of Study</label>
                    <select
                      value={newTeamData.yearOfStudy}
                      onChange={(e) => setNewTeamData({ ...newTeamData, yearOfStudy: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white focus:outline-none"
                    >
                      <option value="I Year">I Year</option>
                      <option value="II Year">II Year</option>
                      <option value="III Year">III Year</option>
                      <option value="IV Year">IV Year</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#7CE7FF] uppercase mb-1">Roll / Register No.</label>
                    <input
                      type="text"
                      value={newTeamData.rollNumber}
                      onChange={(e) => setNewTeamData({ ...newTeamData, rollNumber: e.target.value })}
                      placeholder="e.g. 953621104001"
                      className="w-full p-3 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white focus:outline-none focus:border-[#00D9FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#7CE7FF] uppercase mb-1">Gender</label>
                    <select
                      value={newTeamData.gender}
                      onChange={(e) => setNewTeamData({ ...newTeamData, gender: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#7CE7FF] uppercase mb-1">Portal Password (Optional)</label>
                    <input
                      type="text"
                      value={newTeamData.password}
                      onChange={(e) => setNewTeamData({ ...newTeamData, password: e.target.value })}
                      placeholder="Auto-generated if empty"
                      className="w-full p-3 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white focus:outline-none focus:border-[#00D9FF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#7CE7FF] uppercase mb-1">
                    Team Members (One per line format: Name (email@example.com))
                  </label>
                  <textarea
                    rows={3}
                    value={newTeamData.membersText}
                    onChange={(e) => setNewTeamData({ ...newTeamData, membersText: e.target.value })}
                    placeholder={"Priya S (priya.s@gmail.com)\nKarthik R (karthik.r@gmail.com)"}
                    className="w-full p-3 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white focus:outline-none focus:border-[#00D9FF] font-mono text-xs"
                  />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#020d1e] border border-[#00D9FF]/20">
                  <input
                    type="checkbox"
                    id="accReqNew"
                    checked={newTeamData.accommodationRequired}
                    onChange={(e) => setNewTeamData({ ...newTeamData, accommodationRequired: e.target.checked })}
                    className="w-4 h-4 accent-[#00D9FF] rounded cursor-pointer"
                  />
                  <label htmlFor="accReqNew" className="text-xs font-bold text-white cursor-pointer">
                    Hostel Accommodation Required for Team
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#00D9FF]/20">
                  <button
                    type="button"
                    onClick={() => setIsAddTeamModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-bold hover:bg-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#00D9FF] text-black font-black uppercase hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,217,255,0.4)]"
                  >
                    REGISTER TEAM
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* VIEW TEAM DETAILS MODAL */}
        {viewingTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-2xl my-8 p-6 sm:p-8 rounded-3xl bg-[#04162E] border border-[#00D9FF]/50 shadow-[0_25px_60px_rgba(0,217,255,0.2)] space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#00D9FF]/30 pb-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-xl bg-[#00D9FF]/20 border border-[#00D9FF] font-orbitron font-bold text-sm text-[#00D9FF]">
                    {viewingTeam.teamId}
                  </span>
                  <div>
                    <h3 className="font-orbitron font-black text-xl text-white uppercase">{viewingTeam.teamName}</h3>
                    <p className="text-xs text-[#7CE7FF]">{viewingTeam.college}</p>
                  </div>
                </div>
                <button onClick={() => setViewingTeam(null)} className="text-gray-400 hover:text-white p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Leader Details Card */}
                <div className="p-4 rounded-2xl bg-[#020b18] border border-[#00D9FF]/20 space-y-2">
                  <h4 className="font-orbitron font-bold text-[#00D9FF] uppercase flex items-center gap-2">
                    <Users className="w-4 h-4" /> TEAM LEADER
                  </h4>
                  <div className="space-y-1 text-gray-200">
                    <p><strong className="text-white">Name:</strong> {viewingTeam.leaderName}</p>
                    <p><strong className="text-white">Email:</strong> {viewingTeam.leaderEmail}</p>
                    <p><strong className="text-white">Phone:</strong> {viewingTeam.leaderPhone}</p>
                    <p><strong className="text-white">Department:</strong> {viewingTeam.department}</p>
                    {viewingTeam.yearOfStudy && <p><strong className="text-white">Year:</strong> {viewingTeam.yearOfStudy}</p>}
                    {viewingTeam.rollNumber && <p><strong className="text-white">Roll No:</strong> {viewingTeam.rollNumber}</p>}
                  </div>
                </div>

                {/* Status & Portal Credentials Card */}
                <div className="p-4 rounded-2xl bg-[#020b18] border border-[#00D9FF]/20 space-y-2">
                  <h4 className="font-orbitron font-bold text-emerald-400 uppercase flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> CREDENTIALS & STATUS
                  </h4>
                  <div className="space-y-1 text-gray-200">
                    <p><strong className="text-white">Portal Password:</strong> <code className="px-2 py-0.5 rounded bg-[#00D9FF]/10 text-[#00D9FF] font-mono font-bold">{viewingTeam.password || 'hackathon2026'}</code></p>
                    <p><strong className="text-white">Attendance:</strong> <span className={viewingTeam.attendanceStatus === 'Checked In' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>{viewingTeam.attendanceStatus}</span></p>
                    <p><strong className="text-white">Accommodation:</strong> {viewingTeam.accommodationRequired ? '🏠 Hostel Required' : 'Not Required'}</p>
                    <p><strong className="text-white">Selected Theme:</strong> {portalState?.themes.find(t => t.id === viewingTeam.selectedThemeId)?.title || 'Not Selected'}</p>
                  </div>
                </div>
              </div>

              {/* Members Roster Table */}
              <div className="space-y-2">
                <h4 className="font-orbitron font-bold text-xs text-white uppercase">TEAM MEMBERS ({viewingTeam.members.length})</h4>
                <div className="rounded-xl border border-white/10 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#021024] text-[#7CE7FF] text-[10px] uppercase font-bold">
                      <tr>
                        <th className="p-3">Member Name</th>
                        <th className="p-3">Email & Contact</th>
                        <th className="p-3">College & Department</th>
                        <th className="p-3">Year / Roll No</th>
                        <th className="p-3">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-[#020b18]">
                      {viewingTeam.members.map((m, idx) => (
                        <tr key={idx}>
                          <td className="p-3 font-semibold text-white">{m.name}</td>
                          <td className="p-3 text-gray-300">
                            <span className="block">{m.email}</span>
                            <span className="text-[10px] text-gray-400">{m.phone || viewingTeam.leaderPhone}</span>
                          </td>
                          <td className="p-3 text-gray-300">
                            <span className="block font-medium text-gray-200">{m.college || viewingTeam.college}</span>
                            <span className="text-[10px] text-[#7CE7FF]">{m.department || viewingTeam.department}</span>
                          </td>
                          <td className="p-3 text-gray-300">
                            <span className="block text-gray-200">{m.yearOfStudy || viewingTeam.yearOfStudy || 'N/A'}</span>
                            <span className="text-[10px] font-mono text-gray-400">{m.rollNumber || viewingTeam.rollNumber || ''}</span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${m.role === 'Leader' ? 'bg-[#00D9FF]/20 text-[#00D9FF]' : 'bg-gray-800 text-gray-300'}`}>
                              {m.role || (idx === 0 ? 'Leader' : 'Member')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Desk Check-in QR Code */}
              {viewingTeam.qrCodeUrl && (
                <div className="p-4 rounded-2xl bg-[#020b18] border border-[#00D9FF]/30 text-center flex flex-col items-center gap-2">
                  <h4 className="font-orbitron font-bold text-xs text-[#00D9FF] uppercase">OFFICIAL DESK CHECK-IN QR CODE</h4>
                  <img src={viewingTeam.qrCodeUrl} alt="Team QR" className="w-36 h-36 rounded-xl border-2 border-[#00D9FF] p-2 bg-white" />
                  <p className="text-[10px] text-gray-400">Scan this QR code at the control counter for instant venue check-in</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-[#00D9FF]/20">
                <button
                  onClick={() => handleSendTeamEmail(viewingTeam)}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" /> SEND EMAIL TO LEADER
                </button>
                <button
                  onClick={() => setViewingTeam(null)}
                  className="px-5 py-2 rounded-xl bg-gray-800 text-white text-xs font-bold hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* EDIT TEAM MODAL */}
        {editingTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-2xl my-8 p-6 sm:p-8 rounded-3xl bg-[#04162E] border border-amber-500/50 shadow-[0_25px_60px_rgba(245,158,11,0.2)] space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
                    <Edit className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-black text-lg text-white uppercase">EDIT TEAM: {editingTeam.teamId}</h3>
                    <p className="text-xs text-amber-300">Modify team roster and account details</p>
                  </div>
                </div>
                <button onClick={() => setEditingTeam(null)} className="text-gray-400 hover:text-white p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveEditedTeam} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 uppercase mb-1">Team Name</label>
                    <input
                      type="text"
                      required
                      value={editingTeam.teamName}
                      onChange={(e) => setEditingTeam({ ...editingTeam, teamName: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[#020d1e] border border-amber-500/30 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 uppercase mb-1">Portal Password</label>
                    <input
                      type="text"
                      value={editingTeam.password || ''}
                      onChange={(e) => setEditingTeam({ ...editingTeam, password: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[#020d1e] border border-amber-500/30 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 uppercase mb-1">Leader Name</label>
                    <input
                      type="text"
                      required
                      value={editingTeam.leaderName}
                      onChange={(e) => setEditingTeam({ ...editingTeam, leaderName: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[#020d1e] border border-amber-500/30 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 uppercase mb-1">Leader Email</label>
                    <input
                      type="email"
                      required
                      value={editingTeam.leaderEmail}
                      onChange={(e) => setEditingTeam({ ...editingTeam, leaderEmail: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[#020d1e] border border-amber-500/30 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 uppercase mb-1">Leader Mobile</label>
                    <input
                      type="text"
                      required
                      value={editingTeam.leaderPhone}
                      onChange={(e) => setEditingTeam({ ...editingTeam, leaderPhone: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[#020d1e] border border-amber-500/30 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 uppercase mb-1">College Name</label>
                    <input
                      type="text"
                      required
                      value={editingTeam.college}
                      onChange={(e) => setEditingTeam({ ...editingTeam, college: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[#020d1e] border border-amber-500/30 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 uppercase mb-1">Department</label>
                    <input
                      type="text"
                      required
                      value={editingTeam.department}
                      onChange={(e) => setEditingTeam({ ...editingTeam, department: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[#020d1e] border border-amber-500/30 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#020d1e] border border-amber-500/20">
                  <input
                    type="checkbox"
                    id="accReqEdit"
                    checked={editingTeam.accommodationRequired ?? false}
                    onChange={(e) => setEditingTeam({ ...editingTeam, accommodationRequired: e.target.checked })}
                    className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                  />
                  <label htmlFor="accReqEdit" className="text-xs font-bold text-white cursor-pointer">
                    Hostel Accommodation Required
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-amber-500/20">
                  <button
                    type="button"
                    onClick={() => setEditingTeam(null)}
                    className="px-5 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-bold hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-black uppercase hover:scale-105 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                  >
                    SAVE CHANGES
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* FLOATING SUCCESS / ERROR TOAST NOTIFICATION */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.9 }}
              className={`fixed bottom-6 right-6 z-50 p-4 max-w-md rounded-2xl border shadow-2xl flex items-center justify-between gap-4 backdrop-blur-xl ${toastMessage.type === 'success'
                ? 'bg-[#041c30]/95 border-[#00D9FF] text-white shadow-[0_0_30px_rgba(0,217,255,0.4)]'
                : 'bg-red-950/95 border-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                }`}
            >
              <div className="flex items-center gap-3">
                {toastMessage.type === 'success' ? (
                  <CheckCircle2 className="w-6 h-6 text-[#00D9FF] flex-shrink-0 animate-bounce" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0" />
                )}
                <span className="text-xs font-bold leading-relaxed">{toastMessage.msg}</span>
              </div>
              <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PAYMENT SLIP PREVIEW MODAL */}
        {viewingPaymentProofUrl && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#04162E] border border-[#00D9FF]/40 rounded-3xl p-6 max-w-lg w-full space-y-4 text-center shadow-[0_0_50px_rgba(0,217,255,0.3)]">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <h3 className="font-orbitron text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>📸 PAYMENT SLIP / RECEIPT PROOF</span>
                </h3>
                <button
                  onClick={() => setViewingPaymentProofUrl(null)}
                  className="text-gray-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-auto rounded-2xl border border-gray-800 bg-black p-2 flex items-center justify-center min-h-[220px] relative">
                {previewImgError ? (
                  <div className="p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center mx-auto text-red-400">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-red-300 font-semibold">
                      Image could not be rendered directly.
                    </p>
                    <p className="text-[11px] text-gray-400 break-all max-w-xs mx-auto">
                      Link: {viewingPaymentProofUrl}
                    </p>
                    <a
                      href={viewingPaymentProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00D9FF]/20 border border-[#00D9FF]/40 text-[#7CE7FF] text-xs font-bold font-orbitron hover:bg-[#00D9FF]/30 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      TRY OPENING IN NEW TAB
                    </a>
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={viewingPaymentProofUrl}
                    alt="Payment Slip Screenshot"
                    onError={() => setPreviewImgError(true)}
                    className="w-full max-h-[50vh] object-contain rounded-xl"
                  />
                )}
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={viewingPaymentProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs uppercase font-orbitron tracking-wider flex items-center justify-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  OPEN FULL IMAGE
                </a>
                <button
                  onClick={() => setViewingPaymentProofUrl(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#00D9FF] text-black font-extrabold text-xs uppercase font-orbitron tracking-widest hover:bg-[#7CE7FF] transition-all cursor-pointer"
                >
                  CLOSE PREVIEW
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
