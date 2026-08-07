'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ChevronLeft, ChevronRight, FileText, ZoomIn, ZoomOut, RotateCcw, ExternalLink, Eye, ArrowDown } from 'lucide-react';
import Link from 'next/link';

interface BrochureViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPage?: number;
}

const TOTAL_PAGES = 10;
const PAGE_TITLES = [
  'Event Title & Official Sponsors',
  'About INFINIX\'26 & Hackathon Domains',
  'Smart Intelligence, Cloud & MedTech',
  'Open Innovation & Smart Automation',
  'Win Big: ₹15,000 Prize Pool Breakdown',
  'Event Trajectory & Milestones Timeline',
  'Rules of Engagement & Hardware Requirements',
  'Hackathon Code of Conduct & Guidelines',
  'Faculty & Student Coordinators Contact Info',
  'Registration Fees & Direct QR Code Scanner',
];

export default function BrochureViewerModal({ isOpen, onClose, initialPage = 1 }: BrochureViewerModalProps) {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  if (!isOpen) return null;

  const handlePrev = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : TOTAL_PAGES));
    setZoomLevel(100);
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < TOTAL_PAGES ? prev + 1 : 1));
    setZoomLevel(100);
  };

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 225));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 75));
  const resetZoom = () => setZoomLevel(100);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-6xl h-[94vh] flex flex-col bg-[#020b18]/98 border border-[#00D9FF]/40 rounded-3xl overflow-hidden shadow-[0_0_70px_rgba(0,217,255,0.35)] backdrop-blur-2xl text-white"
        >
          {/* Glowing Ocean Top Bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#00D9FF] via-[#7CE7FF] to-[#00D9FF] shadow-[0_0_15px_#00D9FF]" />

          {/* Modal Header Controls */}
          <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 border-b border-[#00D9FF]/20 bg-[#04162e]/90 gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#00D9FF]/15 border border-[#00D9FF]/40 text-[#00D9FF]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-orbitron font-extrabold text-xs sm:text-sm text-white tracking-wide uppercase flex items-center gap-2">
                  <span>INFINIX&apos;26 OFFICIAL BROCHURE</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00D9FF]/20 text-[#7CE7FF] border border-[#00D9FF]/30 font-sans font-semibold">
                    10 PAGES (HIGH RESOLUTION)
                  </span>
                </h3>
                <p className="text-[11px] text-[#7CE7FF] truncate max-w-xs sm:max-w-md">
                  Page {currentPage} of {TOTAL_PAGES}: <span className="font-semibold text-white">{PAGE_TITLES[currentPage - 1]}</span>
                </p>
              </div>
            </div>

            {/* Header Zoom & Download Toolbar */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Zoom Controls */}
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

              {/* View Full Image in New Tab */}
              <a
                href={`/brochure_pages/page_${currentPage}.png`}
                target="_blank"
                rel="noreferrer"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#00D9FF] text-xs font-bold text-gray-200 hover:text-white transition-all"
                title="Open Clear Full HD Image in New Tab"
              >
                <span>OPEN FULL HD</span>
                <Eye className="w-3.5 h-3.5 text-[#00D9FF]" />
              </a>

              {/* Download PDF Button */}
              <a
                href="/infinix26-brochure.pdf"
                download="INFINIX26_Official_Brochure.pdf"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#4CCFFF] text-black font-extrabold text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(0,217,255,0.6)] hover:scale-105 transition-all"
              >
                <span>DOWNLOAD PDF</span>
                <Download className="w-3.5 h-3.5" />
              </a>

              {/* Close Modal Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#00D9FF] text-gray-300 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Viewer Area (Scrollable Vertically & Horizontally for Ultra Clear Reading) */}
          <div className="relative flex-1 bg-[#010612] overflow-auto p-2 sm:p-4 flex items-center justify-center">
            {/* Prev Arrow Floating */}
            <button
              onClick={handlePrev}
              className="fixed left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-4 rounded-2xl bg-[#04162e]/95 border border-[#00D9FF]/50 text-[#00D9FF] hover:bg-[#00D9FF] hover:text-black hover:scale-110 transition-all shadow-[0_0_25px_rgba(0,217,255,0.5)] cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Arrow Floating */}
            <button
              onClick={handleNext}
              className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-4 rounded-2xl bg-[#04162e]/95 border border-[#00D9FF]/50 text-[#00D9FF] hover:bg-[#00D9FF] hover:text-black hover:scale-110 transition-all shadow-[0_0_25px_rgba(0,217,255,0.5)] cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image Container with Scroll Support for Bottom Content ("keela ulathu") */}
            <div className="w-full h-full flex flex-col items-center overflow-y-auto overflow-x-auto p-2 sm:p-4 rounded-2xl scrollbar-thin scrollbar-thumb-[#00D9FF]/40 bg-[#020b18]/60">
              <div
                className="transition-all duration-200 ease-out my-auto flex flex-col items-center"
                style={{ width: `${zoomLevel}%`, minWidth: '320px' }}
              >
                <img
                  key={currentPage}
                  src={`/brochure_pages/page_${currentPage}.png`}
                  alt={`INFINIX'26 Official Brochure Page ${currentPage}`}
                  className="w-full h-auto object-contain rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] border border-[#00D9FF]/20 select-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Controls & Page Jump Pills */}
          <div className="px-4 py-2.5 border-t border-[#00D9FF]/20 bg-[#04162e]/95 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Scroll Indicator Tip */}
            <div className="flex items-center gap-1.5 text-[11px] text-[#7CE7FF] font-medium">
              <ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#00D9FF]" />
              <span>Scroll down inside image to read bottom content clearly</span>
            </div>

            {/* Page Jump Pills */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5 no-scrollbar">
              {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((pgNum) => (
                <button
                  key={pgNum}
                  onClick={() => {
                    setCurrentPage(pgNum);
                    setZoomLevel(100);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold font-orbitron transition-all cursor-pointer ${
                    currentPage === pgNum
                      ? 'bg-[#00D9FF] text-black shadow-[0_0_15px_#00D9FF]'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-[#00D9FF]/40'
                  }`}
                >
                  {pgNum}
                </button>
              ))}
            </div>

            {/* Register CTA */}
            <Link
              href="/register"
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#7CE7FF] text-black font-extrabold text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(0,217,255,0.7)] hover:scale-105 transition-all"
            >
              <span>REGISTER</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
