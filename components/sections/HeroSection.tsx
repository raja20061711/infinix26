'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExternalLink, Play, ChevronDown, Download } from 'lucide-react';
import TiltCard from '../ui/TiltCard';

function TitleVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animId: number;

    const renderFrame = () => {
      if (video.readyState >= 2 && !video.paused && !video.ended) {
        const w = video.videoWidth || 800;
        const h = video.videoHeight || 400;

        // Crop top & bottom empty video margins so canvas tightly wraps INFINIX text
        const cropY = Math.floor(h * 0.22);
        const cropH = Math.floor(h * 0.56);

        if (canvas.width !== w || canvas.height !== cropH) {
          canvas.width = w;
          canvas.height = cropH;
        }

        ctx.drawImage(video, 0, cropY, w, cropH, 0, 0, w, cropH);
        const imgData = ctx.getImageData(0, 0, w, cropH);
        const data = imgData.data;
        const len = data.length;

        for (let i = 0; i < len; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Key out black background (turn dark pixels into 100% transparent alpha)
          if (r < 35 && g < 35 && b < 35) {
            data[i + 3] = 0;
          } else {
            const maxVal = Math.max(r, g, b);
            if (maxVal < 65) {
              data[i + 3] = Math.floor(((maxVal - 35) / 30) * 255);
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
      }
      animId = requestAnimationFrame(renderFrame);
    };

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
    animId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="hidden"
      >
        <source src="/infinix-title-video.mp4.mp4" type="video/mp4" />
        <source src="/infinix-title-video.mp4" type="video/mp4" />
        <source src="/infinix-title.mp4" type="video/mp4" />
        <source src="/infinix-animated-title.mp4" type="video/mp4" />
      </video>

      <canvas
        ref={canvasRef}
        className="w-full max-h-[160px] sm:max-h-[220px] md:max-h-[280px] object-contain filter brightness-[0.82] contrast-[1.35] saturate-[1.35] drop-shadow-[0_6px_25px_rgba(0,0,0,0.9)] drop-shadow-[0_0_20px_rgba(0,217,255,0.5)]"
      />
    </div>
  );
}

export default function HeroSection() {
  // Live Countdown timer targeted at 10 September 2026
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date('2026-09-10T10:00:00');

    const updateTimer = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen pt-28 pb-16 flex flex-col items-center justify-center text-center px-4 overflow-hidden z-10"
    >
      {/* Top Institutional Header Row (Matching Official RIT Format with Dark Squircle Badges) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 w-full max-w-5xl mx-auto px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        {/* Left Official Logo - Ramco Institute of Technology Dark Squircle Badge */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0c1322]/90 backdrop-blur-xl border border-[#00D9FF]/35 p-3 shadow-[0_0_20px_rgba(0,217,255,0.25)] hover:border-[#00D9FF] hover:shadow-[0_0_30px_rgba(0,217,255,0.45)] hover:scale-105 transition-all duration-300 flex items-center justify-center relative overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo new rit.png"
            alt="Ramco Institute of Technology Official New Logo"
            className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(0,217,255,0.4)]"
          />
        </motion.div>

        {/* Center Institutional Typography Stack */}
        <div className="flex flex-col items-center text-center flex-1 space-y-1">
          {/* Main Event Badge */}
          <span className="font-orbitron font-extrabold text-sm sm:text-base tracking-[0.3em] text-[#00D9FF] drop-shadow-[0_0_12px_rgba(0,217,255,0.85)] uppercase">

          </span>

          {/* Institution Name */}
          <h2 className="font-orbitron font-black text-sm sm:text-base md:text-lg tracking-widest text-white uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            RAMCO INSTITUTE OF TECHNOLOGY
          </h2>

          {/* Autonomous & Accreditation Status */}
          <span className="text-[10px] sm:text-xs font-semibold text-gray-300 tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            (An Autonomous Institution)
          </span>

          {/* Department Name with Cyan Accent */}
          <p className="text-xs sm:text-sm font-bold text-[#7CE7FF] tracking-widest uppercase pt-0.5 drop-shadow-[0_0_10px_rgba(0,217,255,0.6)]">
            DEPARTMENT OF INFORMATION TECHNOLOGY
          </p>

          {/* Student Chapter Affiliation */}
          <p className="text-xs sm:text-sm text-gray-300 font-semibold tracking-wider drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            in association with{' '}
            <span className="text-[#7CE7FF] font-bold">IE(I)-IT Student Chapter</span>
          </p>

          {/* Direct Registration Live Badge */}
          <div className="flex items-center gap-2.5 mt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0c1322]/90 border border-[#00D9FF]/40 hover:border-[#00D9FF] hover:shadow-[0_0_20px_rgba(0,217,255,0.4)] transition-all duration-300 group"
              data-hoverable="true"
            >
              <span className="w-2 h-2 rounded-full bg-[#00D9FF] animate-pulse" />
              <span className="font-orbitron font-extrabold text-xs sm:text-sm text-[#7CE7FF] group-hover:text-white transition-colors tracking-wider drop-shadow-[0_0_8px_rgba(0,217,255,0.5)]">
                REGISTRATION LIVE • DIRECT ONLINE ENTRY
              </span>
            </Link>
          </div>
        </div>

        {/* Right Official Logo - IE(I)-IT Student Chapter Dark Squircle Badge */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
          className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0c1322]/90 backdrop-blur-xl border border-[#00D9FF]/35 p-3 shadow-[0_0_20px_rgba(0,217,255,0.25)] hover:border-[#00D9FF] hover:shadow-[0_0_30px_rgba(0,217,255,0.45)] hover:scale-105 transition-all duration-300 flex items-center justify-center relative overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/iei-logo.png"
            alt="IE(I)-IT Student Chapter Official Logo"
            className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(0,217,255,0.4)]"
          />
        </motion.div>
      </motion.div>

      {/* Pristine 3D Metallic Cyber Phoenix Event Emblem (Isolated 100% Transparent PNG) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="mt-1 mb-1 flex items-center justify-center"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-24 h-28 sm:w-32 sm:h-36 md:w-40 md:h-44 drop-shadow-[0_0_35px_rgba(0,217,255,0.75)] hover:scale-105 transition-transform duration-300 cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/infinix-event-logo-clean.png"
            alt="INFINIX'26 Official 3D Event Emblem"
            className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(0,217,255,0.85)]"
          />
        </motion.div>
      </motion.div>

      {/* Animated Title Video for INFINIX'26 (Positioned higher & richer dark ocean tone) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-5xl mx-auto flex items-center justify-center -mt-2 my-0"
      >
        <TitleVideoPlayer />
      </motion.div>

      {/* Tagline: CREATE • INNOVATE • ELEVATE */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25 }}
        className="mt-2 font-orbitron text-sm sm:text-lg md:text-xl font-bold tracking-[0.35em] text-[#7CE7FF] drop-shadow-[0_0_12px_rgba(0,217,255,0.8)] uppercase"
      >
        CREATE • INNOVATE • ELEVATE
      </motion.p>

      {/* Subtitle: A 32-HOUR NATIONAL LEVEL HACKATHON */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35 }}
        className="mt-2 text-xs sm:text-sm tracking-[0.25em] text-gray-300 uppercase font-medium drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
      >
        A 32-HOURS NATIONAL LEVEL HACKATHON
      </motion.p>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.45 }}
        className="mt-6 flex flex-wrap items-center justify-center gap-5 z-10"
      >
        {/* Register Now Primary Button */}
        <Link
          href="/register"
          className="relative group overflow-hidden px-8 py-3.5 rounded-full bg-gradient-to-r from-[#00D9FF] via-[#4CCFFF] to-[#00D9FF] text-black font-extrabold text-xs tracking-widest uppercase shadow-[0_0_30px_rgba(0,217,255,0.6)] hover:shadow-[0_0_55px_rgba(0,217,255,1)] hover:scale-105 transition-all duration-300 flex items-center gap-2.5"
        >
          <span className="relative z-10 flex items-center gap-2">
            REGISTER NOW
            <ExternalLink className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </Link>

        {/* Explore More Secondary Button */}
        <a
          href="#about"
          className="px-8 py-3.5 rounded-full glass-panel border border-[#00D9FF]/40 text-xs font-extrabold tracking-widest text-white hover:text-[#7CE7FF] hover:border-[#00D9FF] hover:shadow-[0_0_30px_rgba(0,217,255,0.5)] hover:scale-105 transition-all duration-300 flex items-center gap-2.5"
        >
          EXPLORE MORE
          <Play className="w-3.5 h-3.5 fill-current text-[#00D9FF]" />
        </a>

        {/* Download Brochure Secondary Button */}
        <a
          href="/infinix26-brochure.pdf"
          target="_blank"
          rel="noreferrer"
          download
          className="px-8 py-3.5 rounded-full glass-panel border border-[#00D9FF]/40 text-xs font-extrabold tracking-widest text-white hover:text-[#7CE7FF] hover:border-[#00D9FF] hover:shadow-[0_0_30px_rgba(0,217,255,0.5)] hover:scale-105 transition-all duration-300 flex items-center gap-2.5"
          data-hoverable="true"
        >
          <span>DOWNLOAD BROCHURE</span>
          <Download className="w-3.5 h-3.5 text-[#00D9FF]" />
        </a>
      </motion.div>

      {/* Photorealistic Glassmorphism Countdown Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="mt-14 w-full max-w-2xl mx-auto"
      >
        <TiltCard className="rounded-3xl">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#00D9FF]/30 shadow-[0_20px_50px_rgba(2,8,23,0.85)] relative group overflow-hidden bg-[#04162E]/60 backdrop-blur-2xl">
            {/* Caustic Reflection Bar at Bottom */}
            <div className="absolute inset-x-0 -bottom-10 h-28 bg-gradient-to-t from-[#00D9FF]/30 to-transparent blur-2xl pointer-events-none" />

            <div className="flex items-center justify-center gap-2.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#00D9FF] shadow-[0_0_10px_#00D9FF] animate-pulse" />
              <p className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-[#7CE7FF] uppercase">
                THE HACKATHON BEGINS IN
              </p>
              <span className="w-2 h-2 rounded-full bg-[#00D9FF] shadow-[0_0_10px_#00D9FF] animate-pulse" />
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center divide-x divide-[#00D9FF]/20">
              {/* Days */}
              <div className="px-2">
                <span className="block font-orbitron font-extrabold text-3xl sm:text-5xl text-white drop-shadow-[0_0_20px_rgba(0,217,255,0.7)]">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="block mt-1 text-[9px] sm:text-xs font-semibold tracking-widest text-[#7CE7FF] uppercase">
                  DAYS
                </span>
              </div>

              {/* Hours */}
              <div className="px-2">
                <span className="block font-orbitron font-extrabold text-3xl sm:text-5xl text-white drop-shadow-[0_0_20px_rgba(0,217,255,0.7)]">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="block mt-1 text-[9px] sm:text-xs font-semibold tracking-widest text-[#7CE7FF] uppercase">
                  HOURS
                </span>
              </div>

              {/* Minutes */}
              <div className="px-2">
                <span className="block font-orbitron font-extrabold text-3xl sm:text-5xl text-white drop-shadow-[0_0_20px_rgba(0,217,255,0.7)]">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="block mt-1 text-[9px] sm:text-xs font-semibold tracking-widest text-[#7CE7FF] uppercase">
                  MINUTES
                </span>
              </div>

              {/* Seconds */}
              <div className="px-2">
                <span className="block font-orbitron font-extrabold text-3xl sm:text-5xl text-white drop-shadow-[0_0_20px_rgba(0,217,255,0.7)]">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="block mt-1 text-[9px] sm:text-xs font-semibold tracking-widest text-[#7CE7FF] uppercase">
                  SECONDS
                </span>
              </div>
            </div>
          </div>
        </TiltCard>
      </motion.div>

      {/* Floating Scroll Indicator */}
      <motion.a
        href="#about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        className="mt-12 flex flex-col items-center gap-1.5 text-xs text-gray-400 hover:text-[#00D9FF] transition-colors"
      >
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
          SCROLL TO EXPLORE
        </span>
        <div className="p-2 rounded-full glass-panel border border-[#00D9FF]/30 text-[#00D9FF]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </motion.a>
    </section>
  );
}
