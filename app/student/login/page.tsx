'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Users, KeyRound, Sparkles, AlertCircle } from 'lucide-react';
import OceanPortalBackground from '@/components/portal/OceanPortalBackground';
import { getPortalState } from '@/lib/portalState';

export default function StudentLoginPage() {
  const router = useRouter();
  const [teamId, setTeamId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!teamId.trim()) {
      setError('Please enter your Team ID');
      return;
    }

    const state = getPortalState();
    const foundTeam = state.teams.find((t) => t.teamId.toUpperCase() === teamId.trim().toUpperCase());

    if (!foundTeam) {
      setError('Invalid Team ID. Please check your credentials or register on Unstop.');
      return;
    }

    // Save student session
    localStorage.setItem('student_session_team_id', foundTeam.teamId);
    router.push('/student/dashboard');
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#01050e] text-slate-100">
      {/* 2D Cinematic Ocean Background */}
      <OceanPortalBackground />

      {/* Floating Center Glass Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-3xl bg-[#04162E]/85 backdrop-blur-2xl border border-[#00D9FF]/40 shadow-[0_25px_60px_rgba(1,4,13,0.95)]"
      >
        {/* Top Header & Emblem */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#02142b] border border-[#00D9FF]/50 shadow-[0_0_20px_rgba(0,217,255,0.4)] flex items-center justify-center mb-4 relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/infinix-event-logo-clean.png"
              alt="INFINIX'26 Emblem"
              className="w-10 h-10 object-contain filter drop-shadow-[0_0_8px_rgba(0,217,255,0.8)]"
            />
          </div>
          <span className="font-orbitron font-extrabold text-xs tracking-[0.3em] text-[#00D9FF] uppercase mb-1">
            INFINIX&apos;26 PORTAL
          </span>
          <h1 className="font-orbitron font-black text-2xl text-white tracking-wider uppercase">
            STUDENT LOGIN
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Enter your Team ID to access your hackathon portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Team ID Field */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest text-[#7CE7FF] uppercase mb-2">
              TEAM ID
            </label>
            <div className="relative">
              <Users className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                placeholder="e.g. INF-2026-001"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#021024]/90 border border-[#00D9FF]/30 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#00D9FF] focus:ring-1 focus:ring-[#00D9FF] transition-all font-mono"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest text-[#7CE7FF] uppercase mb-2">
              PASSWORD
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#021024]/90 border border-[#00D9FF]/30 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#00D9FF] focus:ring-1 focus:ring-[#00D9FF] transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-3">
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00D9FF] via-[#38bdf8] to-[#0284c7] text-black font-orbitron font-extrabold text-xs tracking-widest uppercase shadow-[0_0_25px_rgba(0,217,255,0.4)] hover:shadow-[0_0_35px_rgba(0,217,255,0.7)] hover:scale-[1.02] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-black" />
              <span>LOGIN TO DASHBOARD</span>
            </button>

            <Link
              href="/"
              className="w-full py-3 rounded-xl bg-transparent border border-white/10 text-gray-300 font-semibold text-xs tracking-wider uppercase hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>BACK TO HOME</span>
            </Link>
          </div>
        </form>

        {/* Credentials Helper */}
        <div className="mt-8 pt-4 border-t border-[#00D9FF]/15 text-center text-[11px] text-gray-400">
          <span>Demo Team IDs: </span>
          <span className="font-mono text-[#00D9FF] font-semibold">INF-2026-001</span>
          <span> | </span>
          <span className="font-mono text-[#00D9FF] font-semibold">INF-2026-002</span>
        </div>
      </motion.div>
    </main>
  );
}
