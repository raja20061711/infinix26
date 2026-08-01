'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Clock, Phone, Map } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

interface Coordinator {
  id: number;
  name: string;
  role: string;
  yearDept: string;
  phone: string;
  phoneRaw: string;
}

const infoCards = [
  {
    icon: MapPin,
    title: 'Venue',
    details: 'Ramco Institute of Technology',
    subDetails: 'Rajapalayam, Tamil Nadu',
  },
  {
    icon: Mail,
    title: 'Official Email',
    details: 'infinix.itrit26@gmail.com',
    isEmail: true,
  },
  {
    icon: Clock,
    title: 'Event',
    details: '32-Hour National Level Hackathon',
  },
];

const studentCoordinators: Coordinator[] = [
  {
    id: 1,
    name: 'Saravanakumar V',
    role: 'Student Coordinator',
    yearDept: 'IV Year, Information Technology',
    phone: '+91 63748 47027',
    phoneRaw: '916374847027',
  },
  {
    id: 2,
    name: 'Suresh R',
    role: 'Student Coordinator',
    yearDept: 'III Year, Information Technology',
    phone: '+91 63748 95822',
    phoneRaw: '916374895822',
  },
  {
    id: 3,
    name: 'Lokesh R',
    role: 'Student Enquiry',
    yearDept: 'III Year, Information Technology',
    phone: '+91 96984 23107',
    phoneRaw: '919698423107',
  },
  {
    id: 4,
    name: 'Sri Pranov Ginesh S S',
    role: 'Student Enquiry',
    yearDept: 'II Year, Information Technology',
    phone: '+91 93457 76283',
    phoneRaw: '919345776283',
  },
];

export default function ContactSection() {
  return (
    <section id="contact" className="relative py-14 sm:py-16 px-6 max-w-7xl mx-auto z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 sm:mb-10"
      >
        <span className="text-xs font-bold tracking-[0.3em] text-[#00D9FF] uppercase mb-2 block">
          REACH OUT TO US
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-orbitron tracking-tight uppercase text-white">
          GET IN{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] via-[#7CE7FF] to-[#4CCFFF]">
            TOUCH
          </span>
        </h2>
        <p className="mt-4 text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto leading-relaxed font-medium">
          Have questions about INFINIX&apos;26? Connect with our student coordinators and enquiry team for assistance.
        </p>
      </motion.div>

      {/* Top 3 Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {infoCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              className="glass-panel p-6 rounded-3xl border border-[#00D9FF]/25 bg-[#04162E]/60 backdrop-blur-2xl hover:border-[#00D9FF] hover:shadow-[0_0_30px_rgba(0,217,255,0.4)] transition-all duration-300 flex items-start gap-4"
              data-hoverable="true"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#00D9FF]/10 border border-[#00D9FF]/30 flex items-center justify-center text-[#00D9FF] shrink-0 shadow-[0_0_15px_rgba(0,217,255,0.2)]">
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#7CE7FF] uppercase mb-1">
                  {card.title}
                </span>
                {card.isEmail ? (
                  <a
                    href={`mailto:${card.details}`}
                    className="font-orbitron font-bold text-sm sm:text-base text-white hover:text-[#00D9FF] transition-colors break-all"
                  >
                    {card.details}
                  </a>
                ) : (
                  <>
                    <p className="font-orbitron font-bold text-sm sm:text-base text-white leading-snug">
                      {card.details}
                    </p>
                    {card.subDetails && (
                      <span className="text-xs text-gray-300 mt-0.5 font-normal">
                        {card.subDetails}
                      </span>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Student Coordinators & Enquiries Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-12 mb-10 text-center"
      >
        <h3 className="text-2xl sm:text-3xl font-black font-orbitron tracking-tight uppercase text-white">
          COORDINATORS & <span className="text-[#00D9FF]">ENQUIRIES</span>
        </h3>
        <p className="text-xs text-gray-400 mt-2">
          Contact our team members directly via phone or WhatsApp for quick support
        </p>
      </motion.div>

      {/* 4 Student Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {studentCoordinators.map((coord, idx) => (
          <motion.div
            key={coord.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            whileHover={{ y: -6 }}
            className="glass-panel p-6 rounded-3xl border border-[#00D9FF]/25 bg-[#04162E]/60 backdrop-blur-2xl hover:border-[#00D9FF] hover:shadow-[0_0_30px_rgba(0,217,255,0.4)] transition-all duration-300 flex flex-col items-center text-center relative group"
            data-hoverable="true"
          >
            {/* Role Badge */}
            <span className="px-3.5 py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase border border-[#00D9FF]/40 text-[#7CE7FF] bg-[#00D9FF]/10 mb-4 shadow-[0_0_10px_rgba(0,217,255,0.2)]">
              {coord.role}
            </span>

            {/* Name */}
            <h4 className="font-orbitron font-extrabold text-base text-white group-hover:text-[#00D9FF] transition-colors leading-tight mt-1">
              {coord.name}
            </h4>

            {/* Year & Department */}
            <span className="text-xs font-semibold tracking-wider text-[#7CE7FF] mt-2 uppercase">
              {coord.yearDept}
            </span>

            {/* Phone Number */}
            <a
              href={`tel:${coord.phoneRaw}`}
              className="text-xs font-mono font-semibold text-gray-300 hover:text-[#00D9FF] transition-colors mt-2 tracking-wide block"
            >
              {coord.phone}
            </a>

            {/* Icons: Call & WhatsApp */}
            <div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t border-[#00D9FF]/15 w-full">
              <a
                href={`tel:${coord.phoneRaw}`}
                className="flex-1 py-2 px-3 rounded-full bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-[#00D9FF] hover:bg-[#00D9FF] hover:text-black hover:shadow-[0_0_15px_#00D9FF] transition-all flex items-center justify-center gap-1.5 text-xs font-extrabold uppercase tracking-wider"
                title={`Call ${coord.name}`}
              >
                <Phone className="w-3.5 h-3.5" />
                Call
              </a>

              <a
                href={`https://wa.me/${coord.phoneRaw}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 rounded-full bg-[#25D366]/10 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366] hover:text-black hover:shadow-[0_0_15px_#25D366] transition-all flex items-center justify-center gap-1.5 text-xs font-extrabold uppercase tracking-wider"
                title={`WhatsApp ${coord.name}`}
              >
                <FaWhatsapp className="w-3.5 h-3.5" />
                Chat
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Three Action Buttons Below */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex flex-wrap items-center justify-center gap-5 z-10"
      >
        {/* Contact via Email */}
        <a
          href="mailto:infinix.itrit26@gmail.com"
          className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#00D9FF] via-[#4CCFFF] to-[#00D9FF] text-black font-extrabold text-xs tracking-widest uppercase shadow-[0_0_25px_rgba(0,217,255,0.6)] hover:shadow-[0_0_40px_rgba(0,217,255,0.9)] hover:scale-105 transition-all duration-300 flex items-center gap-2.5"
          data-hoverable="true"
        >
          <Mail className="w-4 h-4 text-black" />
          <span>CONTACT VIA EMAIL</span>
        </a>

        {/* Join WhatsApp Community */}
        <a
          href="https://chat.whatsapp.com"
          target="_blank"
          rel="noreferrer"
          className="px-7 py-3.5 rounded-full glass-panel border border-[#25D366]/50 text-xs font-extrabold tracking-widest text-white hover:text-[#25D366] hover:border-[#25D366] hover:shadow-[0_0_25px_rgba(37,211,102,0.5)] hover:scale-105 transition-all duration-300 flex items-center gap-2.5 bg-[#04162E]/70"
          data-hoverable="true"
        >
          <FaWhatsapp className="w-4 h-4 text-[#25D366]" />
          <span>JOIN WHATSAPP COMMUNITY</span>
        </a>

        {/* View Location */}
        <a
          href="https://maps.google.com/maps?q=Ramco%20Institute%20of%20Technology%20Rajapalayam"
          target="_blank"
          rel="noreferrer"
          className="px-7 py-3.5 rounded-full glass-panel border border-[#00D9FF]/40 text-xs font-extrabold tracking-widest text-white hover:text-[#7CE7FF] hover:border-[#00D9FF] hover:shadow-[0_0_25px_rgba(0,217,255,0.5)] hover:scale-105 transition-all duration-300 flex items-center gap-2.5 bg-[#04162E]/70"
          data-hoverable="true"
        >
          <Map className="w-4 h-4 text-[#00D9FF]" />
          <span>VIEW LOCATION</span>
        </a>
      </motion.div>
    </section>
  );
}
