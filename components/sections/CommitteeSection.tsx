'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Crown, GraduationCap, Award, Users, Globe, BookOpen, UserCheck, Wrench } from 'lucide-react';

export default function CommitteeSection() {
  return (
    <section id="committee" className="relative py-12 sm:py-16 px-6 max-w-7xl mx-auto z-10">
      {/* Main Page Title Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#04162E]/80 border border-[#00D9FF]/30 text-[11px] font-bold tracking-[0.25em] text-[#00D9FF] uppercase shadow-[0_0_15px_rgba(0,217,255,0.2)] mb-3">
          <span>RAMCO INSTITUTE OF TECHNOLOGY (AUTONOMOUS)</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-orbitron tracking-tight uppercase text-white">
          ORGANIZING{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] to-[#7CE7FF]">
            COMMITTEE
          </span>
        </h2>
        <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_10px_#00D9FF] rounded-full mx-auto mt-3 mb-2" />
        <p className="text-xs sm:text-sm text-gray-400 max-w-2xl mx-auto tracking-wide">
          Leadership & Event Execution Committee Behind INFINIX&apos;26 National Level Hackathon
        </p>
      </motion.div>

      <div className="flex flex-col gap-14 max-w-5xl mx-auto">
        {/* EXECUTIVE LEADERSHIP TIER (Chief Patron, Patron, Convener) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.25em] text-[#00D9FF] uppercase">
              <Crown className="w-4 h-4 text-[#00D9FF]" />
              <span>EXECUTIVE LEADERSHIP</span>
            </div>
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_8px_#00D9FF] rounded-full mt-1.5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* CHIEF PATRON */}
            <div className="relative group rounded-2xl bg-[#030d1d]/80 border border-[#00D9FF]/35 p-6 text-center shadow-[0_0_15px_rgba(0,217,255,0.12)] hover:border-[#00D9FF] hover:shadow-[0_0_25px_rgba(0,217,255,0.25)] hover:-translate-y-1 transition-all duration-300 backdrop-blur-2xl overflow-hidden flex flex-col justify-center items-center min-h-[140px]">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent opacity-80" />
              
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-[9px] font-extrabold tracking-[0.2em] text-[#00D9FF] uppercase mb-2">
                <Crown className="w-2.5 h-2.5 text-[#00D9FF]" />
                <span>CHIEF PATRON</span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold font-orbitron text-white tracking-wide mb-1 group-hover:text-[#00D9FF] transition-colors">
                Dr. L. Ganesan
              </h3>
              <p className="text-xs font-semibold text-[#00D9FF] tracking-wider uppercase">
                Director
              </p>
            </div>

            {/* PATRON */}
            <div className="relative group rounded-2xl bg-[#030d1d]/80 border border-[#00D9FF]/25 p-6 text-center shadow-[0_0_15px_rgba(0,217,255,0.12)] hover:border-[#00D9FF] hover:shadow-[0_0_25px_rgba(0,217,255,0.25)] hover:-translate-y-1 transition-all duration-300 backdrop-blur-2xl overflow-hidden flex flex-col justify-center items-center min-h-[140px]">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00D9FF]/70 to-transparent opacity-60" />

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-[9px] font-extrabold tracking-[0.2em] text-[#00D9FF] uppercase mb-2">
                <GraduationCap className="w-2.5 h-2.5 text-[#00D9FF]" />
                <span>PATRON</span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold font-orbitron text-white tracking-wide mb-1 group-hover:text-[#00D9FF] transition-colors">
                Dr. S. Rajakarunakaran
              </h3>
              <p className="text-xs font-semibold text-[#00D9FF] tracking-wider uppercase">
                Principal
              </p>
            </div>

            {/* EVENT CONVENER */}
            <div className="relative group rounded-2xl bg-[#030d1d]/80 border border-[#00D9FF]/25 p-6 text-center shadow-[0_0_15px_rgba(0,217,255,0.12)] hover:border-[#00D9FF] hover:shadow-[0_0_25px_rgba(0,217,255,0.25)] hover:-translate-y-1 transition-all duration-300 backdrop-blur-2xl overflow-hidden flex flex-col justify-center items-center min-h-[140px]">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00D9FF]/70 to-transparent opacity-60" />

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-[9px] font-extrabold tracking-[0.2em] text-[#00D9FF] uppercase mb-2">
                <Award className="w-2.5 h-2.5 text-[#00D9FF]" />
                <span>EVENT CONVENER</span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold font-orbitron text-white tracking-wide mb-1 group-hover:text-[#00D9FF] transition-colors">
                Dr. E. Mariappan
              </h3>
              <p className="text-xs font-semibold text-[#00D9FF] tracking-wider uppercase mb-0.5">
                Professor and Head
              </p>
              <p className="text-[11px] text-gray-400 font-medium">
                Department of Information Technology
              </p>
            </div>
          </div>
        </motion.div>

        {/* FACULTY COORDINATORS TIER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.25em] text-[#00D9FF] uppercase">
              <Users className="w-4 h-4 text-[#00D9FF]" />
              <span>FACULTY COORDINATORS</span>
            </div>
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_8px_#00D9FF] rounded-full mt-1.5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="group rounded-2xl bg-[#030d1d]/70 border border-white/10 p-6 text-center shadow-[0_0_12px_rgba(0,217,255,0.08)] hover:border-[#00D9FF]/50 hover:shadow-[0_0_20px_rgba(0,217,255,0.2)] hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl">
              <h4 className="text-lg sm:text-xl font-bold font-orbitron text-white tracking-wide mb-1 group-hover:text-[#00D9FF] transition-colors">
                Mrs. M. Rethina Kumari
              </h4>
              <p className="text-xs font-semibold text-[#00D9FF] uppercase tracking-wider">
                Assistant Professor
              </p>
            </div>

            <div className="group rounded-2xl bg-[#030d1d]/70 border border-white/10 p-6 text-center shadow-[0_0_12px_rgba(0,217,255,0.08)] hover:border-[#00D9FF]/50 hover:shadow-[0_0_20px_rgba(0,217,255,0.2)] hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl">
              <h4 className="text-lg sm:text-xl font-bold font-orbitron text-white tracking-wide mb-1 group-hover:text-[#00D9FF] transition-colors">
                Mrs. A. Alagulakshmi
              </h4>
              <p className="text-xs font-semibold text-[#00D9FF] uppercase tracking-wider">
                Assistant Professor
              </p>
            </div>
          </div>
        </motion.div>

        {/* DEPARTMENT IE(I) COORDINATOR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.25em] text-[#00D9FF] uppercase">
              <Globe className="w-4 h-4 text-[#00D9FF]" />
              <span>DEPARTMENT IE(I) CHAPTER COORDINATOR</span>
            </div>
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_8px_#00D9FF] rounded-full mt-1.5" />
          </div>

          <div className="max-w-xl mx-auto w-full group rounded-2xl bg-[#030d1d]/70 border border-white/10 p-6 text-center shadow-[0_0_12px_rgba(0,217,255,0.08)] hover:border-[#00D9FF]/50 hover:shadow-[0_0_20px_rgba(0,217,255,0.2)] hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl">
            <h4 className="text-lg sm:text-xl font-bold font-orbitron text-white tracking-wide mb-1 group-hover:text-[#00D9FF] transition-colors">
              Dr. G. Mareeswari
            </h4>
            <p className="text-xs font-semibold text-[#00D9FF] uppercase tracking-wider">
              Assistant Professor
            </p>
          </div>
        </motion.div>

        {/* EVENT FACULTY INCHARGES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.25em] text-[#00D9FF] uppercase">
              <BookOpen className="w-4 h-4 text-[#00D9FF]" />
              <span>EVENT FACULTY INCHARGES</span>
            </div>
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_8px_#00D9FF] rounded-full mt-1.5" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="group rounded-xl bg-[#030d1d]/60 border border-white/10 border-l-2 border-l-[#00D9FF] p-5 text-left shadow-[0_0_10px_rgba(0,217,255,0.05)] hover:border-[#00D9FF]/40 hover:bg-[#04162e]/70 hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl flex flex-col justify-center min-h-[90px]">
              <h5 className="text-base font-bold font-orbitron text-white tracking-wide mb-1 group-hover:text-[#00D9FF] transition-colors">
                Dr. K. Palraj
              </h5>
              <p className="text-xs font-medium text-[#00D9FF] uppercase tracking-wider">
                Associate Professor
              </p>
            </div>

            <div className="group rounded-xl bg-[#030d1d]/60 border border-white/10 border-l-2 border-l-[#00D9FF] p-5 text-left shadow-[0_0_10px_rgba(0,217,255,0.05)] hover:border-[#00D9FF]/40 hover:bg-[#04162e]/70 hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl flex flex-col justify-center min-h-[90px]">
              <h5 className="text-base font-bold font-orbitron text-white tracking-wide mb-1 group-hover:text-[#00D9FF] transition-colors">
                Mr. S. Sakkaravarthi
              </h5>
              <p className="text-xs font-medium text-[#00D9FF] uppercase tracking-wider">
                Assistant Professor
              </p>
            </div>

            <div className="group rounded-xl bg-[#030d1d]/60 border border-white/10 border-l-2 border-l-[#00D9FF] p-5 text-left shadow-[0_0_10px_rgba(0,217,255,0.05)] hover:border-[#00D9FF]/40 hover:bg-[#04162e]/70 hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl flex flex-col justify-center min-h-[90px]">
              <h5 className="text-base font-bold font-orbitron text-white tracking-wide mb-1 group-hover:text-[#00D9FF] transition-colors">
                Mrs. G. Sivasathiya
              </h5>
              <p className="text-xs font-medium text-[#00D9FF] uppercase tracking-wider">
                Assistant Professor
              </p>
            </div>

            <div className="group rounded-xl bg-[#030d1d]/60 border border-white/10 border-l-2 border-l-[#00D9FF] p-5 text-left shadow-[0_0_10px_rgba(0,217,255,0.05)] hover:border-[#00D9FF]/40 hover:bg-[#04162e]/70 hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl flex flex-col justify-center min-h-[90px]">
              <h5 className="text-base font-bold font-orbitron text-white tracking-wide mb-1 group-hover:text-[#00D9FF] transition-colors">
                Mrs. B. Thevahi
              </h5>
              <p className="text-xs font-medium text-[#00D9FF] uppercase tracking-wider">
                Assistant Professor – I
              </p>
            </div>

            <div className="group rounded-xl bg-[#030d1d]/60 border border-white/10 border-l-2 border-l-[#00D9FF] p-5 text-left shadow-[0_0_10px_rgba(0,217,255,0.05)] hover:border-[#00D9FF]/40 hover:bg-[#04162e]/70 hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl flex flex-col justify-center min-h-[90px]">
              <h5 className="text-base font-bold font-orbitron text-white tracking-wide mb-1 group-hover:text-[#00D9FF] transition-colors">
                Mrs. P. Ramya
              </h5>
              <p className="text-xs font-medium text-[#00D9FF] uppercase tracking-wider">
                Assistant Professor – I
              </p>
            </div>
          </div>
        </motion.div>

        {/* STUDENT COORDINATORS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.25em] text-[#00D9FF] uppercase">
              <UserCheck className="w-4 h-4 text-[#00D9FF]" />
              <span>STUDENT COORDINATORS</span>
            </div>
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_8px_#00D9FF] rounded-full mt-1.5" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="group rounded-xl bg-[#030d1d]/60 border border-white/10 p-5 text-center shadow-[0_0_10px_rgba(0,217,255,0.05)] hover:border-[#00D9FF]/40 hover:bg-[#04162e]/70 hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl flex flex-col justify-center items-center min-h-[100px]">
              <h5 className="text-base font-bold font-orbitron text-white tracking-wide mb-1 group-hover:text-[#00D9FF] transition-colors">
                Saravanakumar V
              </h5>
              <p className="text-[11px] font-semibold text-gray-300">
                IV Year B.Tech Information Technology
              </p>
            </div>

            <div className="group rounded-xl bg-[#030d1d]/60 border border-white/10 p-5 text-center shadow-[0_0_10px_rgba(0,217,255,0.05)] hover:border-[#00D9FF]/40 hover:bg-[#04162e]/70 hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl flex flex-col justify-center items-center min-h-[100px]">
              <h5 className="text-base font-bold font-orbitron text-white tracking-wide mb-1 group-hover:text-[#00D9FF] transition-colors">
                Suresh R
              </h5>
              <p className="text-[11px] font-semibold text-gray-300">
                III Year B.Tech Information Technology
              </p>
            </div>

            <div className="group rounded-xl bg-[#030d1d]/60 border border-white/10 p-5 text-center shadow-[0_0_10px_rgba(0,217,255,0.05)] hover:border-[#00D9FF]/40 hover:bg-[#04162e]/70 hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl flex flex-col justify-center items-center min-h-[100px]">
              <h5 className="text-base font-bold font-orbitron text-white tracking-wide mb-1 group-hover:text-[#00D9FF] transition-colors">
                Saranya S
              </h5>
              <p className="text-[11px] font-semibold text-gray-300">
                III Year B.Tech Information Technology
              </p>
            </div>

            <div className="group rounded-xl bg-[#030d1d]/60 border border-white/10 p-5 text-center shadow-[0_0_10px_rgba(0,217,255,0.05)] hover:border-[#00D9FF]/40 hover:bg-[#04162e]/70 hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl flex flex-col justify-center items-center min-h-[100px]">
              <h5 className="text-base font-bold font-orbitron text-white tracking-wide mb-1 group-hover:text-[#00D9FF] transition-colors">
                Krishnithi S
              </h5>
              <p className="text-[11px] font-semibold text-gray-300">
                II Year B.Tech Information Technology
              </p>
            </div>
          </div>
        </motion.div>

        {/* TECHNICAL SUPPORT STAFF */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.25em] text-[#00D9FF] uppercase">
              <Wrench className="w-4 h-4 text-[#00D9FF]" />
              <span>TECHNICAL SUPPORT STAFF</span>
            </div>
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_8px_#00D9FF] rounded-full mt-1.5" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto w-full">
            <div className="group rounded-2xl bg-[#030d1d]/70 border border-white/10 p-6 text-center shadow-[0_0_12px_rgba(0,217,255,0.08)] hover:border-[#00D9FF]/50 hover:shadow-[0_0_20px_rgba(0,217,255,0.2)] hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl">
              <h4 className="text-lg sm:text-xl font-bold font-orbitron text-white tracking-wide mb-1 group-hover:text-[#00D9FF] transition-colors">
                Mr. M. Saravanakumar
              </h4>
              <p className="text-xs font-semibold text-[#00D9FF] uppercase tracking-wider">
                Lab Technician
              </p>
            </div>

            <div className="group rounded-2xl bg-[#030d1d]/70 border border-white/10 p-6 text-center shadow-[0_0_12px_rgba(0,217,255,0.08)] hover:border-[#00D9FF]/50 hover:shadow-[0_0_20px_rgba(0,217,255,0.2)] hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl">
              <h4 className="text-lg sm:text-xl font-bold font-orbitron text-white tracking-wide mb-1 group-hover:text-[#00D9FF] transition-colors">
                Mr. M. Sathish
              </h4>
              <p className="text-xs font-semibold text-[#00D9FF] uppercase tracking-wider">
                Lab Technician
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

