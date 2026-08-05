'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { X } from 'lucide-react';

interface OceanPreloaderProps {
  onLoadingComplete: () => void;
}

export default function OceanPreloader({ onLoadingComplete }: OceanPreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blackOverlayRef = useRef<HTMLDivElement>(null);
  const thunderFlashRef = useRef<HTMLDivElement>(null);

  // Cinematic Element Refs
  const introTextRef = useRef<HTMLDivElement>(null);
  const collabBadgeRef = useRef<HTMLDivElement>(null);
  const coreOrbRef = useRef<HTMLDivElement>(null);
  const ring1Ref = useRef<HTMLDivElement>(null);
  const ring2Ref = useRef<HTMLDivElement>(null);
  const emblemRef = useRef<HTMLDivElement>(null);
  const titleTextRef = useRef<HTMLDivElement>(null);
  const laserBeamRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);
  const progressObj = useRef({ value: 0 });
  const thunderActiveRef = useRef(false);

  // 1. 60 FPS Procedural Lightning, Embers & Ocean Caustic Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Electric Embers & Floating Bubbles
    const sparks = Array.from({ length: 70 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 2.8,
      vy: (Math.random() - 0.5) * 2.8,
      radius: Math.random() * 2.2 + 1,
      alpha: Math.random() * 0.8 + 0.2,
      color: Math.random() > 0.35 ? '#00D9FF' : '#7CE7FF',
    }));

    const bubbles = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height + height,
      radius: Math.random() * 2.5 + 1,
      speedY: Math.random() * 0.45 + 0.25,
      opacity: Math.random() * 0.35 + 0.15,
    }));

    // Function to draw procedural electric lightning bolts
    const drawLightningBolt = (x1: number, y1: number, x2: number, y2: number, opacity: number) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      const dist = Math.hypot(x2 - x1, y2 - y1);
      const steps = Math.floor(dist / 18);

      for (let i = 1; i < steps; i++) {
        const p = i / steps;
        const targetX = x1 + (x2 - x1) * p;
        const targetY = y1 + (y2 - y1) * p;
        const offsetX = (Math.random() - 0.5) * 28;
        const offsetY = (Math.random() - 0.5) * 28;
        ctx.lineTo(targetX + offsetX, targetY + offsetY);
      }
      ctx.lineTo(x2, y2);

      ctx.strokeStyle = `rgba(0, 217, 255, ${opacity})`;
      ctx.lineWidth = 3.5;
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#00D9FF';
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.95})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    let lightningTimer = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep Ocean Rich Radial Vignette
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        40,
        width / 2,
        height / 2,
        Math.max(width, height) / 1.05
      );
      bgGrad.addColorStop(0, 'rgba(8, 48, 96, 0.95)');
      bgGrad.addColorStop(0.45, 'rgba(3, 18, 43, 0.98)');
      bgGrad.addColorStop(1, '#01040d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Render Water Bubbles
      bubbles.forEach((b) => {
        b.y -= b.speedY;
        b.x += Math.sin(b.y * 0.015) * 0.3;
        if (b.y < -15) {
          b.y = height + 15;
          b.x = Math.random() * width;
        }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 217, 255, ${b.opacity})`;
        ctx.fill();
      });

      // Render Electric Sparks
      sparks.forEach((sp) => {
        sp.x += sp.vx;
        sp.y += sp.vy;

        if (sp.x < 0 || sp.x > width) sp.vx *= -1;
        if (sp.y < 0 || sp.y > height) sp.vy *= -1;

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = sp.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = sp.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      });

      // Render Lightning Strikes when Active
      if (thunderActiveRef.current) {
        lightningTimer++;
        if (lightningTimer % 4 === 0) {
          const startX = Math.random() * width;
          const endX = width / 2 + (Math.random() - 0.5) * 150;
          const endY = height / 2 + (Math.random() - 0.5) * 150;
          drawLightningBolt(startX, 0, endX, endY, Math.random() * 0.85 + 0.15);
        }

        if (lightningTimer % 7 === 0) {
          const startX = width / 2;
          const startY = height / 2;
          const endX = Math.random() * width;
          const endY = height;
          drawLightningBolt(startX, startY, endX, endY, Math.random() * 0.7 + 0.3);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 2. Full Movie Intro GSAP Timeline
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(containerRef.current, {
            opacity: 0,
            scale: 1.08,
            filter: 'blur(20px)',
            duration: 0.85,
            ease: 'power2.inOut',
            onComplete: () => {
              onLoadingComplete();
            },
          });
        },
      });

      // 0. Fade in Black
      tl.to(blackOverlayRef.current, {
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
      });

      // 1. Institutional Header & Centered Collab Badge Reveal
      tl.to(
        [introTextRef.current, collabBadgeRef.current],
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.15,
          ease: 'back.out(1.4)',
        },
        '-=0.2'
      );

      // 2. Activate Thunder & Lightning Strikes
      tl.add(() => {
        thunderActiveRef.current = true;
      }, '-=0.2');

      // Thunder Flash
      tl.to(thunderFlashRef.current, {
        opacity: 0.8,
        duration: 0.1,
        yoyo: true,
        repeat: 3,
        ease: 'power1.inOut',
      });

      // Spiked Rings & Core Charge
      tl.to(
        [ring1Ref.current, ring2Ref.current],
        {
          opacity: 1,
          scale: 1,
          duration: 0.75,
          stagger: 0.12,
          ease: 'back.out(1.5)',
        },
        '-=0.3'
      );

      gsap.to(ring1Ref.current, {
        rotation: 360,
        duration: 6,
        repeat: -1,
        ease: 'none',
      });

      gsap.to(ring2Ref.current, {
        rotation: -360,
        duration: 4.5,
        repeat: -1,
        ease: 'none',
      });

      tl.to(
        coreOrbRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.75,
          ease: 'power2.out',
        },
        '-=0.4'
      );

      tl.to(coreOrbRef.current, {
        scale: 2.2,
        boxShadow: '0 0 120px #00D9FF, 0 0 240px #00D9FF, 0 0 350px #ffffff',
        duration: 0.65,
        ease: 'power3.inOut',
      });

      // 3. THUNDER EXPLOSION FLASH & 3D EMBLEM UNLEASHED
      tl.to(thunderFlashRef.current, {
        opacity: 1,
        duration: 0.15,
        ease: 'power4.out',
      });

      tl.to(coreOrbRef.current, {
        scale: 3.2,
        opacity: 0,
        duration: 0.25,
        ease: 'power4.in',
      });

      tl.to(thunderFlashRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
      });

      tl.to(
        emblemRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: 'back.out(1.7)',
        },
        '-=0.45'
      );

      // 4. HYPER MASS 3D TITLES & LASER TEAR
      tl.to(
        titleTextRef.current,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.85,
          ease: 'back.out(1.6)',
        },
        '-=0.4'
      );

      tl.to(
        laserBeamRef.current,
        {
          opacity: 1,
          scaleX: 1,
          duration: 0.55,
          ease: 'power2.out',
        },
        '-=0.3'
      );

      tl.to(
        taglineRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
        },
        '-=0.3'
      );

      // 5. Electric Loading Line Filling (0% -> 100%)
      tl.to(
        progressObj.current,
        {
          value: 100,
          duration: 2.2,
          ease: 'power2.out',
          onUpdate: () => {
            setProgress(Math.round(progressObj.current.value));
          },
        },
        0
      );
    }, containerRef);

    return () => ctx.revert();
  }, [onLoadingComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between py-8 px-6 bg-[#00030d] text-white select-none overflow-hidden"
    >
      {/* Top Right Skip Intro Button */}
      <button
        onClick={onLoadingComplete}
        className="absolute top-4 right-4 z-50 px-3.5 py-1.5 rounded-full bg-[#04162E]/90 border border-[#00D9FF]/50 text-[#00D9FF] hover:text-white hover:border-[#00D9FF] hover:shadow-[0_0_25px_rgba(0,217,255,0.8)] text-[10px] font-orbitron font-extrabold tracking-widest uppercase transition-all duration-300 backdrop-blur-md shadow-[0_0_15px_rgba(0,217,255,0.3)] cursor-pointer"
      >
        SKIP INTRO ➔
      </button>

      {/* Dynamic Caustic Water Texture Background Layer */}
      <div className="absolute inset-0 z-0 opacity-25 mix-blend-screen pointer-events-none overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/caustics-bg.png"
          alt="Ocean Water Caustics"
          className="w-full h-full object-cover scale-110 animate-pulse transition-transform duration-1000"
        />
      </div>

      {/* Bioluminescent Deep Ocean Water Layer */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/real-ocean.png"
          alt="Deep Ocean Backdrop"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 60 FPS Lightning & Spark Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10 w-full h-full pointer-events-none" />

      {/* Initial Black Screen Overlay */}
      <div
        ref={blackOverlayRef}
        className="absolute inset-0 bg-black z-40 pointer-events-none"
      />

      {/* Explosive Thunder Light Flash Screen */}
      <div
        ref={thunderFlashRef}
        className="absolute inset-0 bg-gradient-to-tr from-[#00D9FF]/40 via-white/50 to-[#00D9FF]/40 opacity-0 pointer-events-none z-30 mix-blend-screen"
      />

      {/* TOP: CINEMATIC COLLABORATION STAGE WITH CENTERED ✕ EMBLEM */}
      <div
        ref={introTextRef}
        className="relative z-20 pt-6 sm:pt-10 text-center opacity-0 translate-y-3 space-y-1.5 max-w-4xl"
      >
        {/* Tier 1: Ramco Institute of Technology */}
        <h2 className="font-orbitron font-black text-sm sm:text-lg md:text-xl tracking-[0.3em] text-white uppercase drop-shadow-[0_0_25px_rgba(0,217,255,1)]">
          RAMCO INSTITUTE OF TECHNOLOGY
        </h2>

        {/* Tier 2: CENTERED 3D HOLOGRAPHIC COLLAB CROSS (✕) EMBLEM */}
        <div className="flex items-center justify-center gap-3 my-1.5">
          <div className="w-10 sm:w-16 h-[1px] bg-gradient-to-r from-transparent to-[#00D9FF] shadow-[0_0_12px_#00D9FF]" />
          <div
            ref={collabBadgeRef}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#04162E]/95 border-2 border-[#00D9FF] shadow-[0_0_40px_#00D9FF] flex items-center justify-center relative overflow-hidden group"
          >
            <X className="w-6 h-6 text-[#00D9FF] stroke-[3.5] drop-shadow-[0_0_12px_#00D9FF] animate-pulse" />
            <div className="absolute inset-0 bg-[#00D9FF]/25 blur-md pointer-events-none" />
          </div>
          <div className="w-10 sm:w-16 h-[1px] bg-gradient-to-l from-transparent to-[#00D9FF] shadow-[0_0_12px_#00D9FF]" />
        </div>

        {/* Tier 3: Department of Information Technology */}
        <h3 className="font-orbitron font-black text-xs sm:text-base md:text-lg tracking-[0.25em] text-[#7CE7FF] uppercase drop-shadow-[0_0_20px_rgba(0,217,255,1)]">
          DEPARTMENT OF INFORMATION TECHNOLOGY
        </h3>

        {/* Tier 4: Autonomous Status & Student Chapter Affiliation */}
        <p className="text-[9px] sm:text-[11px] text-gray-300 font-bold tracking-[0.3em] uppercase drop-shadow-[0_0_10px_rgba(0,0,0,0.9)] pt-1">
          (AN AUTONOMOUS INSTITUTION) • IN ASSOCIATION WITH IE(I)-IT STUDENT CHAPTER
        </p>

        <span className="text-[10px] sm:text-xs text-[#00D9FF] font-mono tracking-[0.4em] uppercase font-black block pt-0.5">
          PRESENTS NATIONAL LEVEL 32-HOURS HACKATHON
        </span>
      </div>

      {/* CENTER STAGE: HYPER-MASS THUNDER REVEAL */}
      <div className="relative z-20 w-full max-w-4xl mx-auto flex flex-col items-center justify-center my-auto">
        
        {/* Core Thunder Stage */}
        <div className="relative w-52 h-52 sm:w-72 sm:h-72 flex items-center justify-center">
          
          {/* Dual Spiked Cyber Rings */}
          <div
            ref={ring1Ref}
            className="absolute inset-0 rounded-full border-2 border-dashed border-[#00D9FF] opacity-0 scale-75 shadow-[0_0_60px_#00D9FF] pointer-events-none"
          />
          <div
            ref={ring2Ref}
            className="absolute inset-5 rounded-full border-2 border-dotted border-[#7CE7FF] opacity-0 scale-75 shadow-[0_0_40px_#00D9FF] pointer-events-none"
          />

          {/* Central Electric Energy Core */}
          <div
            ref={coreOrbRef}
            className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#00D9FF] via-[#38bdf8] to-white opacity-0 scale-0 shadow-[0_0_90px_#00D9FF,0_0_180px_#00D9FF] flex items-center justify-center"
          >
            <div className="w-10 h-10 rounded-full bg-white shadow-[0_0_40px_#ffffff]" />
          </div>

          {/* Assembled 3D INFINIX'26 Emblem */}
          <div
            ref={emblemRef}
            className="opacity-0 scale-75 w-full h-full flex items-center justify-center filter drop-shadow-[0_0_80px_rgba(0,217,255,1)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/infinix-event-logo-clean.png"
              alt="INFINIX'26 Phoenix Emblem"
              className="w-full h-full object-contain filter drop-shadow-[0_0_40px_rgba(0,217,255,1)]"
            />
          </div>
        </div>

        {/* HYPER-MASS 3D TITLES & ELECTRIC FLARE */}
        <div className="mt-2 text-center space-y-2 relative">
          
          {/* 3D Metallic Chrome Title */}
          <div
            ref={titleTextRef}
            className="opacity-0 scale-90 translate-y-4 font-orbitron font-black text-5xl sm:text-7xl md:text-8xl tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white via-[#7CE7FF] to-[#00D9FF] drop-shadow-[0_0_50px_rgba(0,217,255,1)] uppercase"
          >
            INFINIX&apos;26
          </div>

          {/* Electric Laser Beam */}
          <div
            ref={laserBeamRef}
            className="w-full max-w-md mx-auto h-[3px] bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent opacity-0 scale-x-0 origin-center blur-[0.5px] shadow-[0_0_30px_#00D9FF]"
          />

          {/* Motto & Detailed Institutional Subtitles */}
          <div
            ref={taglineRef}
            className="opacity-0 translate-y-3 space-y-1.5 pt-1"
          >
            <span className="font-orbitron font-black text-sm sm:text-xl tracking-[0.45em] text-[#7CE7FF] drop-shadow-[0_0_25px_rgba(0,217,255,1)] uppercase block">
              CREATE • INNOVATE • ELEVATE
            </span>
            <p className="text-[11px] sm:text-xs text-white font-mono tracking-[0.35em] uppercase font-extrabold">
              NATIONAL LEVEL 32-HOURS HACKATHON
            </p>
            <p className="text-[9px] sm:text-[10px] text-gray-300 font-mono tracking-[0.25em] uppercase font-semibold">
              RAMCO INSTITUTE OF TECHNOLOGY, RAJAPALAYAM, TAMIL NADU
            </p>
          </div>
        </div>

      </div>

      {/* BOTTOM STAGE: Electric Loading Line */}
      <div className="relative z-20 w-full max-w-xs sm:max-w-md mx-auto mb-14 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-gray-300 font-bold">
          <span className="uppercase text-[#00D9FF] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00D9FF] animate-ping" />
            LOADING 32-HOURS HACKATHON PORTAL
          </span>
          <span className="text-white font-black text-sm">{progress}%</span>
        </div>

        {/* Laser Progress Line */}
        <div className="w-full h-2 rounded-full bg-[#04162e] border border-[#00D9FF]/50 overflow-hidden relative shadow-[0_0_30px_rgba(0,217,255,0.6)]">
          <div
            ref={progressTrackRef}
            style={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-[#00D9FF] via-[#38bdf8] to-[#7CE7FF] shadow-[0_0_30px_#00D9FF] transition-all duration-75 ease-out rounded-full relative"
          >
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-white blur-[2px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
