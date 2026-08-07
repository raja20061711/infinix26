'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Users,
  UserPlus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  User,
  Clock,
  QrCode,
  Upload,
  CreditCard,
  Building,
  Check,
  MessageCircle,
  Copy,
  Lock,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { syncToGoogleSheets } from '@/utils/sheetSync';

interface TeamMember {
  name: string;
  email: string;
  phone: string;
  college?: string;
  department?: string;
  rollNumber?: string;
  role?: string;
  gender?: string;
}

export default function RegisterPage() {
  const [isRegOpen, setIsRegOpen] = useState<boolean | null>(null);

  useEffect(() => {
    // Check client localStorage fallback first for instant response
    try {
      const localVal = localStorage.getItem('infinix_reg_open');
      if (localVal === 'false') {
        setIsRegOpen(false);
      } else if (localVal === 'true') {
        setIsRegOpen(true);
      }
    } catch (e) {}

    fetch('/api/admin/registration-status', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.isOpen === 'boolean') {
          setIsRegOpen(data.isOpen);
          try {
            localStorage.setItem('infinix_reg_open', String(data.isOpen));
          } catch (e) {}
        } else {
          setIsRegOpen(true);
        }
      })
      .catch(() => {});
  }, []);

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Team & Leader Info
  const [teamName, setTeamName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [college, setCollege] = useState('Ramco Institute of Technology');
  const [department, setDepartment] = useState('Information Technology');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');
  const [gender, setGender] = useState('Male');
  const [rollNumber, setRollNumber] = useState('');
  const [accommodationRequired, setAccommodationRequired] = useState(false);
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);

  // Additional Members (Minimum 2, Maximum 4 required -> Total 3 to 5 members)
  const [members, setMembers] = useState<TeamMember[]>([
    { name: '', email: '', phone: '', college: '', department: 'Information Technology', rollNumber: '', gender: 'Male' },
    { name: '', email: '', phone: '', college: '', department: 'Information Technology', rollNumber: '', gender: 'Male' },
  ]);

  // Step 2: Payment Details
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const handleCopyUpi = () => {
    try {
      navigator.clipboard.writeText('sureshr8107-1@okaxis');
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    } catch (e) {}
  };

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredData, setRegisteredData] = useState<{
    teamId: string;
    password: string;
    teamName: string;
    totalFee: number;
  } | null>(null);

  const totalMembers = 1 + members.length;
  const colLower = college.trim().toLowerCase();
  const isRamcoStudent = colLower.includes('ramco') || colLower.includes('rit');
  const perParticipantFee = isRamcoStudent ? 200 : 350;
  const totalFee = totalMembers * perParticipantFee;

  const handleAddMember = () => {
    if (members.length >= 4) return; // Max 5 total
    setMembers([
      ...members,
      {
        name: '',
        email: '',
        phone: '',
        college: college || '',
        department: 'Information Technology',
        rollNumber: '',
        gender: 'Male',
      },
    ]);
  };

  const handleRemoveMember = (index: number) => {
    if (members.length <= 2) {
      setError('A minimum of 3 total team members (Leader + 2 members) is strictly required.');
      return;
    }
    setError(null);
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!teamName.trim()) return setError('Please enter your Team Name.');
    if (!leaderName.trim()) return setError('Please enter Team Leader Name.');
    if (!leaderEmail.trim()) return setError('Please enter Team Leader Email.');
    if (!leaderPhone.trim()) return setError('Please enter Team Leader Mobile Number.');
    if (!college.trim()) return setError('Please enter your College Name.');

    if (totalMembers < 3 || totalMembers > 5) {
      return setError('Team size must be between 3 and 5 members (including Team Leader).');
    }

    // Validate Member details
    for (let i = 0; i < members.length; i++) {
      if (!members[i].name.trim() || !members[i].email.trim()) {
        return setError(`Please fill in Name and Email for Member ${i + 2}.`);
      }
    }

    if (!declarationConfirmed) {
      return setError('Please confirm the declaration box stating all provided details are correct.');
    }

    // Move to Step 2 (Payment Page)
    setStep(2);
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Payment slip image size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentProofUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!upiTransactionId.trim()) {
      return setError('Please enter the UPI Transaction Reference ID / UTR Number.');
    }

    if (!paymentProofUrl) {
      return setError('Please upload a screenshot or image of your Payment Slip.');
    }

    setLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName,
          leaderName,
          leaderEmail,
          leaderPhone,
          gender,
          college,
          department,
          yearOfStudy,
          rollNumber,
          upiTransactionId,
          paymentProofUrl,
          accommodationRequired,
          members,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      // Trigger client-side backup sync to Google Sheets
      if (data.team) {
        syncToGoogleSheets(data.team, 'create').catch(() => {});
      }

      setRegisteredData({
        teamId: data.teamId,
        password: data.password,
        teamName: data.team.team_name,
        totalFee: data.team.payment_amount || totalFee,
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isRegOpen === false) {
    return (
      <main className="relative min-h-screen bg-[#01040d] text-white pt-24 pb-16 flex flex-col justify-between selection:bg-[#00D9FF] selection:text-black">
        <Navbar />

        <div className="max-w-4xl mx-auto px-6 text-center my-auto flex flex-col items-center justify-center py-16 z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="w-24 h-24 rounded-3xl bg-red-500/10 border-2 border-red-500/50 flex items-center justify-center text-red-400 mb-8 shadow-[0_0_40px_rgba(239,68,68,0.35)] animate-pulse">
              <Lock className="w-12 h-12 text-red-400" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-bold font-orbitron tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <ShieldAlert className="w-4 h-4" />
              <span>REGISTRATIONS PAUSED</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-orbitron text-white uppercase tracking-tight max-w-3xl mb-4 leading-tight">
              THERE IS NO LONGER ACCEPTING <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-400 to-red-500">REGISTRATIONS</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-400 max-w-xl mb-10 leading-relaxed font-sans">
              Team registrations for INFINIX&apos;26 National Level Hackathon are currently paused / closed. Thank you for your overwhelming interest!
            </p>

            <Link
              href="/"
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#00D9FF] to-[#7CE7FF] text-black font-orbitron font-extrabold text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(0,217,255,0.4)] hover:shadow-[0_0_30px_rgba(0,217,255,0.7)] transition-all transform hover:-translate-y-0.5"
            >
              RETURN TO HOMEPAGE
            </Link>
          </motion.div>
        </div>

        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#060b13] text-white selection:bg-[#00D9FF]/30 selection:text-[#7CE7FF]">
      <Navbar />

      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto z-10">
        {/* Background glow effects */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00D9FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#0055FF]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-orbitron tracking-widest text-[#7CE7FF] hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          BACK TO HOME
        </Link>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-[#7CE7FF] text-xs font-orbitron tracking-widest uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            INFINIX &apos;26 OFFICIAL REGISTRATION
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-[#7CE7FF] to-[#00D9FF]">
            {step === 1 ? 'STEP 1: TEAM DETAILS' : 'STEP 2: PAYMENT & UPI QR'}
          </h1>
          <p className="mt-2 text-gray-400 text-xs sm:text-sm max-w-xl mx-auto">
            32-Hours National Level Hackathon • 3 to 5 Members per Team • Sep 10-11, 2026
          </p>
        </div>

        {/* STEPPER INDICATOR */}
        {!registeredData && (
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-orbitron font-bold transition-all ${
              step === 1
                ? 'bg-[#00D9FF]/20 border-[#00D9FF] text-[#7CE7FF] shadow-[0_0_15px_rgba(0,217,255,0.3)]'
                : 'bg-emerald-950/60 border-emerald-500 text-emerald-400'
            }`}>
              <span className="w-5 h-5 rounded-full bg-current text-black flex items-center justify-center font-black text-[10px]">
                {step === 2 ? <Check className="w-3 h-3 text-black stroke-[3]" /> : '1'}
              </span>
              <span>1. TEAM DETAILS</span>
            </div>

            <div className="w-10 h-0.5 bg-gray-800" />

            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-orbitron font-bold transition-all ${
              step === 2
                ? 'bg-[#00D9FF]/20 border-[#00D9FF] text-[#7CE7FF] shadow-[0_0_15px_rgba(0,217,255,0.3)]'
                : 'bg-[#060b13] border-gray-800 text-gray-500'
            }`}>
              <span className="w-5 h-5 rounded-full bg-current text-black flex items-center justify-center font-black text-[10px]">
                2
              </span>
              <span>2. UPI PAYMENT & QR</span>
            </div>
          </div>
        )}

        {/* Success Screen / Modal */}
        <AnimatePresence>
          {registeredData ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-2xl bg-[#0c1424]/90 border border-[#00D9FF]/40 shadow-[0_0_50px_rgba(0,217,255,0.25)] text-center backdrop-blur-xl"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                <Clock className="w-10 h-10 animate-pulse" />
              </div>

              <h2 className="text-2xl font-bold font-orbitron text-white">
                REGISTRATION RECEIVED!
              </h2>
              <p className="text-[#7CE7FF] text-sm mt-1 font-semibold">
                PAYMENT VERIFICATION PENDING BY ADMIN
              </p>

              <div className="my-6 p-6 rounded-xl bg-[#060b13] border border-[#00D9FF]/30 text-left max-w-md mx-auto space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                  <span className="text-gray-400 text-xs uppercase font-orbitron">Team Name:</span>
                  <span className="text-sm font-bold text-white">{registeredData.teamName}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                  <span className="text-gray-400 text-xs uppercase font-orbitron">Team ID:</span>
                  <span className="text-base font-bold font-orbitron text-[#7CE7FF] tracking-wider">
                    {registeredData.teamId}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                  <span className="text-gray-400 text-xs uppercase font-orbitron">Total Fee Paid:</span>
                  <span className="text-sm font-bold text-emerald-400 font-orbitron">
                    ₹{registeredData.totalFee}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs uppercase font-orbitron">Portal Password:</span>
                  <span className="text-sm font-mono text-white bg-gray-800 px-2 py-1 rounded">
                    {registeredData.password}
                  </span>
                </div>
              </div>

              <div className="text-xs text-amber-300 mb-6 max-w-md mx-auto bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-2 text-left">
                <p className="font-bold flex items-center gap-1.5 text-amber-400">
                  <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  Registration Received — Pending Admin Verification!
                </p>
                <p className="text-gray-300">
                  📋 Your registration has been submitted to the organizers.<br /><br />
                  1. Admin will verify your <strong>UPI UTR Number & Payment Slip</strong>.<br />
                  2. Once Admin approves your payment, an official confirmation email containing your <strong>Team ID ({registeredData.teamId})</strong>, <strong>Portal Password ({registeredData.password})</strong>, and Check-in Pass will be sent to <strong>{leaderEmail}</strong>!
                </p>
              </div>

              {/* WHATSAPP COMMUNITY JOIN CARD */}
              <div className="my-6 max-w-md mx-auto p-5 rounded-2xl bg-gradient-to-br from-emerald-950/90 via-[#092e20] to-emerald-950/90 border border-emerald-500/60 text-center shadow-[0_0_35px_rgba(37,211,102,0.3)] space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 text-xs font-orbitron font-bold uppercase">
                  <MessageCircle className="w-4 h-4 text-emerald-400 animate-bounce" />
                  JOIN OFFICIAL WHATSAPP COMMUNITY
                </div>
                <p className="text-xs text-gray-200 leading-relaxed font-sans">
                  It is mandatory for all team leaders & members to join our WhatsApp Community for live hackathon announcements, schedule updates & coordinator support!
                </p>
                <a
                  href="https://chat.whatsapp.com/J77QEl8Iig7DdeaAVYmu8A?s=cl&p=a&ilr=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full bg-[#25D366] text-black font-black text-xs font-orbitron tracking-widest hover:bg-[#20bd5a] transition-all shadow-[0_0_20px_rgba(37,211,102,0.5)] hover:scale-[1.02] uppercase cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-black fill-black" />
                  JOIN WHATSAPP COMMUNITY NOW
                </a>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/student/login"
                  className="px-6 py-3 rounded-full bg-[#00D9FF] text-black font-extrabold text-xs font-orbitron tracking-widest hover:bg-[#7CE7FF] transition-all shadow-[0_0_20px_rgba(0,217,255,0.4)]"
                >
                  STUDENT PORTAL LOGIN
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 rounded-full bg-gray-800 hover:bg-gray-700 text-white font-extrabold text-xs font-orbitron tracking-widest transition-colors"
                >
                  BACK TO HOME
                </Link>
              </div>
            </motion.div>
          ) : step === 1 ? (
            /* STEP 1: TEAM & MEMBERS FORM */
            <form onSubmit={handleNextStep} className="space-y-8">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. Team Name */}
              <div className="p-6 rounded-2xl bg-[#0c1424]/80 border border-[#00D9FF]/20 backdrop-blur-md space-y-4">
                <div className="flex items-center gap-2 text-[#7CE7FF] font-orbitron text-sm font-bold border-b border-gray-800 pb-3">
                  <Users className="w-4 h-4" />
                  <span>1. TEAM NAME</span>
                </div>

                <div>
                  <label className="block text-xs font-orbitron text-gray-300 uppercase mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cyber Knights"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#060b13] border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-[#00D9FF] text-sm"
                  />
                  {/* ⚠️ Important Note */}
                  <div className="mt-3 flex items-start gap-3 px-4 py-3 rounded-xl border border-amber-400/60 bg-amber-500/10 backdrop-blur-sm"
                    style={{ boxShadow: '0 0 18px rgba(251,191,36,0.18)' }}>
                    {/* Blinking dot */}
                    <span className="mt-0.5 flex-shrink-0 relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
                    </span>
                    <p className="text-[11px] leading-relaxed text-amber-200 font-semibold">
                      <span className="text-amber-400 font-black uppercase tracking-wider">⚠ Important Note: </span>
                      Problem statement selection will happen inside the <span className="text-white font-bold">Student Portal</span> after payment verification.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Team Leader Details */}
              <div className="p-6 rounded-2xl bg-[#0c1424]/80 border border-[#00D9FF]/20 backdrop-blur-md space-y-6">
                <div className="flex items-center gap-2 text-[#7CE7FF] font-orbitron text-sm font-bold border-b border-gray-800 pb-3">
                  <User className="w-4 h-4" />
                  <span>2. TEAM LEADER DETAILS</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-orbitron text-gray-300 uppercase mb-2">
                      Leader Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={leaderName}
                      onChange={(e) => setLeaderName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#060b13] border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-[#00D9FF] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-orbitron text-gray-300 uppercase mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="leader@college.edu"
                      value={leaderEmail}
                      onChange={(e) => setLeaderEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#060b13] border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-[#00D9FF] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-orbitron text-gray-300 uppercase mb-2">
                      Mobile / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 9876543210"
                      value={leaderPhone}
                      onChange={(e) => setLeaderPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#060b13] border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-[#00D9FF] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-orbitron text-gray-300 uppercase mb-2">
                      College / Institution Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramco Institute of Technology"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#060b13] border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-[#00D9FF] text-sm"
                    />
                    {college && (
                      <p className="text-[11px] text-[#7CE7FF] mt-1 font-semibold">
                        {isRamcoStudent
                          ? '✅ Internal (Ramco Institute of Technology) Student Rate Applied: ₹200 / participant'
                          : '🌐 External College Rate Applied: ₹350 / participant'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-orbitron text-gray-300 uppercase mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Information Technology"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#060b13] border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-[#00D9FF] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-orbitron text-gray-300 uppercase mb-2">
                      Year of Study
                    </label>
                    <select
                      value={yearOfStudy}
                      onChange={(e) => setYearOfStudy(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#060b13] border border-gray-700 text-white focus:outline-none focus:border-[#00D9FF] text-sm"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-orbitron text-gray-300 uppercase mb-2">
                      Roll / Register Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 953621104001"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#060b13] border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-[#00D9FF] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-orbitron text-gray-300 uppercase mb-2">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#060b13] border border-gray-700 text-white focus:outline-none focus:border-[#00D9FF] text-sm"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Team Members (Strictly 3 to 5 total members) */}
              <div className="p-6 rounded-2xl bg-[#0c1424]/80 border border-[#00D9FF]/20 backdrop-blur-md space-y-6">
                <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2 text-[#7CE7FF] font-orbitron text-sm font-bold">
                      <UserPlus className="w-4 h-4" />
                      <span>3. ADDITIONAL TEAM MEMBERS ({members.length} members + 1 Leader = {totalMembers} Total)</span>
                    </div>
                    <p className="text-[11px] text-amber-400 mt-0.5 font-semibold">
                      ⚠️ Teams MUST have between 3 and 5 total members.
                    </p>
                  </div>

                  {members.length < 4 && (
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="px-3 py-1.5 rounded-lg bg-[#00D9FF]/20 border border-[#00D9FF]/40 text-[#7CE7FF] text-xs font-orbitron tracking-wider hover:bg-[#00D9FF]/30 transition-all flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      ADD MEMBER
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {members.map((member, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#060b13] border border-gray-800 space-y-3 relative group"
                    >
                      <div className="flex justify-between items-center text-xs font-orbitron text-gray-400">
                        <span>MEMBER {idx + 2} (Additional) *</span>
                        {members.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(idx)}
                            className="text-red-400 hover:text-red-300 transition-colors p-1"
                            title="Remove Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] text-gray-400 font-orbitron mb-1">Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="Member Full Name *"
                            value={member.name}
                            onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg bg-[#0c1424] border border-gray-700 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-[#00D9FF]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 font-orbitron mb-1">Email Address *</label>
                          <input
                            type="email"
                            required
                            placeholder="Member Email Address *"
                            value={member.email}
                            onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg bg-[#0c1424] border border-gray-700 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-[#00D9FF]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 font-orbitron mb-1">Mobile / WhatsApp Number</label>
                          <input
                            type="tel"
                            placeholder="Member Phone Number"
                            value={member.phone}
                            onChange={(e) => handleMemberChange(idx, 'phone', e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg bg-[#0c1424] border border-gray-700 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-[#00D9FF]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 font-orbitron mb-1">College Name</label>
                          <input
                            type="text"
                            placeholder="Same as Leader if empty"
                            value={member.college}
                            onChange={(e) => handleMemberChange(idx, 'college', e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg bg-[#0c1424] border border-gray-700 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-[#00D9FF]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 font-orbitron mb-1">Department</label>
                          <input
                            type="text"
                            placeholder="e.g. Information Technology"
                            value={member.department}
                            onChange={(e) => handleMemberChange(idx, 'department', e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg bg-[#0c1424] border border-gray-700 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-[#00D9FF]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 font-orbitron mb-1">Roll / Register No.</label>
                          <input
                            type="text"
                            placeholder="e.g. 953621104002"
                            value={member.rollNumber}
                            onChange={(e) => handleMemberChange(idx, 'rollNumber', e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg bg-[#0c1424] border border-gray-700 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-[#00D9FF]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Declaration & Confirmation */}
              <div className="p-6 rounded-2xl bg-[#0c1424]/80 border border-[#00D9FF]/30 backdrop-blur-md space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#00D9FF]" />
                  <h3 className="text-sm font-bold font-orbitron text-white tracking-wider uppercase">
                    DECLARATION & CONFIRMATION
                  </h3>
                </div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    checked={declarationConfirmed}
                    onChange={(e) => setDeclarationConfirmed(e.target.checked)}
                    className="w-5 h-5 mt-0.5 accent-[#00D9FF] cursor-pointer rounded focus:ring-1 focus:ring-[#00D9FF]"
                  />
                  <span className="text-xs text-gray-300 group-hover:text-white transition-colors leading-relaxed">
                    I hereby declare that all the details provided above (Team Name, Leader & Member details, Contact info, College & Department) are complete, accurate, and correct to the best of my knowledge.
                  </span>
                </label>
              </div>

              {/* Step 1 Next Button */}
              <button
                type="submit"
                className="w-full py-4 rounded-full bg-gradient-to-r from-[#00D9FF] via-[#4CCFFF] to-[#00D9FF] text-black font-black font-orbitron tracking-widest text-sm uppercase shadow-[0_0_30px_rgba(0,217,255,0.5)] hover:shadow-[0_0_50px_rgba(0,217,255,0.8)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>PROCEED TO PAYMENT (STEP 2)</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </form>
          ) : (
            /* STEP 2: PAYMENT PAGE (SEPARATE PAGE VIEW) */
            <form onSubmit={handleSubmitFinal} className="space-y-8">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Team Summary Box */}
              <div className="p-5 rounded-2xl bg-[#060b13] border border-[#00D9FF]/40 text-xs space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                  <span className="text-gray-400 uppercase font-orbitron">TEAM SUMMARY:</span>
                  <span className="text-sm font-bold text-[#7CE7FF] font-orbitron">{teamName}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-gray-300">
                  <div>
                    <span className="text-[10px] text-gray-500 block">LEADER:</span>
                    <span className="font-semibold text-white truncate block">{leaderName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block font-orbitron">TOTAL MEMBERS:</span>
                    <span className="font-semibold text-white">{totalMembers} Members</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">COLLEGE TYPE:</span>
                    <span className="font-semibold text-white">{isRamcoStudent ? 'Ramco Institute' : 'External College'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block font-orbitron">RATE PER HEAD:</span>
                    <span className="font-semibold text-emerald-400 font-orbitron">₹{perParticipantFee} / member</span>
                  </div>
                </div>
              </div>

              {/* Step 2 Payment Form Box */}
              <div className="p-6 rounded-2xl bg-[#0c1424]/90 border border-[#00D9FF]/40 backdrop-blur-xl space-y-6 shadow-[0_0_40px_rgba(0,217,255,0.15)]">
                <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                  <div className="flex items-center gap-2 text-[#7CE7FF] font-orbitron text-sm font-bold">
                    <CreditCard className="w-4 h-4" />
                    <span>UPI PAYMENT & PROOF UPLOAD</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-orbitron text-emerald-400">
                      ₹{totalFee}
                    </span>
                    <span className="text-[10px] text-gray-400 block font-orbitron">Total Fee Payable</span>
                  </div>
                </div>

                {/* UPI QR Code & Instructions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Official RIT Payment QR Box */}
                  <div className="p-5 rounded-2xl bg-[#060b13] border border-[#00D9FF]/30 text-center flex flex-col items-center shadow-[0_0_25px_rgba(0,217,255,0.15)]">
                    <div className="w-52 h-52 rounded-xl bg-white p-2.5 flex items-center justify-center shadow-[0_0_30px_rgba(0,217,255,0.35)] relative overflow-hidden group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/rit-payment-qr.png"
                        alt="RIT Official Payment QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="mt-4 space-y-1.5 w-full">
                      <div className="text-[11px] font-orbitron font-extrabold text-white tracking-wider uppercase">
                        ACCOUNT NAME: <span className="text-[#00D9FF]">Suresh R</span>
                      </div>

                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0c1424] border border-[#00D9FF]/40 text-xs font-mono font-bold text-[#7CE7FF] mt-1">
                        <span>sureshr8107-1@okaxis</span>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="p-1 hover:text-white transition-colors cursor-pointer"
                          title="Copy UPI ID"
                        >
                          {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#00D9FF]" />}
                        </button>
                      </div>

                      {copiedUpi && (
                        <p className="text-[10px] text-emerald-400 font-semibold animate-pulse">
                          ✅ UPI ID Copied to Clipboard!
                        </p>
                      )}

                      <p className="text-[10px] text-gray-400 mt-2 font-medium">
                        Scan via GPay / PhonePe / Paytm / BHIM / Cred / Any UPI App
                      </p>
                    </div>
                  </div>

                  {/* Payment Inputs */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-orbitron text-gray-300 uppercase mb-2">
                        UPI Transaction Ref / UTR Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 423589012345"
                        value={upiTransactionId}
                        onChange={(e) => setUpiTransactionId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#060b13] border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-[#00D9FF] text-sm font-mono"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">
                        Enter the 12-digit UTR/Ref Number from your payment app.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-orbitron text-gray-300 uppercase mb-2">
                        Upload Payment Slip / Receipt Screenshot *
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="payment-slip-input"
                        />
                        <label
                          htmlFor="payment-slip-input"
                          className="w-full py-3 px-4 rounded-xl bg-[#060b13] border border-dashed border-gray-700 hover:border-[#00D9FF] text-gray-300 text-xs font-orbitron flex items-center justify-center gap-2 cursor-pointer transition-colors"
                        >
                          <Upload className="w-4 h-4 text-[#00D9FF]" />
                          {paymentProofUrl ? 'CHANGE PAYMENT SLIP IMAGE' : 'SELECT PAYMENT SLIP IMAGE'}
                        </label>
                      </div>

                      {paymentProofUrl && (
                        <div className="mt-2 p-2 rounded-xl bg-[#060b13] border border-[#00D9FF]/30 flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={paymentProofUrl}
                            alt="Payment Slip Proof"
                            className="w-12 h-12 rounded-lg object-cover border border-gray-700"
                          />
                          <span className="text-xs text-emerald-400 font-semibold">
                            ✅ Payment Slip Attached
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Step 2 */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-4 px-6 rounded-full bg-gray-800 hover:bg-gray-700 text-white font-extrabold text-xs font-orbitron tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>BACK TO EDIT TEAM DETAILS</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 rounded-full bg-gradient-to-r from-[#00D9FF] via-[#4CCFFF] to-[#00D9FF] text-black font-black font-orbitron tracking-widest text-sm uppercase shadow-[0_0_30px_rgba(0,217,255,0.5)] hover:shadow-[0_0_50px_rgba(0,217,255,0.8)] hover:scale-[1.01] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'SUBMITTING REGISTRATION...' : `COMPLETE REGISTRATION (PAY ₹${totalFee})`}
                </button>
              </div>
            </form>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </main>
  );
}
