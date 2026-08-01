'use client';

import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown, Users, BookOpen, UserCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import OceanVideoCanvas from '@/components/video/OceanVideoCanvas';
import Navbar from '@/components/Navbar';
import SocialSidebar from '@/components/SocialSidebar';
import Footer from '@/components/Footer';
import MoanaChatbot from '@/components/MoanaChatbot';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const teamCategories = [
  {
    title: 'Leadership',
    description: 'Chief Patron, Patron & Event Convener guiding INFINIX\'26',
    count: '3 Leadership Members',
    href: '/team/leadership',
    icon: Crown,
    gradient: 'from-[#00D9FF]/20 to-[#0284c7]/20',
  },
  {
    title: 'Faculty Coordinators',
    description: 'Faculty Coordinators & Department IE(I) Coordinator',
    count: '3 Faculty Coordinators',
    href: '/team/faculty-coordinators',
    icon: Users,
    gradient: 'from-[#7CE7FF]/20 to-[#00D9FF]/20',
  },
  {
    title: 'Event Faculty Incharges',
    description: 'Faculty members managing event execution & logistics',
    count: '5 Faculty Members',
    href: '/team/faculty-incharges',
    icon: BookOpen,
    gradient: 'from-[#0284c7]/20 to-[#7CE7FF]/20',
  },
  {
    title: 'Student Coordinators',
    description: 'Student leadership driving participant experience',
    count: '4 Student Leaders',
    href: '/team/student-coordinators',
    icon: UserCheck,
    gradient: 'from-[#00D9FF]/20 to-[#04162E]/40',
  },
];

export default function TeamHubPage() {
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
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-gray-300 hover:text-[#00D9FF] transition-colors py-2.5 px-5 rounded-full bg-[#04162E]/70 border border-[#00D9FF]/30 backdrop-blur-md hover:border-[#00D9FF] shadow-[0_0_15px_rgba(0,217,255,0.2)]"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO HOME
          </Link>
        </div>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-bold tracking-[0.3em] text-[#00D9FF] uppercase mb-2 block">
            ORGANIZING COMMITTEE
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-orbitron tracking-tight uppercase text-white">
            MEET THE{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] to-[#7CE7FF]">
              INFINIX&apos;26 TEAM
            </span>
          </h1>
          <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_10px_#00D9FF] rounded-full mx-auto mt-3 mb-3" />
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto tracking-wide">
            Select a team category below to view the dedicated leadership and organizing members.
          </p>
        </motion.div>

        {/* 4 Category Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {teamCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Link
                  href={cat.href}
                  className="group relative block rounded-2xl glass-panel border border-[#00D9FF]/30 bg-[#04162E]/70 p-8 shadow-[0_0_20px_rgba(0,217,255,0.15)] hover:border-[#00D9FF] hover:shadow-[0_0_30px_rgba(0,217,255,0.35)] hover:-translate-y-1.5 transition-all duration-300 backdrop-blur-xl overflow-hidden"
                  data-hoverable="true"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative z-10 flex items-start justify-between gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#04162E] border border-[#00D9FF]/40 text-[#00D9FF] flex items-center justify-center shadow-[0_0_15px_rgba(0,217,255,0.3)] group-hover:scale-110 group-hover:border-[#00D9FF] transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold tracking-widest text-[#00D9FF] bg-[#00D9FF]/10 px-3 py-1 rounded-full border border-[#00D9FF]/30 uppercase">
                      {cat.count}
                    </span>
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-xl sm:text-2xl font-bold font-orbitron text-white tracking-wide mb-2 group-hover:text-[#00D9FF] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
                      {cat.description}
                    </p>

                    <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-widest text-[#00D9FF] uppercase group-hover:text-white transition-colors">
                      <span>VIEW MEMBERS</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <MoanaChatbot />
      <Footer />
    </main>
  );
}
