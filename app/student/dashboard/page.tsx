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

  useEffect(() => {
    const sessionTeamId = localStorage.getItem('student_session_team_id');
    if (!sessionTeamId) {
      router.push('/student/login');
      return;
    }

    const state = getPortalState();
    setPortalState(state);

    const foundTeam = state.teams.find((t) => t.teamId.toUpperCase() === sessionTeamId.toUpperCase());
    if (foundTeam) {
      setCurrentTeam(foundTeam);
      if (foundTeam.selectedThemeId) {
        setSelectedThemeId(foundTeam.selectedThemeId);
        setThemeSubmitted(true);
      }
      if (foundTeam.qrCodeUrl) {
        setQrCodeUrl(foundTeam.qrCodeUrl);
      } else {
        generateTeamQRCode(foundTeam.teamId).then(setQrCodeUrl);
      }
    } else {
      const fallbackTeam = state.teams[0];
      setCurrentTeam(fallbackTeam);
      if (fallbackTeam.selectedThemeId) {
        setSelectedThemeId(fallbackTeam.selectedThemeId);
        setThemeSubmitted(true);
      }
      generateTeamQRCode(fallbackTeam.teamId).then(setQrCodeUrl);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('student_session_team_id');
    router.push('/student/login');
  };

  const handleConfirmSelectTheme = (themeId: string) => {
    if (!portalState || !currentTeam || !portalState.themeSelectionEnabled || themeSubmitted) return;

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

  // Published problem statements visible to students
  const publishedPSList = portalState.problemStatements.filter((ps) => ps.isPublished || ps.status === 'Published');

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

                {!portalState.themeSelectionEnabled ? (
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
              {!portalState.themeSelectionEnabled ? (
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
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#00D9FF]/20">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#021630] border border-[#00D9FF]/40 text-[#00D9FF]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-orbitron font-extrabold text-lg text-white tracking-wide uppercase">
                      PROBLEM STATEMENT
                    </h2>
                    <p className="text-xs text-gray-400">Official Challenge Document</p>
                  </div>
                </div>

                {publishedPSList.length === 0 && (
                  <span className="px-3 py-1 rounded-full bg-purple-950/50 border border-purple-500/50 text-[10px] font-bold text-purple-300 flex items-center gap-1.5">
                    <Lock className="w-3 h-3" />
                    HIDDEN BY ADMIN
                  </span>
                )}
              </div>

              {/* Locked / Hidden State if Problem Statements are not published */}
              {publishedPSList.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#020d1e]/80 border border-purple-500/30 text-center space-y-3 my-4">
                  <div className="w-12 h-12 rounded-full bg-purple-950/40 border border-purple-500/50 flex items-center justify-center mx-auto text-purple-400">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-purple-200 uppercase">
                    Problem Statements Currently Hidden
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Problem statements will be published by the Admin at the official start of Hacking Hours.
                  </p>
                </div>
              ) : (
                /* Published Problem Statements */
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  {publishedPSList.map((ps) => (
                    <div
                      key={ps.id}
                      className="p-4 rounded-2xl bg-[#02142b] border border-[#00D9FF]/30 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-[#00D9FF]/20 text-[#00D9FF] text-[10px] font-extrabold font-orbitron">
                            {ps.psCode}
                          </span>
                          {portalState.themes.find((t) => t.id === ps.themeId) && (
                            <span className="px-2 py-0.5 rounded-full bg-[#021630] border border-[#00D9FF]/30 text-[#7CE7FF] text-[9px] font-semibold">
                              {portalState.themes.find((t) => t.id === ps.themeId)?.title}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          PUBLISHED
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-white">{ps.title}</h3>
                      <p className="text-xs text-gray-300 leading-relaxed">{ps.description}</p>

                      {/* Rules & Resources */}
                      {ps.rules && ps.rules.length > 0 && (
                        <div className="p-3 rounded-xl bg-[#020b18] border border-white/5 space-y-1 text-xs">
                          <span className="text-[10px] font-bold text-[#00D9FF] uppercase tracking-wider block">Rules & Constraints:</span>
                          <ul className="list-disc list-inside text-gray-300 text-[11px] space-y-1">
                            {ps.rules.map((rule, rIdx) => (
                              <li key={rIdx}>{rule}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {ps.pdfUrl && (
                        <a
                          href={ps.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#0284c7] text-black font-extrabold text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(0,217,255,0.4)] hover:scale-105 transition-all cursor-pointer mt-2"
                        >
                          <Download className="w-4 h-4" />
                          DOWNLOAD PROBLEM STATEMENT PDF
                        </a>
                      )}
                    </div>
                  ))}
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
                  {portalState.announcements.length} ALERTS
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
                {portalState.announcements.map((ann) => (
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
    </main>
  );
}
