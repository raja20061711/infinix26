'use client';

import React from 'react';
import { Mail, ExternalLink, Sparkles, Instagram, MapPin } from 'lucide-react';
import TiltCard from '../ui/TiltCard';

const sponsorList = [
  {
    name: 'IE(I) IT STUDENT CHAPTER',
    badge: 'Host Chapter',
    tier: 'ORGANIZING ACADEMIC PARTNER',
    tagline: 'Dept. of IT, Ramco Institute of Technology',
    logo: '/iei-logo.png',
  },
  {
    name: 'CADD TECHNOLYNX',
    badge: 'Official Sponsor',
    tier: 'DESIGN & PLACEMENT PARTNER',
    tagline: 'INNOVATE • DESIGN • PLACEMENT',
    logo: '/cadd-technolynx-logo.png',
    url: 'https://caddtechnolynx.com/index.html',
  },
  {
    name: 'BRASSY ACADEMY',
    badge: 'Official Sponsor',
    tier: 'SOFTWARE • RESEARCH • EDUCATION',
    tagline: 'SOFTWARE | RESEARCH | EDUCATION',
    logo: '/brassy-academy-logo.png',
    url: 'https://brassyacademy.com/',
  },
  {
    name: 'THE THREE MONKEYS',
    badge: 'Merchandise Partner',
    tier: 'OFFICIAL MERCHANDISE PARTNER',
    tagline: 'Official Merchandise & Apparel Partner',
    logo: '/three-monkeys-logo.png',
    url: 'https://www.instagram.com/threemonkeyscafe/?hl=en',
    locationUrl: 'https://share.google/XFJajlhSNoMjInKfj',
  },
  {
    name: 'THE RAIN TREE',
    badge: 'Merchandise Partner',
    tier: 'OFFICIAL LOUNGE & RESTO PARTNER',
    tagline: 'Casual Dining & Social Spot',
    logo: '/rain-tree-logo.jpg',
    locationUrl: 'https://maps.google.com/?q=The+Rain+Tree+Resto+Lounge+Bar+Rajapalayam',
  },
  {
    name: 'UNSTOP',
    badge: 'Media Partner',
    tier: 'PLATFORM & MEDIA PARTNER',
    tagline: 'Official Online Platform',
    logo: '/unstop-logo.png',
    url: 'https://unstop.com',
  },
];

export default function SponsorsSection() {
  return (
    <section id="sponsors" className="relative py-12 sm:py-16 px-6 max-w-7xl mx-auto z-10">
      {/* Compact Header */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-[#00D9FF] text-[11px] font-bold font-orbitron tracking-widest uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#00D9FF]" />
          <span>OFFICIAL EVENT SPONSORS</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-orbitron tracking-tight uppercase text-white">
          POWERED BY{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] via-[#7CE7FF] to-[#4CCFFF]">
            INDUSTRY LEADERS
          </span>
        </h2>
      </div>

      {/* Compact Neat Sponsors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {sponsorList.map((item, idx) => {
          const Container = item.url ? 'a' : 'div';
          const linkProps = item.url
            ? { href: item.url, target: '_blank', rel: 'noopener noreferrer' }
            : {};

          return (
            <TiltCard key={idx} className="rounded-3xl h-full">
              <Container
                {...linkProps}
                className="glass-panel p-5 rounded-3xl border border-[#00D9FF]/30 bg-gradient-to-b from-[#051c38]/90 via-[#04162e]/95 to-[#020a16] flex flex-col justify-between h-full relative group hover:border-[#00D9FF] hover:shadow-[0_0_30px_rgba(0,217,255,0.3)] transition-all cursor-pointer backdrop-blur-2xl"
              >
                <div>
                  {/* Top Badge & Links */}
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full border bg-[#00D9FF]/10 text-[#7CE7FF] border-[#00D9FF]/30">
                      {item.badge}
                    </span>
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {item.locationUrl && (
                        <a
                          href={item.locationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Google Maps Location"
                          className="p-1 rounded-full bg-white/10 hover:bg-[#00D9FF] text-gray-300 hover:text-black transition-all"
                        >
                          <MapPin className="w-3 h-3" />
                        </a>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Official Page"
                          className="p-1 rounded-full bg-white/10 hover:bg-[#00D9FF] text-gray-300 hover:text-black transition-all"
                        >
                          {item.url.includes('instagram.com') ? (
                            <Instagram className="w-3 h-3" />
                          ) : (
                            <ExternalLink className="w-3 h-3" />
                          )}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* High-Contrast Crisp Logo Container Box */}
                  <div className="w-full h-24 mb-3.5 p-2 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-[1.04] bg-white border-2 border-[#00D9FF]/40 shadow-[0_4px_25px_rgba(0,217,255,0.2)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.logo}
                      alt={item.name}
                      loading="eager"
                      decoding="async"
                      className="max-h-full max-w-full object-contain p-0.5"
                    />
                  </div>

                  {/* Sponsor Name & Details */}
                  <h3 className="font-orbitron font-extrabold text-xs tracking-wider uppercase mb-1 text-white group-hover:text-[#00D9FF] transition-colors min-h-[2.2rem] flex items-center leading-tight">
                    {item.name}
                  </h3>

                  <span className="text-[10px] font-bold text-[#00D9FF] tracking-wider uppercase block mb-1">
                    {item.tier}
                  </span>

                  {item.tagline && (
                    <p className="text-[10px] text-gray-300 font-medium line-clamp-2 leading-relaxed">
                      {item.tagline}
                    </p>
                  )}
                </div>
              </Container>
            </TiltCard>
          );
        })}
      </div>

      {/* Become a Sponsor CTA */}
      <div className="flex items-center justify-center">
        <a
          href="mailto:infinix26@ritrjpm.ac.in"
          className="px-6 py-2.5 rounded-full glass-panel border border-[#00D9FF]/40 text-xs font-bold font-orbitron tracking-widest text-white hover:text-black hover:bg-[#00D9FF] hover:shadow-[0_0_25px_#00D9FF] transition-all flex items-center gap-2"
          data-hoverable="true"
        >
          <Mail className="w-3.5 h-3.5 text-[#00D9FF] group-hover:text-black" />
          <span>BECOME A SPONSOR</span>
        </a>
      </div>
    </section>
  );
}
