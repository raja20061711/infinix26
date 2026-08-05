'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Crown, ArrowRight, Award, Gift, Briefcase, Sparkles, ShieldCheck, Users, Medal, Shirt } from 'lucide-react';
import TiltCard from '../ui/TiltCard';

export default function PrizesSection() {
  return (
    <section id="prizes" className="relative py-14 sm:py-20 px-6 max-w-7xl mx-auto z-10">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 backdrop-blur-md mb-3 shadow-[0_0_15px_rgba(255,215,0,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-[#FFD700] animate-pulse" />
            <span className="text-xs font-bold tracking-[0.25em] text-[#FFD700] uppercase font-orbitron">
              TOTAL PRIZE POOL WORTH ₹15,000 + INTERNSHIPS + HOODIES
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
          className="px-6 py-3 rounded-full glass-panel border border-[#00D9FF]/40 text-xs font-bold font-orbitron tracking-widest text-[#7CE7FF] hover:text-white hover:border-[#00D9FF] hover:shadow-[0_0_20px_rgba(0,217,255,0.4)] transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
          data-hoverable="true"
        >
          VIEW ALL PERKS
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* 3 Podium Cards Layout with 3D Tilt */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto mb-16">
        {/* 1st Prize Elevated Card (Order 1 on mobile, Order 2 / Center on desktop) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="order-1 md:order-2 md:-translate-y-6"
        >
          <TiltCard className="rounded-3xl">
            <div
              className="glass-panel p-8 sm:p-10 rounded-3xl border-2 border-[#FFD700]/60 flex flex-col items-center text-center relative group shadow-gold-glow bg-gradient-to-b from-[#0a3560]/80 via-[#04162E]/95 to-[#020817] backdrop-blur-xl overflow-hidden"
              data-hoverable="true"
            >
              {/* Top Gold Halo Glow */}
              <div className="absolute -top-12 w-56 h-56 bg-[#FFD700]/25 rounded-full blur-3xl pointer-events-none" />

              {/* Champion Badge */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFD700] via-[#F5D033] to-[#B8860B] border-2 border-yellow-200 flex items-center justify-center font-orbitron font-black text-2xl text-black shadow-[0_0_25px_rgba(255,215,0,0.9)] mb-4">
                1
              </div>

              {/* 3D Glowing Crown Graphic */}
              <div className="relative my-2 flex items-center justify-center">
                <Crown className="w-20 h-20 text-[#FFD700] drop-shadow-[0_0_30px_rgba(255,215,0,0.95)] animate-float-slow" />
                <div className="absolute inset-0 bg-[#FFD700]/25 blur-2xl rounded-full pointer-events-none" />
              </div>

              <span className="text-xs font-extrabold font-orbitron tracking-widest text-[#FFD700] uppercase mt-2">
                FIRST PLACE CHAMPION
              </span>

              <h3 className="mt-2 font-orbitron font-black text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-[#FFF59D] via-[#FFD700] to-[#FFA000] drop-shadow-[0_0_20px_rgba(255,215,0,0.7)]">
                ₹10,000
              </h3>

              {/* Badges Stack */}
              <div className="mt-4 space-y-2 w-full flex flex-col items-center">
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[11px] font-bold font-orbitron flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.35)] w-full">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                  INTERNSHIP OPPORTUNITY
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/50 text-purple-200 text-[11px] font-bold font-orbitron flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.35)] w-full">
                  <Shirt className="w-3.5 h-3.5 text-purple-300" />
                  OFFICIAL INFINIX HOODIES
                </span>
                <span className="px-3 py-1 rounded-full bg-[#FFD700]/15 border border-[#FFD700]/30 text-[#FFD700] text-[10px] font-bold font-orbitron flex items-center justify-center gap-1.5 w-full">
                  <Award className="w-3.5 h-3.5" />
                  Winner Certificate + Exciting Prizes
                </span>
              </div>

              {/* Golden Base Pedestal */}
              <div className="mt-6 w-full py-2 rounded-full bg-gradient-to-r from-[#FFD700]/10 via-[#FFD700]/20 to-[#FFD700]/10 border border-[#FFD700]/40 text-[10px] font-extrabold font-orbitron tracking-[0.2em] text-[#FFD700] uppercase flex items-center justify-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-[#FFD700]" />
                GRAND CHAMPION WINNER
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* 2nd Prize Card (Order 2 on mobile, Order 1 / Left on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="order-2 md:order-1"
        >
          <TiltCard className="rounded-3xl">
            <div
              className="glass-panel glass-panel-hover p-8 rounded-3xl border border-[#00D9FF]/30 flex flex-col items-center text-center relative group bg-[#04162e]/80 backdrop-blur-xl"
              data-hoverable="true"
            >
              <div className="w-13 h-13 rounded-full bg-[#061e3d] border-2 border-[#00D9FF]/60 flex items-center justify-center font-orbitron font-black text-xl text-[#00D9FF] shadow-[0_0_15px_rgba(0,217,255,0.4)] mb-4">
                2
              </div>
              <span className="text-xs font-bold font-orbitron tracking-widest text-gray-300 uppercase">
                RUNNER UP (SECOND)
              </span>
              <h3 className="mt-3 font-orbitron font-black text-3xl sm:text-4xl text-white group-hover:text-[#00D9FF] transition-colors">
                ₹5,000
              </h3>

              <div className="mt-4 space-y-2 w-full flex flex-col items-center">
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[11px] font-bold font-orbitron flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.35)] w-full">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                  INTERNSHIP OPPORTUNITY
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/50 text-purple-200 text-[11px] font-bold font-orbitron flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.35)] w-full">
                  <Shirt className="w-3.5 h-3.5 text-purple-300" />
                  OFFICIAL INFINIX HOODIES
                </span>
                <span className="px-3 py-1 rounded-full bg-[#00D9FF]/15 border border-[#00D9FF]/30 text-[#7CE7FF] text-[10px] font-semibold font-orbitron flex items-center justify-center gap-1.5 w-full">
                  <Gift className="w-3.5 h-3.5" />
                  Winner Certificate + Exciting Prizes
                </span>
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* Rising Innovators & Top Performers Card (Order 3 on mobile, Order 3 / Right on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="order-3 md:order-3"
        >
          <TiltCard className="rounded-3xl">
            <div
              className="glass-panel glass-panel-hover p-8 rounded-3xl border border-purple-500/40 flex flex-col items-center text-center relative group bg-[#04162e]/80 backdrop-blur-xl"
              data-hoverable="true"
            >
              <div className="w-13 h-13 rounded-full bg-[#1c0c38] border-2 border-purple-400/60 flex items-center justify-center font-orbitron font-black text-xl text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)] mb-4">
                <Sparkles className="w-6 h-6 text-purple-300 animate-pulse" />
              </div>
              <span className="text-xs font-bold font-orbitron tracking-widest text-purple-300 uppercase">
                RISING INNOVATORS & TOP TALENTS
              </span>
              <h3 className="mt-3 font-orbitron font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-300 to-pink-300">
                INTERNSHIPS & PERKS
              </h3>

              <div className="mt-4 space-y-2 w-full flex flex-col items-center">
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[11px] font-bold font-orbitron flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.35)] w-full">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                  INTERNSHIP OFFERS
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-200 text-[10px] font-semibold font-orbitron flex items-center justify-center gap-1.5 w-full">
                  <Gift className="w-3.5 h-3.5" />
                  Exciting Prizes & Special Certificates
                </span>
              </div>
            </div>
          </TiltCard>
        </motion.div>
      </div>

      {/* FANCY EXCLUSIVE PERKS FOR ALL PARTICIPANTS SECTION */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#061c38]/90 via-[#041226]/95 to-[#020817] border border-[#00D9FF]/30 backdrop-blur-2xl relative overflow-hidden shadow-[0_0_50px_rgba(0,217,255,0.15)]">
        {/* Ambient Cyan Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00D9FF]/10 blur-3xl rounded-full pointer-events-none" />

        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-[#00D9FF] text-[11px] font-orbitron font-extrabold tracking-widest uppercase mb-3 shadow-[0_0_15px_rgba(0,217,255,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-[#00D9FF]" />
            <span>EVERY PARTICIPANT WINS</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black font-orbitron text-white uppercase tracking-tight">
            EXCLUSIVE PERKS FOR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] via-[#7CE7FF] to-[#4CCFFF]">ALL PARTICIPANTS</span>
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 mt-2.5 leading-relaxed font-medium">
            1st & 2nd place teams win <span className="text-[#FFD700] font-bold">₹10,000 & ₹5,000 Cash Prizes</span>, <span className="text-emerald-400 font-bold">Internship Offers</span> and <span className="text-purple-300 font-bold">Official INFINIX Hoodies</span>! Plus, top performing teams receive internship offers & official event swags!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
          {/* Feature Card 1: Direct Internship Offers */}
          <div className="p-6 rounded-2xl bg-[#020a16]/90 border border-emerald-500/35 hover:border-emerald-400 transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] group flex flex-col items-center text-center">
            <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-3.5 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Briefcase className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-extrabold font-orbitron text-white group-hover:text-emerald-400 transition-colors tracking-wide">
              DIRECT INTERNSHIPS
            </h4>
            <p className="text-[11px] text-gray-300 mt-2 leading-relaxed font-medium">
              Direct Internship Offers awarded to <span className="text-emerald-300 font-bold">1st & 2nd Place Teams & Top Performing Innovators</span>!
            </p>
          </div>

          {/* Feature Card 2: Official Hoodies & Swags */}
          <div className="p-6 rounded-2xl bg-[#020a16]/90 border border-purple-500/35 hover:border-purple-400 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.25)] group flex flex-col items-center text-center">
            <div className="w-13 h-13 rounded-2xl bg-purple-500/15 border border-purple-400/40 flex items-center justify-center text-purple-300 mb-3.5 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Shirt className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-extrabold font-orbitron text-white group-hover:text-purple-300 transition-colors tracking-wide">
              OFFICIAL HOODIES & SWAG
            </h4>
            <p className="text-[11px] text-gray-300 mt-2 leading-relaxed font-medium">
              Official INFINIX Hoodies for <span className="text-purple-300 font-bold">1st & 2nd Place Winners</span> + Participant Swag Kits for all registered members!
            </p>
          </div>

          {/* Feature Card 3: National Certificates */}
          <div className="p-6 rounded-2xl bg-[#020a16]/90 border border-[#00D9FF]/35 hover:border-[#00D9FF] transition-all hover:shadow-[0_0_30px_rgba(0,217,255,0.25)] group flex flex-col items-center text-center">
            <div className="w-13 h-13 rounded-2xl bg-[#00D9FF]/15 border border-[#00D9FF]/40 flex items-center justify-center text-[#00D9FF] mb-3.5 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,217,255,0.2)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-extrabold font-orbitron text-white group-hover:text-[#00D9FF] transition-colors tracking-wide">
              NATIONAL CERTIFICATES
            </h4>
            <p className="text-[11px] text-gray-300 mt-2 leading-relaxed font-medium">
              Official Hardcopy & Verified Digital <span className="text-[#7CE7FF] font-bold">Certificates of Participation</span> for ALL registered members!
            </p>
          </div>

          {/* Feature Card 4: Mentorship & Networking */}
          <div className="p-6 rounded-2xl bg-[#020a16]/90 border border-blue-500/35 hover:border-blue-400 transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.25)] group flex flex-col items-center text-center">
            <div className="w-13 h-13 rounded-2xl bg-blue-500/15 border border-blue-400/40 flex items-center justify-center text-blue-400 mb-3.5 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-extrabold font-orbitron text-white group-hover:text-blue-400 transition-colors tracking-wide">
              EXPERT MENTORSHIP
            </h4>
            <p className="text-[11px] text-gray-300 mt-2 leading-relaxed font-medium">
              1-on-1 Mentorship from Industry Veterans, Academic Experts & Tech Leaders during the 32-hour hackathon.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
