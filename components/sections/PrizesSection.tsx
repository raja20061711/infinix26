'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowRight, Award, Gift } from 'lucide-react';
import TiltCard from '../ui/TiltCard';

export default function PrizesSection() {
  return (
    <section id="prizes" className="relative py-14 sm:py-16 px-6 max-w-7xl mx-auto z-10">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 backdrop-blur-md mb-3">
            <span className="text-xs font-bold tracking-[0.25em] text-[#FFD700] uppercase">
              TOTAL PRIZE POOL WORTH ₹30,000
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-orbitron tracking-tight uppercase text-white">
            REWARDS THAT{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] via-[#7CE7FF] to-[#4CCFFF]">
              INSPIRE GREATNESS
            </span>
          </h2>
        </div>

        <a
          href="#prizes"
          className="px-6 py-2.5 rounded-full glass-panel border border-[#00D9FF]/40 text-xs font-bold tracking-widest text-[#7CE7FF] hover:text-white hover:border-[#00D9FF] transition-all flex items-center gap-2 self-start md:self-auto"
          data-hoverable="true"
        >
          VIEW ALL REWARDS
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* 3 Podium Cards Layout with 3D Tilt */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto">
        {/* 2nd Prize Card (Left) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <TiltCard className="rounded-3xl">
            <div
              className="glass-panel glass-panel-hover p-8 rounded-3xl border border-[#00D9FF]/20 flex flex-col items-center text-center relative group"
              data-hoverable="true"
            >
              <div className="w-12 h-12 rounded-full bg-[#04162E] border border-[#00D9FF]/40 flex items-center justify-center font-orbitron font-extrabold text-xl text-[#00D9FF] mb-4">
                2
              </div>
              <span className="text-xs font-bold tracking-widest text-gray-300 uppercase">
                SECOND PRIZE
              </span>
              <h3 className="mt-4 font-orbitron font-extrabold text-3xl sm:text-4xl text-white group-hover:text-[#00D9FF] transition-colors">
                ₹10,000
              </h3>
              <p className="mt-2 text-xs font-semibold text-[#7CE7FF] flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5" />
                Cash Prize + Goodies
              </p>
            </div>
          </TiltCard>
        </motion.div>

        {/* 1st Prize Elevated Podium Center Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="-translate-y-4"
        >
          <TiltCard className="rounded-3xl">
            <div
              className="glass-panel p-10 rounded-3xl border-2 border-[#FFD700]/50 flex flex-col items-center text-center relative group shadow-gold-glow bg-gradient-to-b from-[#062848]/70 via-[#04162E]/90 to-[#020817]"
              data-hoverable="true"
            >
              {/* Top Gold Halo Glow */}
              <div className="absolute -top-12 w-48 h-48 bg-[#FFD700]/20 rounded-full blur-3xl pointer-events-none" />

              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FFD700] to-[#B8860B] border-2 border-yellow-200 flex items-center justify-center font-orbitron font-black text-2xl text-black shadow-[0_0_20px_rgba(255,215,0,0.8)] mb-4">
                1
              </div>

              {/* 3D Glowing Trophy Graphic */}
              <div className="relative my-3 flex items-center justify-center">
                <Trophy className="w-20 h-20 text-[#FFD700] drop-shadow-[0_0_25px_rgba(255,215,0,0.9)] animate-float-slow" />
                <div className="absolute inset-0 bg-[#FFD700]/20 blur-xl rounded-full" />
              </div>

              <span className="text-xs font-bold tracking-widest text-[#FFD700] uppercase mt-2">
                FIRST PRIZE
              </span>

              <h3 className="mt-3 font-orbitron font-black text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-[#FFF59D] via-[#FFD700] to-[#FFA000] drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]">
                ₹15,000
              </h3>

              <p className="mt-2 text-xs font-semibold text-[#FFD700] flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                Cash Prize + Goodies
              </p>

              {/* Golden Glass Base Pedestal */}
              <div className="mt-6 w-full py-1.5 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[10px] font-bold tracking-[0.2em] text-[#FFD700] uppercase">
                CHAMPIONS PEDESTAL
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* 3rd Prize Card (Right) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <TiltCard className="rounded-3xl">
            <div
              className="glass-panel glass-panel-hover p-8 rounded-3xl border border-[#00D9FF]/20 flex flex-col items-center text-center relative group"
              data-hoverable="true"
            >
              <div className="w-12 h-12 rounded-full bg-[#04162E] border border-[#00D9FF]/40 flex items-center justify-center font-orbitron font-extrabold text-xl text-[#00D9FF] mb-4">
                3
              </div>
              <span className="text-xs font-bold tracking-widest text-gray-300 uppercase">
                THIRD PRIZE
              </span>
              <h3 className="mt-4 font-orbitron font-extrabold text-3xl sm:text-4xl text-white group-hover:text-[#00D9FF] transition-colors">
                ₹5,000
              </h3>
              <p className="mt-2 text-xs font-semibold text-[#7CE7FF] flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5" />
                Cash Prize + Goodies
              </p>
            </div>
          </TiltCard>
        </motion.div>
      </div>
    </section>
  );
}
