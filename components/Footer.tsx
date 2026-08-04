'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin } from 'lucide-react';
import { FaLinkedinIn } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="relative z-10 bg-[#020817] border-t border-[#00D9FF]/20 pt-8 pb-4 text-gray-300">
      {/* Main Clean 3-Column Grid Layout */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-start pb-6">
        {/* Left Col: Brand Logo & Tagline */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#04162E]/90 border border-[#00D9FF]/50 shadow-[0_0_15px_rgba(0,217,255,0.5)] overflow-hidden p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/infinix-event-logo-clean.png"
                alt="INFINIX'26 Event Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(0,217,255,0.85)]"
              />
              <div className="absolute inset-0 rounded-full bg-[#00D9FF]/15 blur-sm" />
            </div>
            <span className="font-orbitron font-extrabold text-xl text-white tracking-wider">
              INFINIX&apos;26
            </span>
          </div>

          <p className="text-xs text-gray-400 font-medium tracking-wide">
            Create. Innovate. Elevate.
          </p>
        </div>

        {/* Middle Col: Quick Links */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold tracking-widest text-[#7CE7FF] uppercase mb-1">
            QUICK LINKS
          </span>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-400">
            <a href="/student/login" className="text-[#00D9FF] font-semibold hover:underline">
              Student Portal
            </a>
            <a href="/admin/login" className="text-[#7CE7FF] font-semibold hover:underline">
              Admin Portal
            </a>
            <a href="#about" className="hover:text-[#00D9FF] transition-colors">
              About
            </a>
            <a href="#tracks" className="hover:text-[#00D9FF] transition-colors">
              Tracks
            </a>
            <a href="#timeline" className="hover:text-[#00D9FF] transition-colors">
              Timeline
            </a>
            <a href="/committee" className="hover:text-[#00D9FF] transition-colors">
              Committee
            </a>
            <a href="#contact" className="hover:text-[#00D9FF] transition-colors">
              Contact
            </a>
          </div>
        </div>

        {/* Right Col: Get In Touch */}
        <div className="flex flex-col gap-2 text-xs text-gray-400">
          <span className="text-xs font-bold tracking-widest text-[#7CE7FF] uppercase mb-1">
            GET IN TOUCH
          </span>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-[#00D9FF] shrink-0" />
            <a href="mailto:infinix.itrit26@gmail.com" className="hover:text-[#00D9FF] transition-colors">
              infinix.itrit26@gmail.com
            </a>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#00D9FF] shrink-0 mt-0.5" />
            <span>Ramco Institute of Technology <br />Rajapalayam, Tamil Nadu</span>
          </div>
        </div>
      </div>

      {/* Behind the Experience - Compact Premium Signature */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="max-w-7xl mx-auto px-6 pt-5 border-t border-[#00D9FF]/15 text-center flex flex-col items-center gap-2.5"
      >
        {/* Heading Stack */}
        <div className="flex flex-col items-center gap-1">
          <h4 className="font-orbitron font-extrabold text-xs sm:text-sm tracking-[0.3em] text-[#00D9FF] uppercase drop-shadow-[0_0_10px_rgba(0,217,255,0.4)]">
            BEHIND THE EXPERIENCE
          </h4>

          {/* Thin Animated Cyan Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
            className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_8px_#00D9FF] origin-center my-0.5"
          />

          <p className="text-[11px] sm:text-xs font-medium text-[#94A3B8] tracking-wider uppercase">
            The Team Behind INFINIX&apos;26
          </p>
        </div>

        {/* Developer Names Layout (Responsive: Desktop 1 Row, Tablet 2 Rows, Mobile 1 Row) */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-row items-center justify-center gap-2.5 sm:gap-4 lg:gap-5 my-0.5">
          {/* Maharaja T */}
          <a
            href="https://www.linkedin.com/in/maharaja-t-96b13832a"
            target="_blank"
            rel="noreferrer"
            className="group relative inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white transition-all duration-300 hover:text-[#00D9FF] hover:brightness-125 cursor-pointer filter hover:drop-shadow-[0_0_8px_rgba(0,217,255,0.8)]"
            data-hoverable="true"
          >
            <span className="relative py-0.5 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-[#00D9FF] after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left">
              Maharaja T
            </span>
            <FaLinkedinIn className="w-3 h-3 text-[#00D9FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-[0_0_6px_#00D9FF] shrink-0" />
          </a>

          <span className="w-1.5 h-1.5 rounded-full bg-[#00D9FF] shadow-[0_0_8px_#00D9FF] opacity-80 hidden lg:inline-block shrink-0" />

          {/* Adshayaa V */}
          <a
            href="https://www.linkedin.com/in/adshayaa-v-977513328"
            target="_blank"
            rel="noreferrer"
            className="group relative inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white transition-all duration-300 hover:text-[#00D9FF] hover:brightness-125 cursor-pointer filter hover:drop-shadow-[0_0_8px_rgba(0,217,255,0.8)]"
            data-hoverable="true"
          >
            <span className="relative py-0.5 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-[#00D9FF] after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left">
              Adshayaa V
            </span>
            <FaLinkedinIn className="w-3 h-3 text-[#00D9FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-[0_0_6px_#00D9FF] shrink-0" />
          </a>

          <span className="w-1.5 h-1.5 rounded-full bg-[#00D9FF] shadow-[0_0_8px_#00D9FF] opacity-80 hidden lg:inline-block shrink-0" />

          {/* Sudharshan S M */}
          <a
            href="https://www.linkedin.com/in/sudharshan-s-m-75b684314?utm_source=share_via&utm_content=profile&utm_medium=member_android"
            target="_blank"
            rel="noreferrer"
            className="group relative inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white transition-all duration-300 hover:text-[#00D9FF] hover:brightness-125 cursor-pointer filter hover:drop-shadow-[0_0_8px_rgba(0,217,255,0.8)]"
            data-hoverable="true"
          >
            <span className="relative py-0.5 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-[#00D9FF] after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left">
              Sudharshan S M
            </span>
            <FaLinkedinIn className="w-3 h-3 text-[#00D9FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-[0_0_6px_#00D9FF] shrink-0" />
          </a>

          <span className="w-1.5 h-1.5 rounded-full bg-[#00D9FF] shadow-[0_0_8px_#00D9FF] opacity-80 hidden lg:inline-block shrink-0" />

          {/* Abinaya N */}
          <a
            href="https://www.linkedin.com/in/abinaya-n-846643400"
            target="_blank"
            rel="noreferrer"
            className="group relative inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white transition-all duration-300 hover:text-[#00D9FF] hover:brightness-125 cursor-pointer filter hover:drop-shadow-[0_0_8px_rgba(0,217,255,0.8)]"
            data-hoverable="true"
          >
            <span className="relative py-0.5 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-[#00D9FF] after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left">
              Abinaya N
            </span>
            <FaLinkedinIn className="w-3 h-3 text-[#00D9FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-[0_0_6px_#00D9FF] shrink-0" />
          </a>
        </div>

        {/* Subtitle Details */}
        <div className="flex flex-col items-center text-[11px] sm:text-xs text-[#94A3B8] font-normal tracking-wide space-y-0.5">
          <p>III Year B.Tech Information Technology</p>
          <p>Ramco Institute of Technology</p>
        </div>
      </motion.div>

      {/* Footer Bottom Bar (Single Line) */}
      <div className="max-w-7xl mx-auto px-6 mt-4 pt-4 border-t border-[#00D9FF]/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
        <p>© 2026 INFINIX&apos;26. All Rights Reserved.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-[#00D9FF] transition-colors">
            Privacy Policy
          </a>
          <span>|</span>
          <a href="#" className="hover:text-[#00D9FF] transition-colors">
            Terms of Use
          </a>
        </div>
      </div>
    </footer>
  );
}


