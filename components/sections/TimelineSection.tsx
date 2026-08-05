'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  FileText,
  Rocket,
  Flag,
  Trophy,
  ArrowRight,
} from 'lucide-react';

const milestones = [
  {
    title: 'Registrations Open',
    date: '06 Aug 2026',
    icon: Calendar,
  },
  {
    title: 'Registration Deadline',
    date: '05 Sep 2026',
    icon: CheckCircle2,
  },
  {
    title: 'Problem Statements Reveal',
    date: '10 Sep 2026',
    icon: FileText,
  },
  {
    title: 'Hackathon Begins',
    date: '10 Sep 2026 10:00 AM',
    icon: Rocket,
  },
  {
    title: 'Hackathon Ends',
    date: '11 Sep 2026 10:00 AM',
    icon: Flag,
  },
  {
    title: 'Results Announcement',
    date: '11 Sep 2026 04:00 PM',
    icon: Trophy,
  },
];

export default function TimelineSection() {
  return (
    <section id="timeline" className="relative py-14 sm:py-16 px-6 max-w-7xl mx-auto z-10">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
        <div>
          <span className="text-xs font-bold tracking-[0.3em] text-[#00D9FF] uppercase mb-2 block">
            TIMELINE
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-orbitron tracking-tight uppercase text-white">
            OUR JOURNEY TO{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] to-[#7CE7FF]">
              INFINIX&apos;26
            </span>
          </h2>
        </div>

        <a
          href="#timeline"
          className="px-6 py-2.5 rounded-full glass-panel border border-[#00D9FF]/40 text-xs font-bold tracking-widest text-[#7CE7FF] hover:text-white hover:border-[#00D9FF] transition-all flex items-center gap-2 self-start md:self-auto"
          data-hoverable="true"
        >
          VIEW FULL SCHEDULE
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* Horizontal Glowing Timeline Pipeline */}
      <div className="relative mt-8 py-10 overflow-x-auto no-scrollbar">
        <div className="min-w-[900px] relative px-4">
          {/* Main Horizontal Pipeline Glow Bar */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#00D9FF]/30 via-[#00D9FF] to-[#00D9FF]/30 rounded-full shadow-[0_0_15px_#00D9FF] -translate-y-1/2 z-0" />

          {/* Milestone Nodes Stack */}
          <div className="relative z-10 grid grid-cols-6 gap-4">
            {milestones.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="flex flex-col items-center text-center group cursor-pointer"
                  data-hoverable="true"
                >
                  {/* Glowing Circle Icon Node */}
                  <div className="w-14 h-14 rounded-full bg-[#04162E] border-2 border-[#00D9FF] flex items-center justify-center text-[#00D9FF] group-hover:scale-115 group-hover:bg-[#00D9FF] group-hover:text-black group-hover:shadow-[0_0_25px_#00D9FF] transition-all duration-300 shadow-[0_0_15px_rgba(0,217,255,0.4)]">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Title & Date Details */}
                  <h3 className="mt-5 font-orbitron font-bold text-xs tracking-wider text-white group-hover:text-[#00D9FF] transition-colors leading-tight">
                    {item.title}
                  </h3>

                  <span className="mt-1 text-[11px] font-semibold text-[#7CE7FF]">
                    {item.date}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
