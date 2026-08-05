'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ExternalLink, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPortalState, Announcement } from '@/lib/portalState';

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-default-1',
    title: "Official Registrations Open!",
    message: "Registration Fee: ₹200 for Internal Ramco College Students & ₹350 for External College Students. Register your team today!",
    category: 'Urgent',
    timestamp: 'Just Now',
    isPublished: true,
  },
  {
    id: 'ann-default-2',
    title: 'Total ₹15,000 Prize Pool',
    message: 'Compete across 7 exciting hackathon themes & win cash prizes + certificates!',
    category: 'Update',
    timestamp: 'Just Now',
    isPublished: true,
  },
  {
    id: 'ann-default-3',
    title: 'Hardware Notice for Open Innovation',
    message: 'Participants must bring their own hardware, IoT modules, sensors & development boards.',
    category: 'General',
    timestamp: 'Just Now',
    isPublished: true,
  },
];

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
  const [announcements, setAnnouncements] = useState<Announcement[]>(DEFAULT_ANNOUNCEMENTS);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    const loadAnnouncements = () => {
      const state = getPortalState();
      if (state && state.announcements && state.announcements.length > 0) {
        const publishedOnly = state.announcements.filter((a) => a.isPublished !== false);
        if (publishedOnly.length > 0) {
          setAnnouncements(publishedOnly);
        }
      }
    };

    loadAnnouncements();
    const interval = setInterval(loadAnnouncements, 3000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
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

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 py-3 sm:py-4 px-3 sm:px-8 transition-all duration-500">
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all duration-500 ${
            scrolled
              ? 'glass-nav shadow-[0_0_30px_rgba(0,217,255,0.25)] border-[#00D9FF]/35'
              : 'bg-[#020817]/60 backdrop-blur-md border border-[#00D9FF]/20'
          } flex items-center justify-between`}
        >
          {/* Logo Cluster */}
          <Link href="/#hero" className="flex items-center gap-2.5 sm:gap-3 group" data-hoverable="true">
            <div className="flex items-center gap-1.5">
              <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#04162E]/90 border border-[#00D9FF]/50 shadow-[0_0_15px_rgba(0,217,255,0.4)] group-hover:scale-105 transition-all overflow-hidden p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/infinix-event-logo-clean.png"
                  alt="INFINIX'26 Event Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(0,217,255,0.85)]"
                />
              </div>
              <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#04162E]/90 border border-[#00D9FF]/50 shadow-[0_0_15px_rgba(0,217,255,0.4)] group-hover:scale-105 transition-all overflow-hidden p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/chapter-logo.png"
                  alt="IT Student Chapter Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(0,217,255,0.85)]"
                />
              </div>
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
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D9FF] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00D9FF]" />
              </span>
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
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D9FF] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00D9FF]" />
              </span>
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

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="lg:hidden mt-2 max-w-7xl mx-auto bg-[#020817]/98 backdrop-blur-2xl border border-[#00D9FF]/40 rounded-3xl p-5 shadow-[0_15px_40px_rgba(0,0,0,0.9)] overflow-hidden"
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
                      Official Updates & Direct Broadcasts from Organizer Desk
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


