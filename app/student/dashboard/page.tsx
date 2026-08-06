'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  Layers,
  FileText,
  Bell,
  LogOut,
  Lock,
  CheckCircle2,
  Download,
  Building2,
  Sparkles,
  ShieldCheck,
  QrCode,
  GraduationCap,
  Clock,
  BookOpen,
  Check,
} from 'lucide-react';
import OceanPortalBackground from '@/components/portal/OceanPortalBackground';
import { getPortalState, savePortalState, PortalState, Team, generateTeamQRCode } from '@/lib/portalState';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [portalState, setPortalState] = useState<PortalState | null>(null);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [themeSubmitted, setThemeSubmitted] = useState<boolean>(false);
  const [allocations, setAllocations] = useState<Record<string, { teamId: string; teamName: string }>>({});
  const [selectPsModal, setSelectPsModal] = useState<{ isOpen: boolean; ps: any | null }>({ isOpen: false, ps: null });
  const [isSubmittingPs, setIsSubmittingPs] = useState<boolean>(false);
  const [psErrorMsg, setPsErrorMsg] = useState<string>('');
  const [psSuccessMsg, setPsSuccessMsg] = useState<string>('');
  const [psList, setPsList] = useState<any[]>([]);

  const fetchAllocations = () => {
    fetch(`/api/problem-statements/allocations?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.allocations) {
          setAllocations(data.allocations);
        }
      })
      .catch(() => {});
  };

  const fetchPsAndThemes = () => {
    fetch(`/api/problem-statements/list?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.problemStatements) {
          setPsList(data.problemStatements);
        }
      })
      .catch(() => {});
  };

  const syncLiveTeamData = (teamId: string) => {
    fetch('/api/student/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
      body: JSON.stringify({ teamId }),
      cache: 'no-store',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.team) {
          const liveTeam = data.team;
          setCurrentTeam(liveTeam);

          const isRealSelection = Boolean(
            liveTeam.selectedThemeId &&
            liveTeam.selectedThemeId !== 'Not Selected' &&
            liveTeam.selectedThemeId !== 'NONE'
          );

          if (isRealSelection) {
            setSelectedThemeId(liveTeam.selectedThemeId);
            setThemeSubmitted(true);
          } else {
            setSelectedThemeId('');
            setThemeSubmitted(false);
          }

          if (liveTeam.qrCodeUrl) {
            setQrCodeUrl(liveTeam.qrCodeUrl);
          } else {
            generateTeamQRCode(liveTeam.teamId).then(setQrCodeUrl);
          }

          // Sync with local portalState
          const state = getPortalState();
          const cleanId = teamId.toUpperCase().replace(/\s+/g, '');
          const idx = state.teams.findIndex(
            (t) => (t.teamId || '').toUpperCase().replace(/\s+/g, '') === cleanId
          );
          if (idx >= 0) {
            state.teams[idx] = liveTeam;
          } else {
            state.teams.unshift(liveTeam);
          }
          savePortalState(state);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    const sessionTeamId = localStorage.getItem('student_session_team_id');
    if (!sessionTeamId) {
      router.push('/student/login');
      return;
    }

    const state = getPortalState();
    setPortalState(state);

    const cleanSessionId = sessionTeamId.toUpperCase().replace(/\s+/g, '');
    const foundTeam = state.teams.find((t) => {
      const id = (t.teamId || '').toUpperCase().replace(/\s+/g, '');
      return id === cleanSessionId || id.replace('-', '') === cleanSessionId.replace('-', '');
    });

    if (foundTeam) {
      setCurrentTeam(foundTeam);
      const isRealSelection = Boolean(
        foundTeam.selectedThemeId &&
        foundTeam.selectedThemeId !== 'Not Selected' &&
        foundTeam.selectedThemeId !== 'NONE'
      );
      if (isRealSelection) {
        setSelectedThemeId(foundTeam.selectedThemeId!);
        setThemeSubmitted(true);
      } else {
        setSelectedThemeId('');
        setThemeSubmitted(false);
      }
      if (foundTeam.qrCodeUrl) {
        setQrCodeUrl(foundTeam.qrCodeUrl);
      } else {
        generateTeamQRCode(foundTeam.teamId).then(setQrCodeUrl);
      }
    }

    // Always fetch live profile & live PS list from server API
    syncLiveTeamData(sessionTeamId);
    fetchAllocations();
    fetchPsAndThemes();

    // 5-second polling interval for instant live updates across refreshes and devices
    const interval = setInterval(() => {
      syncLiveTeamData(sessionTeamId);
      fetchAllocations();
      fetchPsAndThemes();
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  const handleConfirmSelectPS = async () => {
    if (!currentTeam || !selectPsModal.ps) return;
    setIsSubmittingPs(true);
    setPsErrorMsg('');
    setPsSuccessMsg('');

    try {
      const res = await fetch('/api/student/select-ps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: currentTeam.teamId,
          psId: selectPsModal.ps.id,
          psCode: selectPsModal.ps.psCode,
          psTitle: selectPsModal.ps.title,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPsSuccessMsg(data.message);
        setSelectedThemeId(selectPsModal.ps.id);
        setThemeSubmitted(true);

        const updatedTeam = { ...currentTeam, selectedThemeId: selectPsModal.ps.id };
        setCurrentTeam(updatedTeam);

        if (portalState) {
          const state = { ...portalState };
          const idx = state.teams.findIndex((t) => t.teamId === currentTeam.teamId);
          if (idx >= 0) state.teams[idx] = updatedTeam;
          savePortalState(state);
        }

        setSelectPsModal({ isOpen: false, ps: null });
        fetchAllocations();
      } else {
        setPsErrorMsg(data?.error || 'Failed to select Problem Statement');
        fetchAllocations();
      }
    } catch (err: any) {
      setPsErrorMsg(err.message || 'Network error while selecting Problem Statement');
    } finally {
      setIsSubmittingPs(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('student_session_team_id');
    router.push('/student/login');
  };

  const handleConfirmSelectTheme = (themeId: string) => {
    const isEnabled = portalState?.themeSelectionEnabled ?? true;
    if (!portalState || !currentTeam || !isEnabled || themeSubmitted) return;

    const updatedTeams = portalState.teams.map((t) => {
      if (t.teamId === currentTeam.teamId) {
        return { ...t, selectedThemeId: themeId };
      }
      return t;
    });

    const newState: PortalState = { ...portalState, teams: updatedTeams };
    setPortalState(newState);
    setCurrentTeam({ ...currentTeam, selectedThemeId: themeId });
    setSelectedThemeId(themeId);
    setThemeSubmitted(true);
    savePortalState(newState);
  };

  if (!portalState || !currentTeam) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#01050e] text-white">
        <div className="flex items-center gap-3 text-sm text-[#00D9FF]">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>Loading Student Dashboard...</span>
        </div>
      </main>
    );
  }

  const selectedThemeObj = portalState.themes.find((th) => th.id === selectedThemeId);

  // Published problem statements visible to students (falls back to live server API psList)
  const publishedPSList =
    psList.length > 0
      ? psList
      : portalState.problemStatements.filter((ps) => ps.isPublished || ps.status === 'Published');

  return (
    <main className="relative min-h-screen pb-20 text-slate-100">
      {/* 2D Cinematic Ocean Background */}
      <OceanPortalBackground />

      {/* Top Navigation Bar */}
      <header className="relative z-20 w-full px-6 py-4 bg-[#04162E]/80 backdrop-blur-2xl border-b border-[#00D9FF]/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/infinix-event-logo-clean.png" alt="INFINIX Logo" className="w-8 h-8 object-contain" />
          <div>
            <span className="font-orbitron font-extrabold text-sm text-white tracking-wider block">
              INFINIX&apos;26
            </span>
            <span className="text-[10px] text-[#7CE7FF] font-medium tracking-wide">
              Student Participant Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#02142a] border border-[#00D9FF]/30 text-xs text-[#7CE7FF]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00D9FF]" />
            <span className="font-semibold">{currentTeam.teamId}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs font-bold text-red-300 hover:bg-red-900/60 hover:text-white transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>LOGOUT</span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-3xl bg-[#04162E]/80 backdrop-blur-2xl border border-[#00D9FF]/40 shadow-[0_15px_45px_rgba(1,4,13,0.85)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div>
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#00D9FF] uppercase block mb-1">
              WELCOME TEAM
            </span>
            <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white tracking-wider uppercase">
              {currentTeam.teamName}
            </h1>
            <p className="text-xs text-gray-300 mt-1 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#7CE7FF]" />
                {currentTeam.college}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-[#7CE7FF]" />
                {currentTeam.department || 'Computer Science'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                currentTeam.attendanceStatus === 'Checked In'
                  ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                  : 'bg-amber-950/80 border border-amber-500/50 text-amber-300'
              }`}
            >
              {currentTeam.attendanceStatus === 'Checked In' ? '✓ CHECKED IN AT VENUE' : '⏳ NOT CHECKED IN YET'}
            </span>

            <span className="px-3.5 py-1.5 rounded-full bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-xs font-bold text-[#7CE7FF]">
              ID: {currentTeam.teamId}
            </span>
          </div>
        </motion.div>

        {/* Dashboard Grid Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CARD 1: TEAM INFORMATION */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 sm:p-8 rounded-3xl bg-[#04162E]/80 backdrop-blur-2xl border border-[#00D9FF]/30 shadow-[0_15px_45px_rgba(1,4,13,0.85)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#00D9FF]/20">
                <div className="p-2.5 rounded-xl bg-[#021630] border border-[#00D9FF]/40 text-[#00D9FF]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-orbitron font-extrabold text-lg text-white tracking-wide uppercase">
                    TEAM INFORMATION
                  </h2>
                  <p className="text-xs text-gray-400">Registered Roster & Credentials</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#021024] border border-white/5">
                  <span className="text-gray-400">Team Leader:</span>
                  <span className="font-bold text-white">{currentTeam.leaderName}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#021024] border border-white/5">
                  <span className="text-gray-400">Leader Email:</span>
                  <span className="font-semibold text-[#7CE7FF]">{currentTeam.leaderEmail}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#021024] border border-white/5">
                  <span className="text-gray-400">Leader Phone:</span>
                  <span className="font-semibold text-gray-200">{currentTeam.leaderPhone}</span>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-bold text-[#00D9FF] tracking-wider uppercase block mb-2">
                    Team Members ({currentTeam.members.length}):
                  </span>
                  <div className="space-y-2">
                    {currentTeam.members.map((mem, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#021024]/70 border border-[#00D9FF]/15"
                      >
                        <div>
                          <span className="font-bold text-white block">{mem.name}</span>
                          <span className="text-[10px] text-gray-400">{mem.email}</span>
                        </div>
                        <span
                          className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                            mem.role === 'Leader'
                              ? 'bg-[#00D9FF]/20 text-[#00D9FF] border border-[#00D9FF]/40'
                              : 'bg-gray-800 text-gray-300'
                          }`}
                        >
                          {mem.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CARD 2: OFFICIAL QR CODE CHECK-IN CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-6 sm:p-8 rounded-3xl bg-[#04162E]/80 backdrop-blur-2xl border border-[#00D9FF]/30 shadow-[0_15px_45px_rgba(1,4,13,0.85)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#00D9FF]/20">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#021630] border border-[#00D9FF]/40 text-[#00D9FF]">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-orbitron font-extrabold text-lg text-white tracking-wide uppercase">
                      ENTRY QR CODE
                    </h2>
                    <p className="text-xs text-gray-400">Present at Venue Check-In Desk</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center text-center space-y-4 py-2">
                <div className="p-3 rounded-2xl bg-white/90 border-2 border-[#00D9FF] shadow-[0_0_25px_rgba(0,217,255,0.4)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${currentTeam.teamId}`}
                    alt="Team Entry QR Code"
                    className="w-44 h-44 object-contain rounded-lg"
                  />
                </div>

                <div>
                  <span className="font-orbitron font-extrabold text-base text-white block">
                    {currentTeam.teamId}
                  </span>
                  <span className="text-xs text-[#7CE7FF]">{currentTeam.teamName}</span>
                </div>

                <p className="text-xs text-gray-300 max-w-xs leading-relaxed">
                  Show this QR Code to event organizers at the registration desk for instant venue check-in.
                </p>
              </div>
            </div>
          </motion.div>

          {/* CARD 3: THEME SELECTION */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 sm:p-8 rounded-3xl bg-[#04162E]/80 backdrop-blur-2xl border border-[#00D9FF]/30 shadow-[0_15px_45px_rgba(1,4,13,0.85)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#00D9FF]/20">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#021630] border border-[#00D9FF]/40 text-[#00D9FF]">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-orbitron font-extrabold text-lg text-white tracking-wide uppercase">
                      THEME SELECTION
                    </h2>
                    <p className="text-xs text-gray-400">Choose your Hackathon Track</p>
                  </div>
                </div>

                {!(portalState.themeSelectionEnabled ?? true) ? (
                  <span className="px-3 py-1 rounded-full bg-amber-950/50 border border-amber-500/50 text-[10px] font-bold text-amber-300 flex items-center gap-1.5">
                    <Lock className="w-3 h-3" />
                    LOCKED BY ADMIN
                  </span>
                ) : themeSubmitted ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/50 text-[10px] font-bold text-emerald-300 flex items-center gap-1.5">
                    <Check className="w-3 h-3" />
                    SELECTION SUBMITTED
                  </span>
                ) : null}
              </div>

              {/* Locked State Message if Admin disabled theme selection */}
              {!(portalState.themeSelectionEnabled ?? true) ? (
                <div className="p-6 rounded-2xl bg-[#020d1e]/80 border border-amber-500/30 text-center space-y-3 my-4">
                  <div className="w-12 h-12 rounded-full bg-amber-950/40 border border-amber-500/50 flex items-center justify-center mx-auto text-amber-400">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-amber-200 uppercase">
                    Theme Selection Currently Locked
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Theme Selection will be published by the Admin during the opening ceremony. Keep an eye on announcements!
                  </p>
                </div>
              ) : (
                /* Unlocked Theme Selection */
                <div className="space-y-3">
                  <p className="text-xs text-gray-300">
                    {themeSubmitted
                      ? 'Your team theme choice is submitted and locked. Only an Admin can reset your theme selection.'
                      : 'Select ONLY ONE hackathon theme for your team. Once submitted, editing will be disabled.'}
                  </p>

                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                    {portalState.themes.map((thm) => {
                      const isSelected = selectedThemeId === thm.id;
                      return (
                        <div
                          key={thm.id}
                          onClick={() => {
                            if (!themeSubmitted) handleConfirmSelectTheme(thm.id);
                          }}
                          className={`p-4 rounded-2xl border transition-all ${
                            themeSubmitted ? 'cursor-default' : 'cursor-pointer'
                          } ${
                            isSelected
                              ? 'bg-[#021c3d] border-[#00D9FF] shadow-[0_0_20px_rgba(0,217,255,0.35)]'
                              : 'bg-[#021024]/80 border-white/10 hover:border-[#00D9FF]/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <span className="font-bold text-sm text-white">{thm.title}</span>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-[#00D9FF] flex-shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-[#7CE7FF] uppercase tracking-wider block mb-2">
                            {thm.domain}
                          </span>
                          <p className="text-xs text-gray-400 leading-relaxed">{thm.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {selectedThemeObj && (
              <div className="mt-4 pt-3 border-t border-[#00D9FF]/20 flex items-center justify-between text-xs">
                <span className="text-gray-400">Current Selected Theme:</span>
                <span className="font-bold text-[#00D9FF]">{selectedThemeObj.title}</span>
              </div>
            )}
          </motion.div>

          {/* CARD 4: PROBLEM STATEMENT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 sm:p-8 rounded-3xl bg-[#04162E]/80 backdrop-blur-2xl border border-[#00D9FF]/30 shadow-[0_15px_45px_rgba(1,4,13,0.85)] flex flex-col justify-between"
          >
            {/* PROBLEM STATEMENTS SELECTION CARD */}
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#00D9FF]/20">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#021630] border border-[#00D9FF]/40 text-[#00D9FF]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-orbitron font-extrabold text-lg text-white tracking-wide uppercase flex items-center gap-2">
                      <span>PROBLEM STATEMENTS</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#00D9FF]/20 text-[#00D9FF] text-[10px] font-bold">
                        FCFS UNIQUE ALLOCATION
                      </span>
                    </h2>
                    <p className="text-xs text-gray-400">
                      Select 1 Problem Statement for your team. Once selected, no other team can pick it!
                    </p>
                  </div>
                </div>

                <button
                  onClick={fetchAllocations}
                  className="p-2 rounded-xl bg-[#021630] border border-[#00D9FF]/30 text-[#7CE7FF] hover:text-white text-xs flex items-center gap-1.5 font-orbitron cursor-pointer"
                  title="Refresh Live Allocations"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>REFRESH</span>
                </button>
              </div>

              {/* Published Problem Statements List */}
              {publishedPSList.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#020d1e]/80 border border-purple-500/30 text-center space-y-3 my-4">
                  <div className="w-12 h-12 rounded-full bg-purple-950/40 border border-purple-500/50 flex items-center justify-center mx-auto text-purple-400">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-purple-200 uppercase">
                    Problem Statements Currently Hidden
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Problem statements will be published by the Admin during the opening ceremony.
                  </p>
                </div>
              ) : (
                <div className="space-y-5 max-h-[600px] overflow-y-auto pr-1">
                  {publishedPSList.map((ps) => {
                    const isSelectedByMyTeam =
                      Boolean(currentTeam?.selectedThemeId) &&
                      currentTeam?.selectedThemeId !== 'Not Selected' &&
                      currentTeam?.selectedThemeId !== 'NONE' &&
                      (currentTeam?.selectedThemeId === ps.id || currentTeam?.selectedThemeId === ps.psCode);

                    const allocation = allocations[ps.id] || allocations[ps.psCode];
                    const isChosenByOtherTeam = Boolean(
                      allocation && allocation.teamId !== currentTeam?.teamId
                    );
                    const chosenByTeamName = allocation?.teamName;
                    const hasAlreadyChosenRealPS = Boolean(
                      currentTeam?.selectedThemeId &&
                      currentTeam.selectedThemeId !== 'Not Selected' &&
                      currentTeam.selectedThemeId !== 'NONE'
                    );

                    return (
                      <div
                        key={ps.id}
                        className={`p-5 rounded-2xl border transition-all space-y-3 ${
                          isSelectedByMyTeam
                            ? 'bg-[#021d38] border-emerald-500/70 shadow-[0_0_30px_rgba(16,185,129,0.25)]'
                            : isChosenByOtherTeam
                            ? 'bg-[#0b121e]/60 border-red-900/40 opacity-75'
                            : 'bg-[#02142b] border-[#00D9FF]/30 hover:border-[#00D9FF]/60'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-lg bg-[#00D9FF]/20 text-[#00D9FF] text-xs font-black font-orbitron">
                              {ps.psCode}
                            </span>
                            {portalState?.themes.find((t) => t.id === ps.themeId) && (
                              <span className="px-2.5 py-0.5 rounded-full bg-[#021630] border border-[#00D9FF]/30 text-[#7CE7FF] text-[10px] font-semibold">
                                {portalState.themes.find((t) => t.id === ps.themeId)?.title}
                              </span>
                            )}
                          </div>

                          {/* Allocation Status Badge */}
                          {isSelectedByMyTeam ? (
                            <span className="px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500 text-emerald-400 text-xs font-bold font-orbitron flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              YOUR TEAM CHOSE THIS PS (LOCKED)
                            </span>
                          ) : isChosenByOtherTeam ? (
                            <span className="px-3 py-1 rounded-full bg-red-950/90 border border-red-500/60 text-red-300 text-[11px] font-bold font-orbitron flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-red-400" />
                              ALREADY CHOSEN BY TEAM &quot;{chosenByTeamName || 'Another Team'}&quot;
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold font-orbitron flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-emerald-400" />
                              🟢 AVAILABLE FOR SELECTION
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-base text-white">{ps.title}</h3>
                        <p className="text-xs text-gray-300 leading-relaxed">{ps.description}</p>

                        {/* Rules & Constraints */}
                        {ps.rules && ps.rules.length > 0 && (
                          <div className="p-3 rounded-xl bg-[#020b18] border border-white/5 space-y-1 text-xs">
                            <span className="text-[10px] font-bold text-[#00D9FF] uppercase tracking-wider block">
                              Rules & Constraints:
                            </span>
                            <ul className="list-disc list-inside text-gray-300 text-[11px] space-y-1">
                              {ps.rules.map((rule: string, rIdx: number) => (
                                <li key={rIdx}>{rule}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Action Buttons Stack */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                          {ps.pdfUrl ? (
                            <a
                              href={ps.pdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-[#00D9FF] hover:underline font-semibold"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download Problem Statement PDF
                            </a>
                          ) : (
                            <div />
                          )}

                          {isSelectedByMyTeam ? (
                            <button
                              disabled
                              className="px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-bold font-orbitron flex items-center gap-1.5 cursor-not-allowed opacity-90"
                            >
                              <Check className="w-4 h-4 text-emerald-400" />
                              SELECTION CONFIRMED & LOCKED
                            </button>
                          ) : isChosenByOtherTeam ? (
                            <button
                              disabled
                              className="px-4 py-2 rounded-xl bg-red-950/40 border border-red-900/60 text-red-400 text-xs font-bold font-orbitron flex items-center gap-1.5 cursor-not-allowed opacity-75"
                            >
                              <Lock className="w-3.5 h-3.5 text-red-400" />
                              ALREADY CHOSEN BY ANOTHER TEAM
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectPsModal({ isOpen: true, ps })}
                              disabled={hasAlreadyChosenRealPS}
                              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#0284c7] text-black font-orbitron font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(0,217,255,0.4)] hover:shadow-[0_0_30px_rgba(0,217,255,0.7)] hover:scale-105 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {hasAlreadyChosenRealPS
                                ? 'YOUR TEAM HAS ALREADY CHOSEN A PS'
                                : 'CHOOSE THIS PROBLEM STATEMENT'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* CARD 5: ANNOUNCEMENTS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 sm:p-8 rounded-3xl bg-[#04162E]/80 backdrop-blur-2xl border border-[#00D9FF]/30 shadow-[0_15px_45px_rgba(1,4,13,0.85)] flex flex-col justify-between lg:col-span-2"
          >
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#00D9FF]/20">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#021630] border border-[#00D9FF]/40 text-[#00D9FF]">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-orbitron font-extrabold text-lg text-white tracking-wide uppercase">
                      ANNOUNCEMENTS
                    </h2>
                    <p className="text-xs text-gray-400">Live Broadcast Feed from Organizing Team</p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-[#00D9FF]/10 text-[10px] font-bold text-[#00D9FF]">
                  {portalState?.announcements.length || 0} ALERTS
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
                {portalState?.announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-2xl bg-[#021024]/90 border border-[#00D9FF]/20 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                          ann.category === 'Urgent'
                            ? 'bg-red-950/80 text-red-300 border border-red-500/50'
                            : 'bg-[#00D9FF]/20 text-[#00D9FF]'
                        }`}
                      >
                        {ann.category}
                      </span>
                      <span className="text-[10px] text-gray-400">{ann.timestamp}</span>
                    </div>

                    <h4 className="font-bold text-sm text-white">{ann.title}</h4>
                    <p className="text-xs text-gray-300 leading-relaxed">{ann.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* SELECTION CONFIRMATION MODAL */}
      {selectPsModal.isOpen && selectPsModal.ps && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#04162E] border border-[#00D9FF]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 text-center shadow-[0_0_50px_rgba(0,217,255,0.3)]">
            <div className="w-16 h-16 rounded-2xl bg-[#00D9FF]/20 border border-[#00D9FF] flex items-center justify-center mx-auto text-[#00D9FF] shadow-[0_0_20px_rgba(0,217,255,0.4)]">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-[#00D9FF]/10 text-[#00D9FF] text-xs font-bold font-orbitron uppercase">
                CONFIRM PROBLEM STATEMENT SELECTION
              </span>
              <h3 className="font-orbitron font-black text-xl text-white uppercase mt-2">
                {selectPsModal.ps.psCode}: {selectPsModal.ps.title}
              </h3>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                Are you sure you want to select this Problem Statement for <strong className="text-[#00D9FF]">{currentTeam?.teamName}</strong>?
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs text-left space-y-1">
              <span className="font-bold block">⚠️ Important Selection Rule:</span>
              <p className="text-gray-300">
                1. Once confirmed, this Problem Statement will be <strong>permanently locked for your team</strong>.<br />
                2. No other team will be able to select this Problem Statement.<br />
                3. You cannot change your selection afterwards without organizer approval.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setSelectPsModal({ isOpen: false, ps: null })}
                disabled={isSubmittingPs}
                className="flex-1 py-3.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-extrabold text-xs font-orbitron uppercase tracking-wider transition-all cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmSelectPS}
                disabled={isSubmittingPs}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#0284c7] text-black font-orbitron font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_25px_rgba(0,217,255,0.5)] cursor-pointer disabled:opacity-50"
              >
                {isSubmittingPs ? 'CONFIRMING & LOCKING...' : 'CONFIRM & LOCK CHOICE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
