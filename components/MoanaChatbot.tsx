'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, RefreshCw, Cpu } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const FAQ_KNOWLEDGE_BASE: { keywords: string[]; response: string }[] = [
  {
    keywords: ['hi', 'hello', 'hey', 'who are you', 'help', 'start', 'assistant', 'moana'],
    response:
      "Welcome to Moana, your official AI assistant for INFINIX'26!\n\nI can assist you with:\n• Event Details & Timeline (September 10-11, 2026)\n• 7 Hackathon Themes & Problem Statements\n• Total ₹30,000 Prize Pool Breakdown\n• 100% Free Registration via Unstop\n• Website Developers (Behind the Experience)\n• Student Coordinators Contact Info\n• Venue & Location Guide\n\nHow may I help you today?",
  },
  {
    keywords: ['who built', 'who created', 'developer', 'developers', 'built', 'creator', 'made by', 'behind the experience', 'maharaja', 'sudharshan', 'adshayaa', 'abinaya', 'team'],
    response:
      "Behind the Experience / Website Developers:\n\nThe INFINIX'26 website was designed and developed by:\n\n• Maharaja T\n• Adshayaa V\n• Sudharshan S\n• Abinaya N\n\nIII Year B.Tech Information Technology,\nDepartment of Information Technology,\nRamco Institute of Technology.",
  },
  {
    keywords: ['what is', 'about', 'infinix', 'event', 'summary', 'overview', 'details'],
    response:
      "INFINIX'26 Event Overview:\n\nINFINIX'26 is a 32-Hour National Level Hackathon organized by the Department of Information Technology at Ramco Institute of Technology (Autonomous) in association with IE(I)-IT Student Chapter.\n\n• Format: 32-Hour Non-Stop Offline Hackathon\n• Dates: September 10 – 11, 2026\n• Total Prize Pool: ₹30,000 Worth Rewards\n• Registration: 100% FREE for college students!",
  },
  {
    keywords: ['date', 'when', 'time', 'schedule', 'timeline', 'september', 'start', 'end', 'reveal', 'problem'],
    response:
      "Official Event Schedule & Timeline:\n\n• Registrations Open: 01 Aug 2026\n• Team Confirmation: 25 Aug 2026\n• Problem Statements Reveal: 10 Sep 2026\n• Hackathon Begins: 10 Sep 2026, 10:00 AM IST\n• Hackathon Ends: 11 Sep 2026, 10:00 AM IST\n• Results Announcement: 11 Sep 2026, 04:00 PM IST",
  },
  {
    keywords: ['theme', 'track', 'domain', 'category', 'topic', 'challenge', 'ai', 'cyber', 'health', 'cloud', 'fintech', 'open', 'energy', 'smart'],
    response:
      "INFINIX'26 7 Official Hackathon Themes:\n\n1. Smart Intelligence (AI/ML)\n   Build intelligent systems using AI, Machine Learning, NLP, Computer Vision, and Generative AI.\n\n2. Secure Computing in the Modern Technical World (Cybersecurity)\n   Develop secure digital solutions focusing on cyber defense, privacy, authentication, and threat detection.\n\n3. Healthcare, Biotechnology & MedTech\n   Create innovative healthcare technologies, medical devices, diagnostics, and digital health solutions.\n\n4. Cloud Computing & DevOps\n   Build scalable cloud-native applications with automation, containers, CI/CD, and DevOps practices.\n\n5. FinTech\n   Design innovative financial solutions including smart banking, fraud detection, digital payments, and analytics.\n\n6. Open Innovation\n   Solve real-world challenges through creative and interdisciplinary technological innovation.\n\n7. Energy Innovation & Smart Grid (EEE & ECE)\n   Develop smart energy systems, renewable energy solutions, smart grids, and intelligent power management.",
  },
  {
    keywords: ['prize', 'reward', 'money', 'cash', 'win', 'amount', 'first', 'second', 'third', 'pool', '30k', '30000'],
    response:
      "INFINIX'26 Rewards & Prize Pool Breakdown (Total ₹30,000 Worth):\n\n• 🏆 1st Prize: ₹15,000 + Cash Prize & Goodies\n• 🥈 2nd Prize: ₹10,000 + Cash Prize & Goodies\n• 🥉 3rd Prize: ₹5,000 + Cash Prize & Goodies\n\nAll participating teams receive official Certificates & Swag Kits!",
  },
  {
    keywords: ['register', 'apply', 'join', 'registration', 'unstop', 'fee', 'cost', 'free', 'deadline'],
    response:
      "Registration Details:\n\n• Registration Fee: 100% FREE!\n• Team Size: 2 to 4 Members per team\n• Eligibility: All college undergraduate & postgraduate students\n• Platform: Registered via Unstop\n• Registration Deadline: 25 Aug 2026",
  },
  {
    keywords: ['coordinator', 'contact', 'enquiry', 'phone', 'call', 'suresh', 'saravanakumar', 'lokesh', 'pranov', 'number', 'reach', 'email'],
    response:
      "Student Coordinators & Enquiries:\n\nStudent Coordinators:\n• Saravanakumar V (IV Year IT) — +91 63748 47027\n• Suresh R (III Year IT) — +91 63748 95822\n\nStudent Enquiries:\n• Lokesh R (III Year IT) — +91 96984 23107\n• Sri Pranov Ginesh S S (II Year IT) — +91 93457 76283\n\nOfficial Email: infinix26@ritrjpm.ac.in",
  },
  {
    keywords: ['where', 'venue', 'location', 'place', 'college', 'address', 'ramco', 'rit', 'rajapalayam'],
    response:
      "Venue & Location Guide:\n\nRamco Institute of Technology (An Autonomous Institution)\nDepartment of Information Technology\nin association with IE(I)-IT Student Chapter\nRajapalayam, Tamil Nadu.",
  },
  {
    keywords: ['social', 'instagram', 'linkedin', 'youtube', 'facebook', 'follow', 'link', 'page', 'handle', 'media'],
    response:
      "Official RIT IT Social Media Handles:\n\n• Instagram: https://www.instagram.com/ritrjpmit\n• LinkedIn: https://www.linkedin.com/in/rit-information-technology\n• YouTube: https://youtube.com/@rit_it_dept\n• Facebook: https://www.facebook.com/people/Department-of-IT-Ramco-Institute-of-Technology-Rajapalayam/61551997366114/",
  },
];

const QUICK_PROMPTS = [
  { label: 'What is INFINIX\'26?', query: 'What is INFINIX26?' },
  { label: '7 Hackathon Themes', query: 'Show all 7 hackathon themes' },
  { label: '₹30,000 Prize Pool', query: 'Show cash prize breakdown' },
  { label: 'Website Developers', query: 'Who built this website?' },
  { label: 'Student Coordinators', query: 'Show student coordinators' },
];

export default function MoanaChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Welcome to Moana, your official AI assistant for INFINIX'26!\n\nI am your intelligence guide for INFINIX'26, hosted by the Department of Information Technology at Ramco Institute of Technology. How may I assist you with hackathon themes, ₹30,000 prize pool, free registration, timeline, venue, website developers, or coordinator contacts today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputMessage.trim();
    if (!query) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: userTime,
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      let bestResponse = '';
      let highestScore = 0;

      for (const item of FAQ_KNOWLEDGE_BASE) {
        let score = 0;
        item.keywords.forEach((kw) => {
          if (lowerQuery.includes(kw)) {
            score += kw.length;
          }
        });
        if (score > highestScore) {
          highestScore = score;
          bestResponse = item.response;
        }
      }

      if (!bestResponse) {
        bestResponse =
          "I am happy to assist! You can inquire about event schedule, domains, cash prizes, free registration, student coordinators, venue location, or accommodation facilities.";
      }

      const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const responseMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: bestResponse,
        timestamp: aiTime,
      };

      setMessages((prev) => [...prev, responseMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Trigger Button at Bottom-Right */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-[#04162E]/90 backdrop-blur-xl border border-[#00D9FF]/40 text-xs font-bold text-[#7CE7FF] shadow-[0_0_20px_rgba(0,217,255,0.35)] hover:border-[#00D9FF] hover:shadow-[0_0_30px_rgba(0,217,255,0.65)] transition-all cursor-pointer font-orbitron"
          >
            <Bot className="w-4 h-4 text-[#00D9FF]" />
            <span>Ask Moana AI</span>
          </motion.button>
        )}

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#0284c7] via-[#00D9FF] to-[#7CE7FF] p-0.5 shadow-[0_0_30px_rgba(0,217,255,0.75)] hover:shadow-[0_0_50px_rgba(0,217,255,1)] transition-all cursor-pointer flex items-center justify-center group overflow-hidden"
          aria-label="Toggle Moana AI Assistant"
        >
          <div className="w-full h-full rounded-full bg-[#04162E] flex items-center justify-center relative z-10 overflow-hidden">
            {isOpen ? (
              <X className="w-6 h-6 text-[#00D9FF]" />
            ) : (
              <div className="relative flex items-center justify-center">
                <Bot className="w-7 h-7 text-[#00D9FF]" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D9FF] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00D9FF]" />
                </span>
              </div>
            )}
          </div>
        </motion.button>
      </div>

      {/* Floating Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-4 sm:right-8 z-50 w-[92vw] sm:w-[430px] max-h-[82vh] h-[600px] rounded-3xl bg-[#04162E]/95 backdrop-blur-2xl border border-[#00D9FF]/40 shadow-[0_20px_60px_rgba(1,4,13,0.95)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-[#021834] via-[#04284d] to-[#021834] border-b border-[#00D9FF]/30 flex items-center justify-between relative overflow-hidden">
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00D9FF] to-[#0284c7] p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(0,217,255,0.6)]">
                  <div className="w-full h-full rounded-full bg-[#04162E] flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-[#00D9FF]" />
                  </div>
                </div>
                <div>
                  <h3 className="font-orbitron font-extrabold text-sm text-white tracking-wider flex items-center gap-1.5">
                    MOANA AI
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-[#00D9FF]/20 text-[#00D9FF] border border-[#00D9FF]/40">
                      OFFICIAL ASSISTANT
                    </span>
                  </h3>
                  <p className="text-[10px] text-[#7CE7FF] font-medium tracking-wide">
                    INFINIX&apos;26 Event Guide
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 relative z-10">
                <button
                  onClick={() =>
                    setMessages([
                      {
                        id: Date.now().toString(),
                        sender: 'ai',
                        text: "Welcome to Moana, your official AI assistant for INFINIX'26!\n\nI am your intelligence guide for INFINIX'26, hosted by the Department of Information Technology at Ramco Institute of Technology. How may I assist you with hackathon tracks, prizes, registration, schedule, venue, or coordinator contacts today?",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      },
                    ])
                  }
                  title="Reset Chat"
                  className="p-1.5 rounded-full text-gray-400 hover:text-[#00D9FF] hover:bg-white/5 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent opacity-50" />
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs sm:text-sm scrollbar-thin scrollbar-thumb-[#00D9FF]/30">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-lg ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-[#00D9FF] to-[#0284c7] text-black font-semibold rounded-br-none'
                        : 'bg-[#062040]/90 border border-[#00D9FF]/30 text-slate-100 rounded-bl-none shadow-[0_0_15px_rgba(0,217,255,0.15)]'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-[#7CE7FF] bg-[#062040]/80 p-3 rounded-2xl w-max border border-[#00D9FF]/30">
                  <Cpu className="w-3.5 h-3.5 text-[#00D9FF] animate-spin" />
                  <span className="font-semibold">Processing query...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="px-4 py-2 bg-[#021226]/80 border-t border-[#00D9FF]/20 flex items-center gap-2 overflow-x-auto scrollbar-none">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt.query)}
                  className="whitespace-nowrap px-3 py-1 rounded-full bg-[#041d3d] border border-[#00D9FF]/30 text-[11px] text-[#7CE7FF] hover:border-[#00D9FF] hover:bg-[#00D9FF]/20 hover:text-white transition-all flex-shrink-0 cursor-pointer"
                >
                  {prompt.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-[#020e20] border-t border-[#00D9FF]/30 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Moana AI about tracks, prizes, coordinators..."
                className="flex-1 bg-[#041b38] border border-[#00D9FF]/30 rounded-full px-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#00D9FF] focus:ring-1 focus:ring-[#00D9FF] transition-all"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00D9FF] to-[#0284c7] text-black flex items-center justify-center font-bold shadow-[0_0_15px_rgba(0,217,255,0.5)] hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
