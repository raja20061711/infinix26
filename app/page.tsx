'use client';

import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import OceanVideoCanvas from '@/components/video/OceanVideoCanvas';
import Navbar from '@/components/Navbar';
import AnnouncementTicker from '@/components/AnnouncementTicker';
import SocialSidebar from '@/components/SocialSidebar';
import ScrollIndicator from '@/components/ScrollIndicator';
import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import TracksSection from '@/components/sections/TracksSection';
import TimelineSection from '@/components/sections/TimelineSection';
import PrizesSection from '@/components/sections/PrizesSection';
import SponsorsSection from '@/components/sections/SponsorsSection';
import ContactSection from '@/components/sections/ContactSection';
import Footer from '@/components/Footer';
import MoanaChatbot from '@/components/MoanaChatbot';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  // Initialize Lenis Inertial Smooth Scroll & sync with GSAP ScrollTrigger
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
    <main className="relative min-h-screen bg-[#01040d] text-white overflow-x-hidden selection:bg-[#00D9FF] selection:text-black">
      {/* Scroll-Controlled GSAP WebP Frame Sequence Canvas (Runs continuously across full website) */}
      <OceanVideoCanvas />

      {/* Glass Floating Header Navbar (Includes Notification Bell & Live Announcement Drawer) */}
      <Navbar />

      {/* Left Social Links Sidebar */}
      <SocialSidebar />

      {/* Hero Section */}
      <HeroSection />

      {/* About Section */}
      <AboutSection />

      {/* Tracks Section with 3D Tilt Cards */}
      <TracksSection />

      {/* Horizontal Glowing Timeline Pipeline */}
      <TimelineSection />

      {/* Prizes Section with Gold Champions Pedestal & 3D Trophy */}
      <PrizesSection />

      {/* Sponsors & Industry Partners Section */}
      <SponsorsSection />

      {/* Contact Section & Map */}
      <ContactSection />

      {/* Disney Moana Oceanic AI Chatbot (Interactive Floating Assistant) */}
      <MoanaChatbot />

      {/* Footer */}
      <Footer />
    </main>
  );
}

