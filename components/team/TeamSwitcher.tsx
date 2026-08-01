'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Crown, Users, BookOpen, UserCheck, LayoutGrid } from 'lucide-react';

const teamCategories = [
  { name: 'Leadership', href: '/team/leadership', icon: Crown },
  { name: 'Faculty Coordinators', href: '/team/faculty-coordinators', icon: Users },
  { name: 'Faculty Incharges', href: '/team/faculty-incharges', icon: BookOpen },
  { name: 'Student Coordinators', href: '/team/student-coordinators', icon: UserCheck },
];

export default function TeamSwitcher() {
  const pathname = usePathname();

  return (
    <div className="w-full flex flex-col items-center gap-4 mb-10">
      {/* Top Back Buttons */}
      <div className="flex items-center justify-between w-full max-w-5xl px-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-gray-300 hover:text-[#00D9FF] transition-colors py-2 px-4 rounded-full bg-[#04162E]/70 border border-[#00D9FF]/30 backdrop-blur-md hover:border-[#00D9FF] shadow-[0_0_15px_rgba(0,217,255,0.2)]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          BACK TO HOME
        </Link>

        <Link
          href="/team"
          className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-[#00D9FF] hover:text-white transition-colors py-2 px-4 rounded-full bg-[#04162E]/70 border border-[#00D9FF]/30 backdrop-blur-md hover:border-[#00D9FF] shadow-[0_0_15px_rgba(0,217,255,0.2)]"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          TEAM OVERVIEW
        </Link>
      </div>

      {/* Quick Category Switch Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-2 rounded-2xl bg-[#020817]/80 backdrop-blur-xl border border-[#00D9FF]/20 shadow-[0_0_20px_rgba(0,217,255,0.15)]">
        {teamCategories.map((cat) => {
          const isActive = pathname === cat.href;
          const Icon = cat.icon;

          return (
            <Link
              key={cat.href}
              href={cat.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-[#00D9FF] to-[#4CCFFF] text-black shadow-[0_0_15px_#00D9FF]'
                  : 'text-gray-300 hover:text-white hover:bg-[#04162E]/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-[#00D9FF]'}`} />
              <span>{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
