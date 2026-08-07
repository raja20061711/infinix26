'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ChevronLeft, ChevronRight, Maximize2, FileText, Sparkles, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface BrochureViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPage?: number;
}

const TOTAL_PAGES = 10;
const PAGE_TITLES = [
  'Event Title & Sponsors',
  'About INFINIX\'26 & Domains',
  'Smart Intelligence, Cloud & MedTech',
  'Open Innovation & Smart Automation',
  'Prize Pool & Rewards Breakdown',
  'Event Trajectory & Schedule',
  'Rules of Engagement & Hardware',
  'Code of Conduct & Guidelines',
  'Organizing Committee & Contacts',
  'Registration Fees & QR Code',
];

export default function BrochureViewerModal({ isOpen, onClose, initialPage = 1 }: BrochureViewerModalProps) {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  if (!isOpen) return null;

  const handlePrev = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : TOTAL_PAGES));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < TOTAL_PAGES ? prev + 1 : 1));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-[#020b18]/95 border border-[#00D9FF]/40 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,217,255,0.3)] backdrop-blur-2xl text-white"
        >
          {/* Glowing Ocean Accent Bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#00D9FF] via-[#7CE7FF] to-[#00D9FF] shadow-[0_0_15px_#00D9FF]" />

          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-[#00D9FF]/20 bg-[#04162e]/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#00D9FF]/15 border border-[#00D9FF]/40 text-[#00D9FF]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-white tracking-wide uppercase flex items-center gap-2">
                  <span>INFINIX&apos;26 OFFICIAL BROCHURE</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00D9FF]/20 text-[#7CE7FF] border border-[#00D9FF]/30 font-sans font-semibold">
                    10 PAGES
                  </span>
                </h3>
                <p className="text-xs text-[#7CE7FF]">
                  Page {currentPage} of {TOTAL_PAGES}: <span className="font-semibold text-white">{PAGE_TITLES[currentPage - 1]}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/infinix26-brochure.pdf"
                download="INFINIX26_Official_Brochure.pdf"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#4CCFFF] text-black font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(0,217,255,0.6)] hover:scale-105 transition-all"
              >
                <span>DOWNLOAD PDF</span>
                <Download className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#00D9FF] text-gray-300 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Interactive Canvas / Viewer */}
          <div className="relative flex-1 bg-[#010612] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
            {/* Background Ocean Glow */}
            <div className="absolute inset-0 bg-radial from-[#00D9FF]/10 via-transparent to-transparent blur-3xl pointer-events-none" />

            {/* Left Prev Arrow */}
            <button
              onClick={handlePrev}
              className="absolute left-3 sm:left-6 z-20 p-3 sm:p-4 rounded-2xl bg-[#04162e]/90 border border-[#00D9FF]/40 text-[#00D9FF] hover:bg-[#00D9FF] hover:text-black hover:scale-110 transition-all shadow-[0_0_20px_rgba(0,217,255,0.3)] cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right Next Arrow */}
            <button
              onClick={handleNext}
              className="absolute right-3 sm:right-6 z-20 p-3 sm:p-4 rounded-2xl bg-[#04162e]/90 border border-[#00D9FF]/40 text-[#00D9FF] hover:bg-[#00D9FF] hover:text-black hover:scale-110 transition-all shadow-[0_0_20px_rgba(0,217,255,0.3)] cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Brochure Page Image Container */}
            <div className="relative max-h-full max-w-full flex items-center justify-center overflow-hidden rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-[#00D9FF]/20 bg-[#020b18]">
              <motion.img
                key={currentPage}
                src={`/brochure_pages/page_${currentPage}.png`}
                alt={`INFINIX'26 Official Brochure Page ${currentPage}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="max-h-[66vh] sm:max-h-[70vh] w-auto object-contain rounded-xl select-none"
              />
            </div>
          </div>

          {/* Footer Controls & Thumbnail Strip */}
          <div className="px-4 py-3 border-t border-[#00D9FF]/20 bg-[#04162e]/90 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Page Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1 no-scrollbar">
              {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((pgNum) => (
                <button
                  key={pgNum}
                  onClick={() => setCurrentPage(pgNum)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-orbitron transition-all cursor-pointer ${
                    currentPage === pgNum
                      ? 'bg-[#00D9FF] text-black shadow-[0_0_15px_#00D9FF]'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-[#00D9FF]/40'
                  }`}
                >
                  {pgNum}
                </button>
              ))}
            </div>

            {/* Action CTAs */}
            <div className="flex items-center gap-3">
              <a
                href="/infinix26-brochure.pdf"
                download="INFINIX26_Official_Brochure.pdf"
                className="flex sm:hidden items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00D9FF] text-black font-extrabold text-xs uppercase"
              >
                <span>DOWNLOAD PDF</span>
                <Download className="w-3.5 h-3.5" />
              </a>

              <Link
                href="/register"
                onClick={onClose}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#00D9FF] via-[#4CCFFF] to-[#7CE7FF] text-black font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(0,217,255,0.7)] hover:scale-105 transition-all"
              >
                <span>REGISTER FOR HACKATHON</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
