'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'Who can participate in INFINIX\'26?',
    answer:
      'INFINIX\'26 is open to all university students, college undergraduates, postgraduates, and school coding enthusiasts across India. Teams can consist of 2 to 4 members.',
  },
  {
    question: 'Is there any registration fee?',
    answer:
      'Registration takes place directly on our official website (/register). The registration fee is ₹250 for Internal Ramco Institute of Technology students and ₹350 for External college students.',
  },
  {
    question: 'What is the mode of the hackathon?',
    answer:
      'INFINIX\'26 is a 32-hour hybrid hackathon. The initial proposal round is online, followed by the grand 32-hour non-stop building phase hosted on campus.',
  },
  {
    question: 'Can I participate individually without a team?',
    answer:
      'You can register individually, and our Discord platform will facilitate team matching before team confirmation deadline.',
  },
  {
    question: 'What hardware/software resources will be provided?',
    answer:
      'High-speed Wi-Fi, cloud credits from sponsors, mentor support, and testing hardware labs will be available throughout the 32 hours.',
  },
  {
    question: 'How will the projects be judged?',
    answer:
      'Submissions are evaluated based on technical complexity, innovation, practical impact, UI/UX aesthetics, and project presentation.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative py-14 sm:py-16 px-6 max-w-4xl mx-auto z-10">
      <div className="text-center mb-8 sm:mb-10">
        <span className="text-xs font-bold tracking-[0.3em] text-[#00D9FF] uppercase mb-2 block">
          FAQ
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-orbitron tracking-tight uppercase text-white">
          FREQUENTLY ASKED{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] to-[#7CE7FF]">
            QUESTIONS
          </span>
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className={`glass-panel rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? 'border-[#00D9FF] bg-[#04162E]/80 shadow-[0_0_25px_rgba(0,217,255,0.25)]'
                  : 'border-[#00D9FF]/20 hover:border-[#00D9FF]/50'
              }`}
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-6 flex items-center justify-between text-left gap-4"
                data-hoverable="true"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className={`w-5 h-5 ${isOpen ? 'text-[#00D9FF]' : 'text-gray-400'}`} />
                  <span className="font-orbitron font-bold text-sm sm:text-base text-white">
                    {faq.question}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-[#00D9FF] transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6 text-sm text-gray-300 leading-relaxed border-t border-[#00D9FF]/10 pt-4"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
