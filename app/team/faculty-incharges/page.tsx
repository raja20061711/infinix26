'use client';

import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import OceanVideoCanvas from '@/components/video/OceanVideoCanvas';
import Navbar from '@/components/Navbar';
import SocialSidebar from '@/components/SocialSidebar';
import TeamSwitcher from '@/components/team/TeamSwitcher';
import Footer from '@/components/Footer';
import MoanaChatbot from '@/components/MoanaChatbot';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const facultyIncharges = [
  { name: 'Dr. K. Palraj', designation: 'Associate Professor' },
  { name: 'Mr. S. Sakkaravarthi', designation: 'Assistant Professor' },
  { name: 'Mrs. G. Sivasathiya', designation: 'Assistant Professor' },
  { name: 'Mrs. B. Thevahi', designation: 'Assistant Professor – I' },
  { name: 'Mrs. P. Ramya', designation: 'Assistant Professor – I' },
];

export default function FacultyInchargesPage() {
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

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <TeamSwitcher />

        {/* Page Header */}
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
            EVENT FACULTY{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] to-[#7CE7FF]">
              INCHARGES
            </span>
          </h1>
          <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_10px_#00D9FF] rounded-full mx-auto mt-3 mb-2" />
          <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto tracking-wide">
            Faculty Event Management Team Behind INFINIX&apos;26
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facultyIncharges.map((member, idx) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="rounded-2xl glass-panel border border-[#00D9FF]/25 bg-[#04162E]/60 p-6 text-center shadow-[0_0_15px_rgba(0,217,255,0.12)] hover:border-[#00D9FF] hover:shadow-[0_0_25px_rgba(0,217,255,0.25)] hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl flex flex-col justify-center items-center min-h-[120px]"
            >
              <h3 className="text-lg sm:text-xl font-bold font-orbitron text-white tracking-wide mb-1.5">
                {member.name}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-[#00D9FF] uppercase tracking-wider">
                {member.designation}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <MoanaChatbot />
      <Footer />
    </main>
  );
}
