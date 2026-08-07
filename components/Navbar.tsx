'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ExternalLink, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Announcement } from '@/lib/portalState';
import { supabase, fetchAnnouncementsFromSupabase } from '@/lib/supabaseClient';

const navLinks = [
  { name: 'HOME', href: '/#hero' },
  { name: 'ABOUT', href: '/#about' },
  { name: 'DOMAINS', href: '/#tracks' },
  { name: 'TIMELINE', href: '/#timeline' },
  { name: 'PRIZES', href: '/#prizes' },
  { name: 'COMMITTEE', href: '/committee' },
  { name: 'SPONSORS', href: '/#sponsors' },
  { name: 'CONTACT', href: '/#contact' },
  { name: 'PORTAL', href: '/student/login' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [announcementsModalOpen, setAnnouncementsModalOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    // 1. Initial fetch strictly from Supabase DB (Only Admin published announcements)
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
      } catch (e) {
        console.error('Failed to fetch announcements from Supabase:', e);
      }
    };

    loadInitialAnnouncements();

    // 2. Supabase Realtime Subscription for Admin Announcements (No polling)
    const channel = supabase
      .channel('public:announcements:navbar')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        (payload) => {
          console.log('⚡ Realtime Announcement Received:', payload);
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
                // Open modal drawer automatically when admin broadcasts a new announcement
                setAnnouncementsModalOpen(true);
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
      window.removeEventListener('scroll', handleScroll);
      supabase.removeChannel(channel);
    };
  }, []);

  const handleMobileNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith('/#')) {
      const targetId = href.replace('/#', '');
      if (window.location.pathname === '/') {
        e.preventDefault();
        setTimeout(() => {
          const elem = document.getElementById(targetId);
          if (elem) {
            const yOffset = -85;
            const y = elem.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 150);
      }
    }
  };

  const marqueeList =
    announcements.length > 0
      ? [...announcements, ...announcements, ...announcements, ...announcements]
      : [];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500">
        {/* Main Floating Glass Navbar */}
        <div className="py-2.5 sm:py-3 px-3 sm:px-8">
          <div
            className={`max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all duration-500 ${
              scrolled
                ? 'glass-nav shadow-[0_0_30px_rgba(0,217,255,0.25)] border-[#00D9FF]/35'
                : 'bg-[#020817]/60 backdrop-blur-md border border-[#00D9FF]/20'
            } flex items-center justify-between`}
          >
            {/* Cute INFINIX Logo */}
            <Link href="/#hero" className="flex items-center gap-2.5 sm:gap-3 group" data-hoverable="true">
              <div className="relative flex items-center justify-center w-8 h-8 sm:w-9.5 sm:h-9.5 rounded-full bg-[#04162E]/90 border border-[#00D9FF]/50 shadow-[0_0_18px_rgba(0,217,255,0.45)] group-hover:scale-110 group-hover:border-[#00D9FF] transition-all overflow-hidden p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/infinix-event-logo-clean.png"
                  alt="INFINIX'26 Event Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(0,217,255,0.85)]"
                />
                <div className="absolute inset-0 rounded-full bg-[#00D9FF]/15 blur-sm group-hover:blur-md transition-all" />
              </div>
              <span className="font-orbitron font-extrabold text-base sm:text-xl tracking-wider text-white group-hover:text-[#00D9FF] transition-colors">
                INFINIX&apos;26
              </span>
            </Link>

            {/* Desktop Links */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-xs font-semibold tracking-widest text-gray-300 hover:text-[#00D9FF] hover:drop-shadow-[0_0_10px_#00D9FF] transition-all duration-300"
                  data-hoverable="true"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            {/* Right Action Cluster: Notification Bell & Register Now */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Live Announcements Bell Button */}
              <button
                onClick={() => setAnnouncementsModalOpen(true)}
                className="relative p-2.5 rounded-full bg-[#04162e]/90 border border-[#00D9FF]/40 text-[#00D9FF] hover:border-[#00D9FF] hover:shadow-[0_0_20px_rgba(0,217,255,0.6)] hover:scale-105 transition-all cursor-pointer group"
                title="Live Website Announcements"
                data-hoverable="true"
              >
                <Bell className="w-4 h-4 text-[#00D9FF] group-hover:rotate-12 transition-transform" />
                {announcements.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D9FF] opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00D9FF]" />
                  </span>
                )}
              </button>

              {/* Register Now Glass CTA Button */}
              <Link
                href="/register"
                className="relative group inline-flex items-center gap-2 overflow-hidden px-6 py-2.5 rounded-full glass-panel border border-[#00D9FF]/50 text-xs font-extrabold tracking-widest text-white hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(0,217,255,0.3)] hover:shadow-[0_0_35px_rgba(0,217,255,0.8)]"
                data-hoverable="true"
              >
                <span className="relative z-10 flex items-center gap-2">
                  REGISTER NOW
                  <ExternalLink className="w-3.5 h-3.5 text-[#00D9FF] group-hover:text-black transition-colors" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#00D9FF] via-[#4CCFFF] to-[#7CE7FF] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </Link>
            </div>

            {/* Mobile Right Controls */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setAnnouncementsModalOpen(true)}
                className="relative p-2 rounded-lg glass-panel border border-[#00D9FF]/30 text-[#00D9FF] active:scale-95 transition-transform"
                aria-label="Announcements"
              >
                <Bell className="w-5 h-5" />
                {announcements.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D9FF] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00D9FF]" />
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg glass-panel border border-[#00D9FF]/30 text-white hover:text-[#00D9FF] active:scale-95 transition-transform"
                aria-label="Toggle Menu"
                data-hoverable="true"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-[#00D9FF]" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="lg:hidden mt-2 max-w-7xl mx-auto bg-[#020817]/98 backdrop-blur-2xl border border-[#00D9FF]/40 rounded-3xl p-5 shadow-[0_15px_40px_rgba(0,0,0,0.9)] overflow-hidden pointer-events-auto"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleMobileNavClick(e, link.href)}
                    className="text-xs font-bold tracking-widest text-gray-200 hover:text-[#00D9FF] active:text-[#00D9FF] py-3 px-4 rounded-xl hover:bg-[#00D9FF]/10 transition-all flex items-center justify-between border-b border-white/5 last:border-none"
                  >
                    <span>{link.name}</span>
                    <span className="text-[#00D9FF]/60 text-xs">→</span>
                  </a>
                ))}

                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#4CCFFF] text-black font-extrabold text-xs tracking-widest uppercase shadow-[0_0_20px_#00D9FF] text-center flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  REGISTER NOW
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Small Premium LIVE Announcement Ticker (Positioned at top of page so it scrolls away naturally with page content) */}
      <AnimatePresence>
        {announcements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '34px' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setAnnouncementsModalOpen(true)}
            className="absolute top-[64px] sm:top-[72px] left-0 right-0 z-30 w-full h-[34px] bg-[#020817]/85 backdrop-blur-md border-y border-[#00D9FF]/30 shadow-[0_0_15px_rgba(0,217,255,0.15)] flex items-center overflow-hidden cursor-pointer group select-none transition-colors hover:bg-[#04162e]/90"
            title="Click to view live announcements"
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

            {/* Marquee Ticker Container */}
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

      {/* LIVE ANNOUNCEMENTS OCEAN GLASS MODAL */}
      <AnimatePresence>
        {announcementsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-[#020b18]/95 border border-[#00D9FF]/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,217,255,0.25)] relative overflow-hidden backdrop-blur-2xl text-white"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00D9FF]/10 blur-3xl rounded-full pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#00D9FF]/20 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#00D9FF]/15 border border-[#00D9FF]/40 text-[#00D9FF]">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-extrabold text-lg text-white tracking-wide uppercase">
                      LIVE ANNOUNCEMENTS
                    </h3>
                    <p className="text-xs text-gray-400">
                      Official Live Broadcasts & Emergency Updates from Admin
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setAnnouncementsModalOpen(false)}
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

                        <h4 className="font-orbitron font-bold text-sm text-white mb-1">
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

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-[#00D9FF]/20 flex items-center justify-between text-xs text-gray-400">
                <span>INFINIX&apos;26 Official Broadcast System</span>
                <button
                  onClick={() => setAnnouncementsModalOpen(false)}
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
