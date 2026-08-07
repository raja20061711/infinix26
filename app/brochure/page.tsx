'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ExternalLink, ArrowLeft, FileText, ChevronLeft, ChevronRight, Eye, Layers, ZoomIn, ZoomOut, RotateCcw, ArrowDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OceanPortalBackground from '@/components/portal/OceanPortalBackground';

const TOTAL_PAGES = 10;

const BROCHURE_PAGES = [
  { id: 1, title: 'Title & Official Sponsors', tag: 'PAGE 1' },
  { id: 2, title: 'About INFINIX\'26 & Hackathon Domains', tag: 'PAGE 2' },
  { id: 3, title: 'Smart Intelligence, Cloud & MedTech', tag: 'PAGE 3' },
  { id: 4, title: 'Open Innovation & Smart Automation', tag: 'PAGE 4' },
  { id: 5, title: 'Win Big: ₹15,000 Prize Pool Breakdown', tag: 'PAGE 5' },
  { id: 6, title: 'Event Trajectory & Milestones Timeline', tag: 'PAGE 6' },
  { id: 7, title: 'Rules of Engagement & Hardware Requirements', tag: 'PAGE 7' },
  { id: 8, title: 'Hackathon Code of Conduct & Guidelines', tag: 'PAGE 8' },
  { id: 9, title: 'Faculty & Student Coordinators Contact Info', tag: 'PAGE 9' },
  { id: 10, title: 'Registration Fee & Direct QR Code Scanner', tag: 'PAGE 10' },
];

export default function BrochurePage() {
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [zoomModalOpen, setZoomModalOpen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handlePrev = () => {
    setSelectedPage((prev) => (prev > 1 ? prev - 1 : TOTAL_PAGES));
    setZoomLevel(100);
  };

  const handleNext = () => {
    setSelectedPage((prev) => (prev < TOTAL_PAGES ? prev + 1 : 1));
    setZoomLevel(100);
  };

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 225));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 75));
  const resetZoom = () => setZoomLevel(100);

  return (
    <main className="min-h-screen bg-[#01050e] text-slate-100 relative overflow-x-hidden">
      {/* Ocean Cinematic Background */}
      <OceanPortalBackground />
      <Navbar />

      <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Navigation Breadcrumb & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#00D9FF] hover:text-white transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK TO HOMEPAGE
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-orbitron tracking-tight text-white uppercase">
              OFFICIAL EVENT{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] via-[#4CCFFF] to-[#7CE7FF]">
                BROCHURE
              </span>
            </h1>
            <p className="mt-2 text-sm text-gray-300 max-w-2xl">
              Explore the 10-page official handbook for INFINIX&apos;26 National Level 32-Hour Hackathon at 300 DPI high clarity with full zoom & scroll controls.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/infinix26-brochure.pdf"
              download="INFINIX26_Official_Brochure.pdf"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-[#00D9FF] via-[#4CCFFF] to-[#00D9FF] text-black font-extrabold text-xs tracking-widest uppercase shadow-[0_0_30px_rgba(0,217,255,0.6)] hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>DOWNLOAD PDF BROCHURE</span>
              <Download className="w-4 h-4 text-black" />
            </a>

            <Link
              href="/register"
              className="px-6 py-3 rounded-full glass-panel border border-[#00D9FF]/40 text-xs font-extrabold tracking-widest text-white hover:text-[#7CE7FF] hover:border-[#00D9FF] hover:shadow-[0_0_30px_rgba(0,217,255,0.5)] hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>REGISTER NOW</span>
              <ExternalLink className="w-4 h-4 text-[#00D9FF]" />
            </Link>
          </div>
        </div>

        {/* Featured Page Display & Interactive Reader */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Main Large Viewer Card (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col items-center">
            <div className="w-full glass-panel p-4 sm:p-6 rounded-3xl border border-[#00D9FF]/30 bg-[#04162e]/80 shadow-[0_20px_50px_rgba(2,8,23,0.85)] relative overflow-hidden backdrop-blur-2xl">
              {/* Top Controls Bar */}
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#00D9FF]/20 gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-[#00D9FF]/15 border border-[#00D9FF]/40 text-[#00D9FF] font-orbitron font-bold text-xs">
                    PAGE {selectedPage} / {TOTAL_PAGES}
                  </span>
                  <span className="text-xs font-semibold text-white truncate max-w-[180px] sm:max-w-xs">
                    {BROCHURE_PAGES[selectedPage - 1].title}
                  </span>
                </div>

                {/* Zoom & View Toolbar */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 bg-[#010612] p-1 rounded-xl border border-[#00D9FF]/30">
                    <button
                      onClick={zoomOut}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                      title="Zoom Out (-)"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono font-bold text-[#00D9FF] px-1.5 min-w-[45px] text-center">
                      {zoomLevel}%
                    </span>
                    <button
                      onClick={zoomIn}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                      title="Zoom In (+)"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    {zoomLevel !== 100 && (
                      <button
                        onClick={resetZoom}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        title="Reset Zoom"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <a
                    href={`/brochure_pages/page_${selectedPage}.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#00D9FF] text-[#00D9FF] hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">FULL HD</span>
                  </a>
                </div>
              </div>

              {/* Scroll Tip Bar */}
              <div className="mb-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#00D9FF]/10 border border-[#00D9FF]/20 text-[11px] text-[#7CE7FF]">
                <span className="flex items-center gap-1.5 font-medium">
                  <ArrowDown className="w-3.5 h-3.5 text-[#00D9FF] animate-bounce" />
                  Scroll down inside frame below to read bottom details clearly (&quot;keela ulathu&quot;)
                </span>
                <span className="text-[10px] font-mono text-gray-400">300 DPI Clear Text</span>
              </div>

              {/* Page Display Image Frame with Full Vertical Scroll Support */}
              <div className="relative w-full flex flex-col items-center bg-[#010612] rounded-2xl p-2 sm:p-4 overflow-y-auto overflow-x-auto border border-[#00D9FF]/20 max-h-[75vh] scrollbar-thin scrollbar-thumb-[#00D9FF]/40">
                {/* Arrow Controls Floating */}
                <button
                  onClick={handlePrev}
                  className="fixed left-6 sm:left-12 z-20 p-3 rounded-2xl bg-[#04162e]/90 border border-[#00D9FF]/40 text-[#00D9FF] hover:bg-[#00D9FF] hover:text-black hover:scale-110 transition-all cursor-pointer shadow-[0_0_20px_rgba(0,217,255,0.4)]"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={handleNext}
                  className="fixed right-6 sm:right-12 z-20 p-3 rounded-2xl bg-[#04162e]/90 border border-[#00D9FF]/40 text-[#00D9FF] hover:bg-[#00D9FF] hover:text-black hover:scale-110 transition-all cursor-pointer shadow-[0_0_20px_rgba(0,217,255,0.4)]"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Main Page Rendered 300 DPI PNG Image */}
                <div
                  className="transition-all duration-200 ease-out flex flex-col items-center"
                  style={{ width: `${zoomLevel}%`, minWidth: '320px' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/brochure_pages/page_${selectedPage}.png`}
                    alt={`INFINIX'26 Brochure Page ${selectedPage}`}
                    className="w-full h-auto object-contain rounded-xl shadow-2xl"
                  />
                </div>
              </div>

              {/* Bottom Quick Page Buttons */}
              <div className="mt-4 flex items-center justify-center gap-1.5 flex-wrap">
                {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((pgNum) => (
                  <button
                    key={pgNum}
                    onClick={() => {
                      setSelectedPage(pgNum);
                      setZoomLevel(100);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-orbitron transition-all cursor-pointer ${
                      selectedPage === pgNum
                        ? 'bg-[#00D9FF] text-black shadow-[0_0_15px_#00D9FF]'
                        : 'bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-[#00D9FF]/40'
                    }`}
                  >
                    Page {pgNum}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Side Thumbnail List (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-[#04162e]/60 border border-[#00D9FF]/30 backdrop-blur-xl">
              <h3 className="font-orbitron font-extrabold text-sm text-[#00D9FF] tracking-wider uppercase mb-1 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                ALL 10 BROCHURE PAGES
              </h3>
              <p className="text-xs text-gray-400">Click any page to jump & scroll:</p>
            </div>

            <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
              {BROCHURE_PAGES.map((pg) => {
                const isActive = selectedPage === pg.id;
                return (
                  <button
                    key={pg.id}
                    onClick={() => {
                      setSelectedPage(pg.id);
                      setZoomLevel(100);
                    }}
                    className={`w-full p-3 rounded-2xl border flex items-center gap-3 transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#00D9FF]/20 border-[#00D9FF] shadow-[0_0_20px_rgba(0,217,255,0.3)]'
                        : 'bg-[#04162e]/40 border-white/10 hover:border-[#00D9FF]/40 hover:bg-white/5'
                    }`}
                  >
                    {/* Thumbnail Image */}
                    <div className="w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-[#00D9FF]/30 bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/brochure_pages/page_${pg.id}.png`}
                        alt={pg.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold font-orbitron px-2 py-0.5 rounded bg-[#00D9FF]/20 text-[#7CE7FF]">
                        {pg.tag}
                      </span>
                      <h4 className="font-bold text-xs text-white mt-1 leading-snug">
                        {pg.title}
                      </h4>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#04162e] via-[#082247] to-[#04162e] border border-[#00D9FF]/40 shadow-[0_0_50px_rgba(0,217,255,0.25)] flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="font-orbitron font-black text-xl sm:text-2xl text-white tracking-wide uppercase">
              READY TO BUILD AT INFINIX&apos;26?
            </h3>
            <p className="text-xs sm:text-sm text-[#7CE7FF] mt-1">
              Join 500+ tech innovators across India. Registrations are live now!
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/infinix26-brochure.pdf"
              download="INFINIX26_Official_Brochure.pdf"
              className="px-6 py-3 rounded-full bg-[#00D9FF] text-black font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_#00D9FF] hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>DOWNLOAD HANDBOOK (PDF)</span>
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
