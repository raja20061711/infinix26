'use client';

import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CommitteeBackgroundCanvas from '@/components/video/CommitteeBackgroundCanvas';
import Navbar from '@/components/Navbar';
import SocialSidebar from '@/components/SocialSidebar';
import CommitteeSection from '@/components/sections/CommitteeSection';
import Footer from '@/components/Footer';
import MoanaChatbot from '@/components/MoanaChatbot';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CommitteePage() {
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
    <main className="relative min-h-screen bg-[#01040d] text-white overflow-x-hidden selection:bg-[#00D9FF] selection:text-black pt-20">
      {/* Calm Dark Navy Blue Abstract Ocean Canvas Background */}
      <CommitteeBackgroundCanvas />

      {/* Navbar */}
      <Navbar />

      {/* Left Social Links Sidebar */}
      <SocialSidebar />

      {/* Organizing Committee Section */}
      <CommitteeSection />

      {/* AI Chatbot */}
      <MoanaChatbot />

      {/* Footer */}
      <Footer />
    </main>
  );
}
