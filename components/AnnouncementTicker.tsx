'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { Announcement } from '@/lib/portalState';
import { supabase, fetchAnnouncementsFromSupabase } from '@/lib/supabaseClient';

export default function AnnouncementTicker() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    // 1. Initial Fetch strictly from Supabase DB (Only Admin published announcements)
    const loadInitialAnnouncements = async () => {
      try {
        const dbData = await fetchAnnouncementsFromSupabase();
        if (dbData && Array.isArray(dbData)) {
          const publishedOnly: Announcement[] = dbData
            .filter((row: any) => row.is_published !== false)
            .map((row: any) => ({
              id: row.id,
              title: row.title,
              message: row.message,
              category: row.category || 'General',
              timestamp: row.created_at
                ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Just Now',
              isPublished: row.is_published ?? true,
            }));
          setAnnouncements(publishedOnly);
        }
      } catch (err) {
        console.error('Failed to fetch initial announcements in Ticker:', err);
      }
    };

    loadInitialAnnouncements();

    // 2. Supabase Realtime Subscription (NO polling / NO setInterval)
    const channel = supabase
      .channel('public:announcements:ticker')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        (payload) => {
          console.log('⚡ Realtime Announcement Ticker Payload:', payload);
          const { eventType, new: newRow, old: oldRow } = payload;

          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            if (!newRow) return;
            const annItem: Announcement = {
              id: newRow.id,
              title: newRow.title || 'New Announcement',
              message: newRow.message || '',
              category: newRow.category || 'General',
              timestamp: newRow.created_at
                ? new Date(newRow.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Just Now',
              isPublished: newRow.is_published ?? true,
            };

            setAnnouncements((prev) => {
              if (annItem.isPublished === false) {
                return prev.filter((a) => a.id !== annItem.id);
              }
              const exists = prev.some((a) => a.id === annItem.id);
              if (exists) {
                return prev.map((a) => (a.id === annItem.id ? annItem : a));
              } else {
                setDrawerOpen(true);
                return [annItem, ...prev];
              }
            });
          } else if (eventType === 'DELETE') {
            if (oldRow && oldRow.id) {
              setAnnouncements((prev) => prev.filter((a) => a.id !== oldRow.id));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const marqueeList =
    announcements.length > 0
      ? [...announcements, ...announcements, ...announcements, ...announcements]
      : [];

  return (
    <>
      {/* FULL-WIDTH LIVE ANNOUNCEMENT TICKER BAR (Renders ONLY when Admin posts announcements) */}
      <AnimatePresence>
        {announcements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '34px' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setDrawerOpen(true)}
            className="w-full h-[34px] bg-[#020817]/85 backdrop-blur-md border-y border-[#00D9FF]/30 shadow-[0_0_15px_rgba(0,217,255,0.15)] flex items-center overflow-hidden cursor-pointer group select-none transition-colors hover:bg-[#04162e]/90"
            title="Click to view all live announcements"
          >
            {/* Animated Red LIVE Dot & Label */}
            <div className="flex items-center gap-2 px-3 sm:px-4 shrink-0 z-10 bg-[#020817]/95 h-full border-r border-[#00D9FF]/30 text-xs font-orbitron font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_#ef4444]" />
              </span>
              <span className="text-red-400 font-extrabold tracking-widest text-[11px] uppercase drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">
                LIVE
              </span>
            </div>

            {/* Continuous Smooth Infinite Marquee */}
            <div className="relative flex-1 overflow-hidden h-full flex items-center">
              <div className="animate-marquee group-hover:[animation-play-state:paused] flex items-center gap-8 whitespace-nowrap w-max shrink-0 px-4">
                {marqueeList.map((ann, idx) => (
                  <div
                    key={`${ann.id}-${idx}`}
                    className="inline-flex items-center gap-2.5 text-xs sm:text-[13px] font-orbitron font-medium tracking-wide shrink-0"
                  >
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold tracking-widest uppercase border shrink-0 ${
                        ann.category === 'Urgent'
                          ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                          : ann.category === 'Update'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-[#00D9FF]/15 text-[#00D9FF] border-[#00D9FF]/30'
                      }`}
                    >
                      {ann.category || 'General'}
                    </span>
                    <span className="text-white font-semibold shrink-0">{ann.title}:</span>
                    <span className="text-cyan-100/90 font-sans text-xs shrink-0">{ann.message}</span>
                    <span className="text-[#00D9FF]/40 ml-4 font-mono shrink-0">•</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIVE ANNOUNCEMENTS MODAL DRAWER */}
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
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#00D9FF] text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Announcements List */}
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {announcements.length > 0 ? (
                  announcements.map((ann) => {
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

                        <h4 className="font-orbitron font-bold text-sm text-[#00D9FF] mb-1">
                          {ann.title}
                        </h4>
                        <p className="text-xs text-gray-300 leading-relaxed font-sans">
                          {ann.message}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-400 font-orbitron text-xs">
                    No announcements published yet. Live updates from Admin will appear here instantly.
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="mt-6 pt-4 border-t border-[#00D9FF]/20 flex items-center justify-between text-xs text-gray-400">
                <span>INFINIX&apos;26 Official Broadcast System</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="px-5 py-2 rounded-full bg-[#00D9FF] text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_#00D9FF] hover:scale-105 transition-all cursor-pointer"
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
