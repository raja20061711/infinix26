'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface OceanPreloaderProps {
  onLoadingComplete: () => void;
}

export default function OceanPreloader({ onLoadingComplete }: OceanPreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const progressObj = useRef({ value: 0 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(containerRef.current, {
            opacity: 0,
            scale: 1.04,
            filter: 'blur(12px)',
            duration: 0.6,
            ease: 'power2.inOut',
            onComplete: () => {
              onLoadingComplete();
            },
          });
        },
      });

      // Smooth percentage count up from 0% to 100% in 1.4s
      tl.to(progressObj.current, {
        value: 100,
        duration: 1.4,
        ease: 'power2.inOut',
        onUpdate: () => {
          setProgress(Math.round(progressObj.current.value));
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [onLoadingComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between p-6 bg-[#010714] text-white select-none overflow-hidden"
    >
      {/* Background Cyan Glow */}
      <div className="absolute inset-0 bg-radial from-[#00D9FF]/15 via-transparent to-transparent pointer-events-none blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#00D9FF]/10 blur-[100px] pointer-events-none animate-pulse" />

      {/* Top Bar: Institutional Title & Skip Button */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between pt-4">
        <div className="space-y-0.5">
          <h3 className="font-orbitron font-black text-xs sm:text-sm text-white tracking-[0.2em] uppercase drop-shadow-[0_0_15px_rgba(0,217,255,0.8)]">
            RAMCO INSTITUTE OF TECHNOLOGY
          </h3>
          <p className="text-[10px] sm:text-xs text-[#00D9FF] font-mono tracking-widest uppercase font-semibold">
            DEPARTMENT OF INFORMATION TECHNOLOGY
          </p>
        </div>

        <button
          onClick={onLoadingComplete}
          className="px-4 py-1.5 rounded-full bg-[#04162E]/80 border border-[#00D9FF]/40 text-[#00D9FF] hover:text-white hover:border-[#00D9FF] hover:bg-[#00D9FF]/20 text-[10px] font-orbitron font-bold tracking-widest uppercase transition-all duration-300 backdrop-blur-md shadow-[0_0_20px_rgba(0,217,255,0.25)] cursor-pointer"
        >
          SKIP ➔
        </button>
      </div>

      {/* Center Stage: Simple, Elegant Logo & Neon Spinner */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto space-y-6">
        {/* Central Logo Ring */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
          {/* Animated Spinning Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#00D9FF] border-r-[#7CE7FF] animate-spin shadow-[0_0_30px_#00D9FF]" />
          <div className="absolute inset-2 rounded-full border border-dashed border-[#00D9FF]/30 animate-[spin_6s_linear_infinite_reverse]" />

          {/* Clean INFINIX Emblem */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 relative flex items-center justify-center drop-shadow-[0_0_35px_rgba(0,217,255,0.9)] animate-pulse">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/infinix-event-logo-clean.png"
              alt="INFINIX Emblem"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Website Title & Subtitle */}
        <div className="space-y-2">
          <h1 className="font-orbitron font-black text-4xl sm:text-6xl tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-[#7CE7FF] to-[#00D9FF] drop-shadow-[0_0_40px_rgba(0,217,255,0.8)] uppercase">
            INFINIX&apos;26
          </h1>
          <p className="text-xs sm:text-sm font-mono tracking-[0.35em] text-gray-300 uppercase font-bold">
            NATIONAL LEVEL 32-HOURS HACKATHON
          </p>
        </div>
      </div>

      {/* Bottom Stage: Progress Bar & Status */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md pb-6 space-y-2 text-center">
        <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-widest text-gray-300">
          <span className="text-[#00D9FF] uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00D9FF] animate-ping" />
            LOADING PORTAL
          </span>
          <span className="text-white font-black text-sm">{progress}%</span>
        </div>

        {/* Clean Progress Line */}
        <div className="w-full h-1.5 rounded-full bg-[#04162e] border border-[#00D9FF]/40 overflow-hidden relative shadow-[0_0_20px_rgba(0,217,255,0.4)]">
          <div
            style={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-[#00D9FF] to-[#7CE7FF] shadow-[0_0_20px_#00D9FF] transition-all duration-75 ease-out rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
