'use client';

import React from 'react';
import { FaLinkedinIn, FaInstagram, FaYoutube, FaFacebookF } from 'react-icons/fa';

export default function SocialSidebar() {
  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center gap-5">
      <span
        className="text-[9px] font-bold tracking-[0.25em] text-[#00D9FF] uppercase opacity-75"
        style={{ writingMode: 'vertical-rl' }}
      >
        FOLLOW US
      </span>

      {/* Vertical Separator Line */}
      <div className="w-[1px] h-8 bg-gradient-to-b from-[#00D9FF]/50 to-transparent" />

      {/* Social Icons Stack */}
      <div className="flex flex-col gap-4">
        {/* Instagram */}
        <a
          href="https://www.instagram.com/ritrjpmit?igsh=MWZvdWpnZTBuZnJlNg=="
          target="_blank"
          rel="noreferrer"
          title="Instagram"
          className="p-2.5 rounded-full glass-panel text-gray-300 hover:text-[#00D9FF] hover:border-[#00D9FF] hover:shadow-[0_0_15px_#00D9FF] transition-all duration-300 transform hover:scale-110"
          data-hoverable="true"
        >
          <FaInstagram className="w-4 h-4" />
        </a>

        {/* LinkedIn */}
        <a
          href="https://www.linkedin.com/in/rit-information-technology?utm_source=share_via&utm_content=profile&utm_medium=member_android"
          target="_blank"
          rel="noreferrer"
          title="LinkedIn"
          className="p-2.5 rounded-full glass-panel text-gray-300 hover:text-[#00D9FF] hover:border-[#00D9FF] hover:shadow-[0_0_15px_#00D9FF] transition-all duration-300 transform hover:scale-110"
          data-hoverable="true"
        >
          <FaLinkedinIn className="w-4 h-4" />
        </a>

        {/* YouTube */}
        <a
          href="https://youtube.com/@rit_it_dept?si=fD31usNsmOqgDUwt"
          target="_blank"
          rel="noreferrer"
          title="YouTube"
          className="p-2.5 rounded-full glass-panel text-gray-300 hover:text-[#00D9FF] hover:border-[#00D9FF] hover:shadow-[0_0_15px_#00D9FF] transition-all duration-300 transform hover:scale-110"
          data-hoverable="true"
        >
          <FaYoutube className="w-4 h-4" />
        </a>

        {/* Facebook */}
        <a
          href="https://www.facebook.com/people/Department-of-IT-Ramco-Institute-of-Technology-Rajapalayam/61551997366114/?__tn__=-UC*F"
          target="_blank"
          rel="noreferrer"
          title="Facebook"
          className="p-2.5 rounded-full glass-panel text-gray-300 hover:text-[#00D9FF] hover:border-[#00D9FF] hover:shadow-[0_0_15px_#00D9FF] transition-all duration-300 transform hover:scale-110"
          data-hoverable="true"
        >
          <FaFacebookF className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
