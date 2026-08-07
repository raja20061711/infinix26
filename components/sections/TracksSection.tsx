'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BrainCircuit,
  ShieldCheck,
  HeartPulse,
  Cloud,
  Coins,
  Lightbulb,
  Zap,
  Sparkles,
  Info,
  Wrench,
} from 'lucide-react';
import TiltCard from '../ui/TiltCard';

const coreThemes = [
  {
    id: 'smart-intelligence',
    title: 'Smart Intelligence',
    category: 'AI / ML',
    description: 'Build intelligent solutions using AI, ML, Computer Vision, and Generative AI.',
    icon: BrainCircuit,
  },
  {
    id: 'secure-computing',
    title: 'Secure Computing',
    category: 'Cybersecurity',
    description: 'Develop secure digital systems focusing on cyber defense, privacy, and threat detection.',
    icon: ShieldCheck,
  },
  {
    id: 'healthcare-biotech',
    title: 'Healthcare & MedTech',
    category: 'MedTech',
    description: 'Create innovative medical devices, diagnostics, and digital health tools.',
    icon: HeartPulse,
  },
  {
    id: 'cloud-devops',
    title: 'Cloud & DevOps',
    category: 'Cloud Infrastructure',
    description: 'Build scalable cloud-native apps with automation, containers, and CI/CD pipelines.',
    icon: Cloud,
  },
  {
    id: 'fintech',
    title: 'FinTech',
    category: 'FinTech',
    description: 'Design smart financial tools for banking, fraud detection, and digital payments.',
    icon: Coins,
  },
];

const openInnovationTracks = [
  {
    id: 'smart-automation',
    category: 'Mechanical & Civil',
    title: 'Smart Automation',
    description: 'Intelligent engineering solutions using Robotics, IoT, BIM, Drones, and Smart Infrastructure.',
    icon: Wrench,
  },
  {
    id: 'energy-smart-grid',
    category: 'EEE & ECE',
    title: 'Energy Innovation & Smart Grid',
    description: 'Innovative solutions for Smart Grids, Renewable Energy, Electric Mobility, and Power Electronics.',
    icon: Zap,
  },
];

export default function TracksSection() {
  return (
    <section id="tracks" className="relative py-12 sm:py-16 px-6 max-w-7xl mx-auto z-10">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00D9FF]/10 border border-[#00D9FF]/30 backdrop-blur-md mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00D9FF]" />
            <span className="text-xs font-bold tracking-[0.25em] text-[#00D9FF] uppercase">
              HACKATHON DOMAINS
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-orbitron tracking-tight uppercase text-white">
            EXPLORE.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] via-[#4CCFFF] to-[#7CE7FF]">
              DOMAINS.
            </span>
          </h2>
        </div>

        <Link
          href="/register"
          className="px-5 py-2.5 rounded-full glass-panel border border-[#00D9FF]/40 text-xs font-bold tracking-widest text-[#7CE7FF] hover:text-white hover:border-[#00D9FF] hover:shadow-[0_0_20px_rgba(0,217,255,0.4)] transition-all duration-300 inline-flex items-center gap-2 self-start md:self-auto"
          data-hoverable="true"
        >
          REGISTER NOW
        </Link>
      </div>

      {/* Core Themes Compact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {coreThemes.map((theme, idx) => {
          const Icon = theme.icon;

          return (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
            >
              <TiltCard className="h-full rounded-2xl">
                <div
                  className="relative h-full p-6 rounded-2xl bg-[#04162e]/60 backdrop-blur-xl border border-[#00D9FF]/20 hover:border-[#00D9FF]/60 shadow-[0_0_20px_rgba(0,217,255,0.06)] hover:shadow-[0_0_30px_rgba(0,217,255,0.25)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group overflow-hidden"
                  data-hoverable="true"
                >
                  <div className="sheen-line-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-[#00D9FF]/10 blur-xl group-hover:bg-[#00D9FF]/20 transition-all duration-500 pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-[#020d20] border border-[#00D9FF]/40 flex items-center justify-center text-[#00D9FF] group-hover:scale-105 group-hover:bg-[#00D9FF] group-hover:text-black transition-all duration-300">
                        <Icon className="w-5 h-5" />
                      </div>

                      <span className="font-orbitron font-extrabold text-[11px] tracking-widest text-[#00D9FF]/60 group-hover:text-[#00D9FF] transition-colors">
                        0{idx + 1}
                      </span>
                    </div>

                    <div className="mb-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase text-[#00D9FF] bg-[#00D9FF]/10 border border-[#00D9FF]/30">
                        {theme.category}
                      </span>
                    </div>

                    <h3 className="font-orbitron font-extrabold text-base sm:text-lg tracking-wide text-white group-hover:text-[#00D9FF] transition-colors leading-snug">
                      {theme.title}
                    </h3>

                    <p className="mt-2 text-xs text-gray-300 leading-relaxed font-sans">
                      {theme.description}
                    </p>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>

      {/* COMPACT FEATURED SECTION: OPEN INNOVATION */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl bg-[#020b18]/90 border border-[#00D9FF]/35 p-5 sm:p-7 shadow-[0_0_25px_rgba(0,217,255,0.12)] relative overflow-hidden backdrop-blur-2xl"
      >
        <div className="absolute top-0 right-0 w-60 h-60 bg-[#00D9FF]/10 blur-3xl rounded-full pointer-events-none" />

        {/* Section Header */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#00D9FF]/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#00D9FF]/15 border border-[#00D9FF]/40 text-[#00D9FF]">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black font-orbitron text-white uppercase tracking-wide">
                OPEN INNOVATION <span className="text-[#00D9FF]">TRACKS</span>
              </h3>
              <p className="text-[11px] text-gray-300 font-medium">
                Solve real-world engineering challenges through interdisciplinary collaboration.
              </p>
            </div>
          </div>
        </div>

        {/* 2 Compact Track Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {openInnovationTracks.map((track) => {
            const Icon = track.icon;

            return (
              <div
                key={track.id}
                className="rounded-xl bg-[#04162e]/70 border border-[#00D9FF]/30 p-4 sm:p-5 shadow-[0_0_15px_rgba(0,217,255,0.08)] hover:border-[#00D9FF] hover:shadow-[0_0_25px_rgba(0,217,255,0.2)] transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase text-[#00D9FF] bg-[#00D9FF]/10 border border-[#00D9FF]/30">
                    {track.category}
                  </span>

                  <div className="w-8 h-8 rounded-lg bg-[#00D9FF]/10 border border-[#00D9FF]/30 flex items-center justify-center text-[#00D9FF] group-hover:bg-[#00D9FF] group-hover:text-black transition-all">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h4 className="font-orbitron font-bold text-base text-white group-hover:text-[#00D9FF] transition-colors mb-1.5">
                  {track.title}
                </h4>

                <p className="text-xs text-gray-300 leading-relaxed">
                  {track.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* ⚠️ IMPORTANT NOTE — Glowing Highlighted Box */}
        <div
          className="relative rounded-2xl border-2 border-amber-400/70 bg-gradient-to-r from-amber-500/10 via-orange-500/8 to-amber-500/10 p-4 sm:p-5 flex items-start gap-4 backdrop-blur-xl overflow-hidden"
          style={{ boxShadow: '0 0 30px rgba(251,191,36,0.25), inset 0 0 30px rgba(251,191,36,0.05)' }}
        >
          {/* Ambient corner glow */}
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />

          {/* Icon with blinking ring */}
          <div className="relative flex-shrink-0 mt-0.5">
            <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-amber-400 opacity-20"></span>
            <div className="relative w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/70 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]">
              <Info className="w-4 h-4" />
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            {/* Title with blinking dot */}
            <h5 className="font-orbitron font-black text-sm text-amber-300 tracking-widest uppercase flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              </span>
              ⚠ Important Note
            </h5>

            <p className="text-amber-100/90 leading-relaxed font-medium">
              Participants must bring all required hardware, IoT modules, sensors, components, development boards, and cables.
            </p>

            <p className="text-white font-black tracking-wide uppercase text-[11px] bg-red-500/20 border border-red-400/50 rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5 w-fit"
              style={{ boxShadow: '0 0 10px rgba(248,113,113,0.3)' }}>
              🚫 The organizing committee will NOT provide hardware / electronic components.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}



