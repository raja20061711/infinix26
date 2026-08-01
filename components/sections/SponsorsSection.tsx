'use client';

import React from 'react';
import { ShieldCheck, Award, Users2, Mail, ExternalLink } from 'lucide-react';
import TiltCard from '../ui/TiltCard';

const sponsorTiers = [
  {
    tier: 'TITLE PARTNER',
    badge: 'Platinum Sponsor',
    status: 'Official Platform Partner',
    partners: ['Unstop (Official Platform Partner)'],
    icon: ShieldCheck,
  },
  {
    tier: 'TRACK SPONSORS',
    badge: 'Domain Partners',
    status: 'Announcing Soon',
    partners: ['Revealing Official Industry Partners Soon'],
    icon: Award,
  },
  {
    tier: 'ECOSYSTEM & MEDIA PARTNERS',
    badge: 'Community Partners',
    status: 'Announcing Soon',
    partners: ['Student Chapters & Media Networks'],
    icon: Users2,
  },
];

export default function SponsorsSection() {
  return (
    <section id="sponsors" className="relative py-14 sm:py-16 px-6 max-w-7xl mx-auto z-10">
      <div className="text-center mb-8 sm:mb-10">
        <span className="text-xs font-bold tracking-[0.3em] text-[#00D9FF] uppercase mb-2 block">
          OUR SPONSORS & PARTNERS
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-orbitron tracking-tight uppercase text-white">
          POWERED BY{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] via-[#7CE7FF] to-[#4CCFFF]">
            INDUSTRY LEADERS
          </span>
        </h2>
        <p className="mt-3 text-xs sm:text-sm text-gray-300 max-w-xl mx-auto font-medium">
          Interested in partnering with INFINIX&apos;26? Connect with our team to explore sponsorship tiers.
        </p>
      </div>

      {/* Sponsor Tier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {sponsorTiers.map((tier, idx) => {
          const Icon = tier.icon;
          return (
            <TiltCard key={idx} className="rounded-3xl">
              <div className="glass-panel p-8 rounded-3xl border border-[#00D9FF]/25 flex flex-col justify-between h-full relative group hover:border-[#00D9FF] transition-colors bg-[#04162E]/60 backdrop-blur-xl">
                <div>
                  {/* Top Badge */}
                  <div className="flex items-center justify-between w-full mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#020d20] border border-[#00D9FF]/40 flex items-center justify-center text-[#00D9FF] group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold tracking-widest text-[#7CE7FF] uppercase px-3 py-1 rounded-full bg-[#00D9FF]/10 border border-[#00D9FF]/30">
                      {tier.badge}
                    </span>
                  </div>

                  <h3 className="font-orbitron font-extrabold text-lg text-white mb-2 uppercase tracking-wider">
                    {tier.tier}
                  </h3>

                  <span className="text-[11px] font-semibold text-[#00D9FF] tracking-wider uppercase block mb-4">
                    {tier.status}
                  </span>

                  {/* Partner Names Stack */}
                  <div className="w-full flex flex-col gap-3 mt-2">
                    {tier.partners.map((partner, pIdx) => (
                      <div
                        key={pIdx}
                        className="p-3.5 rounded-xl bg-[#020d20]/80 border border-[#00D9FF]/20 flex items-center justify-between text-xs font-semibold text-gray-200 group-hover:border-[#00D9FF]/40 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00D9FF] shadow-[0_0_8px_#00D9FF]" />
                          {partner}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#00D9FF]" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TiltCard>
          );
        })}
      </div>

      {/* Become a Sponsor CTA Banner */}
      <div className="flex items-center justify-center">
        <a
          href="mailto:infinix26@ritrjpm.ac.in"
          className="px-8 py-3.5 rounded-full glass-panel border border-[#00D9FF]/50 text-xs font-extrabold tracking-widest text-white hover:text-black hover:bg-[#00D9FF] hover:shadow-[0_0_30px_#00D9FF] transition-all duration-300 flex items-center gap-2.5"
          data-hoverable="true"
        >
          <Mail className="w-4 h-4 text-[#00D9FF] group-hover:text-black" />
          <span>BECOME A SPONSOR</span>
        </a>
      </div>
    </section>
  );
}

