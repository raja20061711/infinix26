'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const depthLevels = [
  { id: 'hero', num: '01', name: 'SURFACE' },
  { id: 'about', num: '02', name: 'JOURNEY' },
  { id: 'tracks', num: '03', name: 'DEPTHS' },
  { id: 'prizes', num: '04', name: 'THE ABYSS' },
];

export default function ScrollIndicator() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
      const progress = window.scrollY / maxScroll;

      if (progress < 0.25) {
        setActiveStep(0);
      } else if (progress < 0.55) {
        setActiveStep(1);
      } else if (progress < 0.8) {
        setActiveStep(2);
      } else {
        setActiveStep(3);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center gap-6">
      {/* Active Step Level Badge */}
      <div className="flex flex-col items-center">
        <span className="font-orbitron font-extrabold text-sm text-[#00D9FF] tracking-widest">
          {depthLevels[activeStep].num}
        </span>
        <span className="text-[9px] font-bold tracking-[0.2em] text-[#7CE7FF] uppercase mt-0.5">
          {depthLevels[activeStep].name}
        </span>
      </div>

      {/* Vertical Step Nodes */}
      <div className="flex flex-col items-center gap-4">
        {depthLevels.map((level, idx) => (
          <button
            key={level.id}
            onClick={() => scrollToSection(level.id)}
            className={`w-3 h-3 rounded-full border transition-all duration-300 ${
              activeStep === idx
                ? 'bg-[#00D9FF] border-[#7CE7FF] scale-125 shadow-[0_0_12px_#00D9FF]'
                : 'bg-[#04162E] border-gray-600 hover:border-[#00D9FF]'
            }`}
            title={`Go to Step ${level.num}: ${level.name}`}
          />
        ))}
      </div>

      {/* Scroll Down Indicator */}
      <div
        className="flex flex-col items-center gap-2 cursor-pointer group"
        onClick={() => scrollToSection('about')}
      >
        <span
          className="text-[9px] font-bold text-gray-400 tracking-[0.25em] uppercase group-hover:text-[#00D9FF] transition-colors"
          style={{ writingMode: 'vertical-rl' }}
        >
          SCROLL DOWN
        </span>
        <ChevronDown className="w-4 h-4 text-[#00D9FF] animate-bounce" />
      </div>
    </div>
  );
}
