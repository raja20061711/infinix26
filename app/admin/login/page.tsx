'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import OceanPortalBackground from '@/components/portal/OceanPortalBackground';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverCreds, setServerCreds] = useState<{ email: string; pass: string } | null>(null);

  useEffect(() => {
    // 1. Try reading client localStorage first for instant response
    try {
      const savedCreds = localStorage.getItem('admin_credentials');
      if (savedCreds) {
        const parsed = JSON.parse(savedCreds);
        if (parsed.email && parsed.password) {
          setServerCreds({ email: parsed.email.trim().toLowerCase(), pass: parsed.password.trim() });
        }
      }
    } catch (e) {}

    // 2. Query server for active admin credentials
    fetch('/api/admin/credentials')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.email && data.password) {
          const fetchedEmail = data.email.trim().toLowerCase();
          const fetchedPass = data.password.trim();
          setServerCreds({ email: fetchedEmail, pass: fetchedPass });
          try {
            localStorage.setItem('admin_credentials', JSON.stringify({ email: fetchedEmail, password: fetchedPass }));
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter Admin Email and Password');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const inputEmail = email.trim().toLowerCase();
      const inputPass = password.trim();

      // Explicitly reject old default insecure passwords like 'admin 2026' or 'admin2026'
      const normalizedPass = inputPass.replace(/\s+/g, '').toLowerCase();
      if (normalizedPass === 'admin2026' || normalizedPass === 'admin') {
        setError('Default password "admin 2026" has been permanently disabled. Only your configured custom admin password can grant access.');
        setLoading(false);
        return;
      }

      // Determine active target credentials (STRICT UNLOCK: ONLY the user-set password works!)
      let activeEmail = serverCreds?.email || 'admininfinixrit@gmail.com';
      let activePass = serverCreds?.pass || 'Infinix#Admin2026';

      try {
        const savedCreds = localStorage.getItem('admin_credentials');
        if (savedCreds) {
          const parsed = JSON.parse(savedCreds);
          if (parsed.email && parsed.password) {
            activeEmail = parsed.email.trim().toLowerCase();
            activePass = parsed.password.trim();
          }
        }
      } catch (e) {}

      // ONLY the configured admin email & password will grant access!
      const isValid = inputEmail === activeEmail && inputPass === activePass;

      if (isValid) {
        localStorage.setItem('admin_session_auth', 'true');
        router.push('/admin/dashboard');
      } else {
        setError('Invalid Admin Email or Password. Only your saved Admin password can grant access.');
        setLoading(false);
      }
    }, 350);
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden select-none">
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
            ADMINISTRATION CONTROL
          </span>
          <h1 className="font-orbitron font-black text-2xl text-white tracking-wider uppercase">
            ADMIN PORTAL
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Authorized Ramco Institute of Technology Organizers Only
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

        {/* Form Fields */}
        <form onSubmit={handleAdminLogin} autoComplete="off" className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold tracking-widest text-[#7CE7FF] uppercase mb-2">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="admin_email_field"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admininfinixrit@gmail.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#00D9FF] focus:ring-1 focus:ring-[#00D9FF] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-widest text-[#7CE7FF] uppercase mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="admin_password_field"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#020d1e] border border-[#00D9FF]/30 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#00D9FF] focus:ring-1 focus:ring-[#00D9FF] transition-all"
              />
            </div>
          </div>

          {/* Buttons Stack */}
          <div className="pt-4 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00D9FF] via-[#38bdf8] to-[#00D9FF] text-black font-extrabold text-xs tracking-widest uppercase shadow-[0_0_25px_rgba(0,217,255,0.5)] hover:shadow-[0_0_40px_rgba(0,217,255,0.8)] hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>ACCESSING ADMIN CONTROL...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-black" />
                  <span>LOGIN TO ADMIN PORTAL</span>
                </>
              )}
            </button>

            <Link
              href="/"
              className="w-full py-3 rounded-xl bg-transparent border border-gray-700 hover:border-gray-500 text-xs font-bold text-gray-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>BACK TO HOME</span>
            </Link>
          </div>
        </form>
      </motion.div>
    </main>
  );
}
