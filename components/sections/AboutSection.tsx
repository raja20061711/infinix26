'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, Users2, Trophy, Layers } from 'lucide-react';

const featureCards = [
  {
    icon: Code2,
    title: '32',
    subtitle: 'HOURS',
    description: 'Code, collaborate, and innovate continuously for 32 hours.',
  },
  {
    icon: Users2,
    title: 'REAL-WORLD',
    subtitle: 'CHALLENGES',
    description: 'Solve meaningful industry-inspired problems through innovation.',
  },
  {
    icon: Trophy,
    title: 'EXPERT',
    subtitle: 'MENTORSHIP',
    description: 'Learn from experienced faculty mentors and industry professionals.',
  },
  {
    icon: Layers,
    title: 'MULTIPLE',
    subtitle: 'DOMAINS',
    description: 'Explore diverse technology domains and build impactful solutions.',
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="relative py-14 sm:py-16 px-6 max-w-7xl mx-auto z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Heading & Narrative */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-6 flex flex-col items-start"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00D9FF]/10 border border-[#00D9FF]/30 backdrop-blur-md mb-3">
            <span className="text-xs font-bold tracking-[0.25em] text-[#00D9FF] uppercase font-orbitron">
              ABOUT THE HACKATHON
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-orbitron tracking-tight leading-tight uppercase text-white">
            DIVE INTO INNOVATION.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] via-[#7CE7FF] to-[#4CCFFF]">
              BUILD THE FUTURE.
            </span>
          </h2>

          <p className="mt-5 text-sm sm:text-base text-gray-300 leading-relaxed font-sans font-medium">
            INFINIX&apos;26 is a 32-Hours National Level Hackathon organized by the Department of Information Technology, Ramco Institute of Technology, in association with the IE(I)-IT Student Chapter. It brings together passionate innovators to collaborate, solve real-world challenges, and transform creative ideas into impactful technological solutions.
          </p>

          <a
            href="#tracks"
            className="mt-7 px-7 py-3 rounded-full glass-panel border border-[#00D9FF]/40 text-xs font-bold tracking-widest text-[#7CE7FF] hover:text-white hover:border-[#00D9FF] hover:shadow-[0_0_25px_#00D9FF] transition-all duration-300 flex items-center gap-2.5"
            data-hoverable="true"
          >
            EXPLORE DOMAINS
            <ArrowRight className="w-4 h-4 text-[#00D9FF]" />
          </a>
        </motion.div>

        {/* Right Column: 4 Feature Glass Cards Grid */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5"
        >
          {featureCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="glass-panel glass-panel-hover p-6 sm:p-7 rounded-3xl flex flex-col items-center text-center border border-[#00D9FF]/25 group bg-[#04162E]/60 backdrop-blur-2xl"
                data-hoverable="true"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#00D9FF]/10 border border-[#00D9FF]/30 flex items-center justify-center text-[#00D9FF] group-hover:scale-110 group-hover:bg-[#00D9FF] group-hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(0,217,255,0.3)]">
                  <Icon className="w-6 h-6" />
                </div>

                <span className="mt-5 font-orbitron font-extrabold text-xl sm:text-2xl text-white group-hover:text-[#00D9FF] transition-colors leading-tight">
                  {card.title}
                </span>

                <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#7CE7FF] uppercase mt-1">
                  {card.subtitle}
                </span>

                <p className="text-[11px] sm:text-xs text-gray-300 mt-2.5 leading-relaxed">
                  {card.description}
                </p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
