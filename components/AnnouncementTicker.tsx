'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Volume2, ChevronRight } from 'lucide-react';
import { getPortalState, Announcement } from '@/lib/portalState';

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-default-1',
    title: "🚀 Official Registrations Open!",
    message: "Registration Fee: ₹200 for Internal Ramco College Students & ₹350 for External College Students. Register your team today!",
    category: 'Urgent',
    timestamp: 'Just Now',
    isPublished: true,
  },
  {
    id: 'ann-default-2',
    title: '🏆 Total ₹15,000 Prize Pool',
    message: 'Compete across 7 exciting hackathon themes & win cash prizes + certificates!',
    category: 'Update',
    timestamp: 'Just Now',
    isPublished: true,
  },
  {
    id: 'ann-default-3',
    title: '📌 Hardware Notice for Open Innovation',
    message: 'Participants must bring their own hardware, IoT modules, sensors & development boards.',
    category: 'General',
    timestamp: 'Just Now',
    isPublished: true,
  },
];

export default function AnnouncementTicker() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(DEFAULT_ANNOUNCEMENTS);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const loadState = () => {
      const state = getPortalState();
      if (state && state.announcements && state.announcements.length > 0) {
        const publishedOnly = state.announcements.filter((a) => a.isPublished !== false);
        if (publishedOnly.length > 0) {
          setAnnouncements(publishedOnly);
        }
      }
    };

    loadState();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'infinix26_portal_state_v2') {
        loadState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(loadState, 3000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const latestAnn = announcements[0] || DEFAULT_ANNOUNCEMENTS[0];

  return (
    <>
      {/* 1. TOP PERMANENT NOTIFICATION BADGE & COMPACT SIDE PREVIEW CONTAINER */}
      <div className="fixed top-5 right-4 sm:right-8 z-50 flex items-center gap-2">
        {/* COMPACT SIDE PREVIEW TOOLTIP (Only hides when X is clicked) */}
        <AnimatePresence>
          {previewVisible && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={() => setDrawerOpen(true)}
              className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#020b18]/95 border border-[#00D9FF]/40 text-white shadow-[0_0_20px_rgba(0,217,255,0.2)] backdrop-blur-xl cursor-pointer hover:border-[#00D9FF] transition-all max-w-sm group"
            >
              <span className="w-2 h-2 rounded-full bg-[#00D9FF] animate-pulse shrink-0" />
              
              <div className="truncate text-xs">
                <span className="font-bold text-[#00D9FF] font-orbitron text-[11px] mr-1.5">
                  ANNOUNCEMENT:
                </span>
                <span className="text-gray-200 text-[11px] font-medium truncate">
                  {latestAnn.title}
                </span>
              </div>

              <ChevronRight className="w-3.5 h-3.5 text-[#00D9FF] group-hover:translate-x-0.5 transition-transform shrink-0" />

              {/* Close side preview ONLY (Notification badge stays!) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewVisible(false);
                }}
                className="p-0.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors shrink-0 ml-1"
                title="Hide preview text (Badge stays active)"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PERMANENT TOP NOTIFICATION BADGE BUTTON (ALWAYS SHOWS EVEN IF X IS CLICKED) */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setDrawerOpen(true)}
          className="relative flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#04162e]/90 border border-[#00D9FF]/50 text-[#00D9FF] shadow-[0_0_20px_rgba(0,217,255,0.3)] hover:border-[#00D9FF] hover:shadow-[0_0_30px_rgba(0,217,255,0.6)] backdrop-blur-xl transition-all cursor-pointer group"
          title="Open Website Live Announcements"
        >
          {/* Pulsing Active Dot */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D9FF] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00D9FF]" />
          </span>

          <Bell className="w-4 h-4 text-[#00D9FF] group-hover:rotate-12 transition-transform" />

          <span className="text-[11px] font-extrabold font-orbitron tracking-widest uppercase text-white hidden sm:inline">
            UPDATES
          </span>

          {/* Count Badge */}
          <span className="px-1.5 py-0.2 rounded-full bg-[#00D9FF] text-black font-orbitron font-extrabold text-[10px]">
            {announcements.length}
          </span>
        </motion.button>
      </div>

      {/* 2. OCEAN GLASS LIVE ANNOUNCEMENTS MODAL DRAWER */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-[#020b18]/95 border border-[#00D9FF]/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,217,255,0.25)] relative overflow-hidden backdrop-blur-2xl text-white"
            >
              {/* Top Caustic Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00D9FF]/10 blur-3xl rounded-full pointer-events-none" />

              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#00D9FF]/20 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#00D9FF]/15 border border-[#00D9FF]/40 text-[#00D9FF]">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-extrabold text-lg text-white tracking-wide uppercase">
                      WEBSITE LIVE ANNOUNCEMENTS
                    </h3>
                    <p className="text-xs text-gray-400">
                      Official Live Broadcasts & Emergency Updates from Admin
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#00D9FF] text-gray-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Announcements List */}
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {announcements.map((ann) => {
                  const isUrgent = ann.category === 'Urgent';
                  return (
                    <div
                      key={ann.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isUrgent
                          ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
                          : 'bg-[#04162e]/70 border-[#00D9FF]/25 hover:border-[#00D9FF]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-widest uppercase border ${
                            isUrgent
                              ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                              : 'bg-[#00D9FF]/10 border-[#00D9FF]/30 text-[#00D9FF]'
                          }`}
                        >
                          {ann.category}
                        </span>

                        <span className="text-[10px] text-gray-400 font-mono">
                          {ann.timestamp}
                        </span>
                      </div>

                      <h4 className="font-orbitron font-bold text-sm text-white mb-1">
                        {ann.title}
                      </h4>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans">
                        {ann.message}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Drawer Footer */}
              <div className="mt-6 pt-4 border-t border-[#00D9FF]/20 flex items-center justify-between text-xs text-gray-400">
                <span>INFINIX&apos;26 Official Broadcast System</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="px-5 py-2 rounded-full bg-[#00D9FF] text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_#00D9FF] hover:scale-105 transition-all"
                >
                  GOT IT
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
