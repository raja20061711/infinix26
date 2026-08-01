'use client';

import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { Crown, GraduationCap, Award } from 'lucide-react';
import OceanVideoCanvas from '@/components/video/OceanVideoCanvas';
import Navbar from '@/components/Navbar';
import SocialSidebar from '@/components/SocialSidebar';
import TeamSwitcher from '@/components/team/TeamSwitcher';
import Footer from '@/components/Footer';
import MoanaChatbot from '@/components/MoanaChatbot';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LeadershipPage() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-[#01040d] text-white overflow-x-hidden selection:bg-[#00D9FF] selection:text-black pt-24 pb-12">
      <OceanVideoCanvas />
      <Navbar />
      <SocialSidebar />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <TeamSwitcher />

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-bold tracking-[0.3em] text-[#00D9FF] uppercase mb-2 block">
            ORGANIZING COMMITTEE
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-orbitron tracking-tight uppercase text-white">
            LEADERSHIP{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] to-[#7CE7FF]">
              TEAM
            </span>
          </h1>
          <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_10px_#00D9FF] rounded-full mx-auto mt-3 mb-2" />
          <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto tracking-wide">
            Chief Patron, Patron & Event Convener of INFINIX&apos;26
          </p>
        </motion.div>

        {/* Cards Stack */}
        <div className="flex flex-col gap-10">
          {/* CHIEF PATRON */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col items-center mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-[#00D9FF]" />
                <span className="text-xs font-bold tracking-[0.25em] text-[#00D9FF] uppercase">
                  CHIEF PATRON
                </span>
              </div>
              <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_8px_#00D9FF] rounded-full mt-1" />
            </div>

            <div className="w-full rounded-2xl bg-gradient-to-r from-[#04162E]/90 via-[#0a2744]/90 to-[#04162E]/90 border border-[#00D9FF]/50 p-8 sm:p-10 text-center shadow-[0_0_25px_rgba(0,217,255,0.25)] hover:border-[#00D9FF] hover:shadow-[0_0_35px_rgba(0,217,255,0.4)] transition-all duration-300 backdrop-blur-xl hover:-translate-y-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-orbitron text-white tracking-wide mb-2">
                Dr. L. Ganesan
              </h2>
              <p className="text-sm sm:text-base font-semibold text-[#00D9FF] tracking-wider uppercase">
                Director
              </p>
            </div>
          </motion.div>

          {/* PATRON */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex flex-col items-center mb-4">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-4 h-4 text-[#00D9FF]" />
                <span className="text-xs font-bold tracking-[0.25em] text-[#00D9FF] uppercase">
                  PATRON
                </span>
              </div>
              <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_8px_#00D9FF] rounded-full mt-1" />
            </div>

            <div className="w-full rounded-2xl bg-gradient-to-r from-[#04162E]/90 via-[#0a2744]/90 to-[#04162E]/90 border border-[#00D9FF]/40 p-8 sm:p-10 text-center shadow-[0_0_20px_rgba(0,217,255,0.2)] hover:border-[#00D9FF] hover:shadow-[0_0_30px_rgba(0,217,255,0.35)] transition-all duration-300 backdrop-blur-xl hover:-translate-y-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-orbitron text-white tracking-wide mb-2">
                Dr. S. Rajakarunakaran
              </h2>
              <p className="text-sm sm:text-base font-semibold text-[#00D9FF] tracking-wider uppercase">
                Principal
              </p>
            </div>
          </motion.div>

          {/* EVENT CONVENER */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex flex-col items-center mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-[#00D9FF]" />
                <span className="text-xs font-bold tracking-[0.25em] text-[#00D9FF] uppercase">
                  EVENT CONVENER
                </span>
              </div>
              <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_8px_#00D9FF] rounded-full mt-1" />
            </div>

            <div className="w-full rounded-2xl bg-gradient-to-r from-[#04162E]/90 via-[#0a2744]/90 to-[#04162E]/90 border border-[#00D9FF]/40 p-8 sm:p-10 text-center shadow-[0_0_20px_rgba(0,217,255,0.2)] hover:border-[#00D9FF] hover:shadow-[0_0_30px_rgba(0,217,255,0.35)] transition-all duration-300 backdrop-blur-xl hover:-translate-y-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-orbitron text-white tracking-wide mb-2">
                Dr. E. Mariappan
              </h2>
              <p className="text-sm sm:text-base font-semibold text-[#00D9FF] tracking-wider uppercase mb-1">
                Professor and Head
              </p>
              <p className="text-xs sm:text-sm text-gray-400 font-medium">
                Department of Information Technology
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <MoanaChatbot />
      <Footer />
    </main>
  );
}
