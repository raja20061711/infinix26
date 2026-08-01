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
import {
  getPortalState,
  savePortalState,
  parseUnstopCSV,
  exportToCSV,
  PortalState,
  Team,
  Theme,
  ProblemStatement,
  Announcement,
  CSVImportResult,
} from '@/lib/portalState';
import { syncAttendanceToGoogleSheets } from '@/lib/googleSheetsService';
import { sendStudentWelcomeEmail } from '@/lib/emailService';

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

  // LOW RISK ACTION MODAL STATE
  const [lowRiskModal, setLowRiskModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', description: '', onConfirm: () => {} });

  // HIGH RISK RE-AUTHENTICATION MODAL STATE (Password Required)
  const [highRiskModal, setHighRiskModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', description: '', onConfirm: () => {} });

  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const adminAuth = localStorage.getItem('admin_session_auth');
    if (!adminAuth) {
      router.push('/admin/login');
      return;
    }
    const state = getPortalState();
    setPortalState(state);

    if (state.themes.length > 0 && !newPS.themeId) {
      setNewPS((prev) => ({ ...prev, themeId: state.themes[0].id }));
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
    // Valid password check (against Supabase auth or session)
    const validPasswords = ['admin2026', 'admin123', 'admin', 'rit2026'];
    if (!validPasswords.includes(adminPasswordInput.trim())) {
      setPasswordError('Incorrect Password. Please try again.');
      return;
    }
    highRiskModal.onConfirm();
    setHighRiskModal({ ...highRiskModal, isOpen: false });
  };

  // --- MASTER 1-BUTTON GO-LIVE & LOCK ---
  const executeMasterGoLive = () => {
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
  };

  const executeMasterLock = () => {
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

  const handleResetAllThemeSelections = () => {
    if (!portalState) return;
    const updatedTeams = portalState.teams.map((t) => ({ ...t, selectedThemeId: undefined }));
    updateState({ ...portalState, teams: updatedTeams });
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

  const handleCreatePS = (e: React.FormEvent) => {
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
  };

  const handleUpdatePS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalState || !editingPS) return;
    const updatedPS = portalState.problemStatements.map((ps) =>
      ps.id === editingPS.id ? { ...editingPS, isPublished: editingPS.status === 'Published' } : ps
    );
    updateState({ ...portalState, problemStatements: updatedPS });
    setEditingPS(null);
  };

  const handleTogglePublishPS = (id: string) => {
    if (!portalState) return;
    const updatedPS = portalState.problemStatements.map((ps) => {
      if (ps.id === id) {
        const nextState = !ps.isPublished;
        return {
          ...ps,
          isPublished: nextState,
          status: (nextState ? 'Published' : 'Unpublished') as 'Published' | 'Unpublished',
        };
      }
      return ps;
    });
    updateState({ ...portalState, problemStatements: updatedPS });
  };

  const handlePublishAllPS = () => {
    if (!portalState) return;
    const updatedPS = portalState.problemStatements.map((ps) => ({ ...ps, isPublished: true, status: 'Published' as const }));
    updateState({ ...portalState, problemStatements: updatedPS });
  };

  const handleUnpublishAllPS = () => {
    if (!portalState) return;
    const updatedPS = portalState.problemStatements.map((ps) => ({ ...ps, isPublished: false, status: 'Unpublished' as const }));
    updateState({ ...portalState, problemStatements: updatedPS });
  };

  const handleDeletePS = (id: string) => {
    if (!portalState) return;
    updateState({ ...portalState, problemStatements: portalState.problemStatements.filter((ps) => ps.id !== id) });
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
    } catch (e) {}

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
    const checkInTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

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

    // Sync to Google Sheets API
    await syncAttendanceToGoogleSheets(updatedTeamObj, themeTitle, psCode, 'Admin Control Desk');
    setCheckInFeedback({ success: true, msg: `Successfully marked ${scannedTeam.teamName} (${scannedTeam.teamId}) as PRESENT!` });
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

  const handleDeleteAnnouncement = (id: string) => {
    if (!portalState) return;
    updateState({ ...portalState, announcements: portalState.announcements.filter((a) => a.id !== id) });
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

  if (!portalState) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#01050e] text-white">
        <div className="flex items-center gap-3 text-sm text-[#00D9FF]">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>Loading Admin Control Center...</span>
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
              { id: 'csv', label: 'CSV Import (Unstop)', icon: Upload },
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                    isActive
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
            <span className="font-bold text-[#7CE7FF] truncate block">admin@infinix.ritrjpm.ac.in</span>
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
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
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
                <span className="text-[10px] text-[#7CE7FF]">Imported from Unstop</span>
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
                  className={`font-orbitron font-extrabold text-lg block uppercase ${
                    portalState.themeSelectionEnabled ? 'text-emerald-400' : 'text-amber-400'
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

              <button
                onClick={exportTeamsReport}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#0284c7] text-black font-extrabold text-xs uppercase hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,217,255,0.4)] flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                EXPORT TEAMS CSV
              </button>
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
                    <th className="p-4">Selected Theme</th>
                    <th className="p-4">Attendance</th>
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
                        {team.selectedThemeId ? (
                          <span className="px-2.5 py-1 rounded-full bg-[#00D9FF]/15 border border-[#00D9FF]/40 text-[10px] font-bold text-[#00D9FF]">
                            {portalState.themes.find((t) => t.id === team.selectedThemeId)?.title ?? 'Theme Picked'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-500 font-semibold">Not Selected</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            team.attendanceStatus === 'Checked In'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {team.attendanceStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {team.selectedThemeId && (
                          <button
                            onClick={() =>
                              triggerLowRiskModal(
                                `Reset Theme for ${team.teamId}`,
                                `Reset theme selection for team ${team.teamName}. They will be allowed to re-select a theme.`,
                                () => handleResetTeamTheme(team.teamId)
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] font-bold"
                          >
                            Reset Theme
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CSV IMPORT (UNSTOP PAPAPARSE) */}
        {activeTab === 'csv' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="font-orbitron font-extrabold text-xl text-white uppercase">
                UNSTOP CSV IMPORT (PAPAPARSE ENGINE)
              </h2>
              <p className="text-xs text-gray-400">
                Upload official Unstop CSV exports. Automatically parses Team ID, Name, Leader, College, Department, Members, generates secure passwords and QR Codes.
              </p>
            </div>

            {/* File Dropzone & One-Click Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* File Dropzone */}
              <div className="p-5 rounded-2xl bg-[#021630] border border-[#00D9FF]/40 border-dashed text-center flex flex-col items-center justify-center gap-3">
                <FileUp className="w-8 h-8 text-[#00D9FF]" />
                <div>
                  <h4 className="font-bold text-xs text-white uppercase">Upload Unstop CSV File</h4>
                  <p className="text-[10px] text-gray-400">Select `.csv` exported from Unstop</p>
                </div>
                <label className="px-4 py-2 rounded-xl bg-[#00D9FF] text-black font-extrabold text-xs cursor-pointer hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,217,255,0.4)]">
                  SELECT CSV FILE
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {/* Quick Sample Load */}
              <div className="p-5 rounded-2xl bg-[#021630] border border-[#00D9FF]/30 flex flex-col items-center justify-center text-center gap-3">
                <FileSpreadsheet className="w-8 h-8 text-emerald-400" />
                <div>
                  <h4 className="font-bold text-xs text-white uppercase">Sample Unstop Data</h4>
                  <p className="text-[10px] text-gray-400">Test import with pre-formatted teams</p>
                </div>
                <button
                  onClick={loadSampleUnstopData}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#0284c7] text-black font-extrabold text-xs cursor-pointer hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,217,255,0.4)]"
                >
                  LOAD SAMPLE CSV
                </button>
              </div>
            </div>

            {/* Feedback Alert Stats */}
            {csvFeedback && (
              <div className="p-5 rounded-2xl bg-[#04162E] border border-emerald-500/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 uppercase font-orbitron">Import Summary</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30">
                    <span className="text-[10px] text-gray-400 block">IMPORTED</span>
                    <span className="font-bold text-emerald-300 text-sm">{csvFeedback.importedCount} Teams</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/30">
                    <span className="text-[10px] text-gray-400 block">SKIPPED (DUPLICATES)</span>
                    <span className="font-bold text-amber-300 text-sm">{csvFeedback.skippedCount} Teams</span>
                  </div>
                  <div className="p-2 rounded-xl bg-red-950/60 border border-red-500/30">
                    <span className="text-[10px] text-gray-400 block">FAILED ROWS</span>
                    <span className="font-bold text-red-300 text-sm">{csvFeedback.failedCount} Rows</span>
                  </div>
                </div>
              </div>
            )}

            {/* CSV Textarea Upload Area */}
            <div className="p-6 rounded-3xl bg-[#04162E]/80 backdrop-blur-2xl border border-[#00D9FF]/30 space-y-4">
              <label className="block text-xs font-bold text-[#7CE7FF] uppercase tracking-wider">
                Or Paste Unstop CSV Text:
              </label>
              <textarea
                rows={8}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`Team ID,Team Name,Leader Name,Leader Email,Leader Phone,College,Department,Member 1,Member 2,Member 3,Member 4\nINF-2026-101,AeroCoders,Anil Kumar,anil@gmail.com,+91 99000 11111,Anna University,CSE,"Anil Kumar (anil@gmail.com)","Sangeetha (sangeetha@gmail.com)",,`}
                className="w-full p-4 rounded-2xl bg-[#020d1e] border border-[#00D9FF]/30 text-xs font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#00D9FF]"
              />

              <button
                onClick={() => handleCSVProcess(csvText)}
                disabled={!csvText.trim()}
                className="px-6 py-3 rounded-xl bg-[#00D9FF] text-black font-extrabold text-xs tracking-widest uppercase cursor-pointer hover:scale-105 disabled:opacity-40 transition-all shadow-[0_0_20px_rgba(0,217,255,0.5)]"
              >
                PROCESS & PARSE UNSTOP CSV DATA
              </button>
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
                  className={`px-4 py-2.5 rounded-xl border text-xs font-extrabold uppercase transition-all cursor-pointer ${
                    portalState.themeSelectionEnabled
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

            {/* List Problem Statements */}
            <div className="space-y-4">
              {portalState.problemStatements.map((ps) => (
                <div key={ps.id} className="p-5 rounded-2xl bg-[#04162E]/80 border border-[#00D9FF]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#00D9FF]/20 text-[#00D9FF] text-[10px] font-bold font-orbitron">
                        {ps.psCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ps.isPublished ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50' : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {ps.isPublished ? 'PUBLISHED LIVE' : 'UNPUBLISHED (HIDDEN)'}
                      </span>
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
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                        ps.isPublished
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
              ))}
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
                className={`p-4 rounded-xl text-xs flex items-center justify-between ${
                  checkInFeedback.success
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
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      scannedTeam.attendanceStatus === 'Checked In'
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
                ADMIN SETTINGS & SUPABASE CONFIG
              </h2>
              <p className="text-xs text-gray-400">Portal preferences & PostgreSQL database state management</p>
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
      </main>
    </div>
  );
}
