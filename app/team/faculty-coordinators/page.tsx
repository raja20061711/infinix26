'use client';

import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { Users, Globe } from 'lucide-react';
import OceanVideoCanvas from '@/components/video/OceanVideoCanvas';
import Navbar from '@/components/Navbar';
import SocialSidebar from '@/components/SocialSidebar';
import TeamSwitcher from '@/components/team/TeamSwitcher';
import Footer from '@/components/Footer';
import MoanaChatbot from '@/components/MoanaChatbot';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function FacultyCoordinatorsPage() {
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

        {/* Page Title Header */}
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
            FACULTY{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] to-[#7CE7FF]">
              COORDINATORS
            </span>
          </h1>
          <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_10px_#00D9FF] rounded-full mx-auto mt-3 mb-2" />
          <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto tracking-wide">
            Faculty Coordinators & Department IE(I) Coordinator
          </p>
        </motion.div>

        <div className="flex flex-col gap-12">
          {/* FACULTY COORDINATORS */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col items-center mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-[#00D9FF]" />
                <span className="text-xs font-bold tracking-[0.25em] text-[#00D9FF] uppercase">
                  FACULTY COORDINATORS
                </span>
              </div>
              <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_8px_#00D9FF] rounded-full mt-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl glass-panel border border-[#00D9FF]/30 bg-[#04162E]/70 p-8 text-center shadow-[0_0_20px_rgba(0,217,255,0.18)] hover:border-[#00D9FF] hover:shadow-[0_0_30px_rgba(0,217,255,0.3)] hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl">
                <h3 className="text-xl sm:text-2xl font-bold font-orbitron text-white tracking-wide mb-2">
                  Mrs. M. Rethina Kumari
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-[#00D9FF] uppercase tracking-wider">
                  Assistant Professor
                </p>
              </div>

              <div className="rounded-2xl glass-panel border border-[#00D9FF]/30 bg-[#04162E]/70 p-8 text-center shadow-[0_0_20px_rgba(0,217,255,0.18)] hover:border-[#00D9FF] hover:shadow-[0_0_30px_rgba(0,217,255,0.3)] hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl">
                <h3 className="text-xl sm:text-2xl font-bold font-orbitron text-white tracking-wide mb-2">
                  Mrs. A. Alagulakshmi
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-[#00D9FF] uppercase tracking-wider">
                  Assistant Professor
                </p>
              </div>
            </div>
          </motion.div>

          {/* DEPARTMENT IE(I) COORDINATOR */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="flex flex-col items-center mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-[#00D9FF]" />
                <span className="text-xs font-bold tracking-[0.25em] text-[#00D9FF] uppercase">
                  DEPARTMENT IE(I) CHAPTER COORDINATOR
                </span>
              </div>
              <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_8px_#00D9FF] rounded-full mt-1" />
            </div>

            <div className="max-w-2xl mx-auto w-full rounded-2xl glass-panel border border-[#00D9FF]/30 bg-[#04162E]/70 p-8 text-center shadow-[0_0_20px_rgba(0,217,255,0.18)] hover:border-[#00D9FF] hover:shadow-[0_0_30px_rgba(0,217,255,0.3)] hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl">
              <h3 className="text-xl sm:text-2xl font-bold font-orbitron text-white tracking-wide mb-2">
                Dr. G. Mareeswari
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-[#00D9FF] uppercase tracking-wider">
                Assistant Professor
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
