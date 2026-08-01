'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ArrowRight, User, Users, Rocket } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    teamName: '',
    leadName: '',
    leadEmail: '',
    leadPhone: '',
    college: '',
    track: 'AI & ML',
    teamSize: '4',
  });

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      setSubmitted(true);
    }
  };

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSubmitted(false);
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="absolute inset-0 bg-[#020817]/85 backdrop-blur-2xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 w-full max-w-xl glass-panel p-8 rounded-3xl border border-[#00D9FF]/40 shadow-[0_0_50px_rgba(0,217,255,0.3)] overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={resetAndClose}
              className="absolute top-6 right-6 p-2 rounded-full glass-panel text-gray-400 hover:text-white hover:border-[#00D9FF]"
              data-hoverable="true"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="py-12 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-[#00D9FF]/20 border-2 border-[#00D9FF] flex items-center justify-center text-[#00D9FF] animate-pulse mb-6 shadow-[0_0_30px_#00D9FF]">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-orbitron font-extrabold text-2xl text-white">
                  REGISTRATION CONFIRMED!
                </h3>
                <p className="text-xs text-gray-300 mt-3 max-w-md">
                  Welcome to <span className="text-[#00D9FF] font-bold">INFINIX&apos;26</span>. We have sent the team verification link and Discord invite to{' '}
                  <span className="text-[#7CE7FF]">{formData.leadEmail || 'your email'}</span>.
                </p>
                <button
                  onClick={resetAndClose}
                  className="mt-8 px-8 py-3 rounded-full bg-gradient-to-r from-[#00D9FF] to-[#4CCFFF] text-black font-extrabold text-xs tracking-widest uppercase shadow-[0_0_20px_#00D9FF]"
                >
                  DONE
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#00D9FF]/10 border border-[#00D9FF]/40 flex items-center justify-center text-[#00D9FF]">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-extrabold text-xl text-white uppercase">
                      HACKATHON REGISTRATION
                    </h3>
                    <p className="text-[11px] text-[#7CE7FF] font-semibold tracking-wider uppercase">
                      STEP {step} OF 3
                    </p>
                  </div>
                </div>

                <form onSubmit={handleNextStep} className="flex flex-col gap-4">
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex flex-col gap-4"
                    >
                      <div>
                        <label className="block text-xs font-bold tracking-widest text-[#7CE7FF] uppercase mb-1">
                          TEAM NAME
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., CyberPhantoms"
                          value={formData.teamName}
                          onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#04162E]/80 border border-[#00D9FF]/30 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D9FF]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold tracking-widest text-[#7CE7FF] uppercase mb-1">
                          TEAM SIZE
                        </label>
                        <select
                          value={formData.teamSize}
                          onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#04162E]/80 border border-[#00D9FF]/30 text-white focus:outline-none focus:border-[#00D9FF]"
                        >
                          <option value="2">2 Members</option>
                          <option value="3">3 Members</option>
                          <option value="4">4 Members (Full Team)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold tracking-widest text-[#7CE7FF] uppercase mb-1">
                          INSTITUTION / COLLEGE
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="College name & state"
                          value={formData.college}
                          onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#04162E]/80 border border-[#00D9FF]/30 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D9FF]"
                        />
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex flex-col gap-4"
                    >
                      <div>
                        <label className="block text-xs font-bold tracking-widest text-[#7CE7FF] uppercase mb-1">
                          TEAM LEAD NAME
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Lead full name"
                          value={formData.leadName}
                          onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#04162E]/80 border border-[#00D9FF]/30 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D9FF]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold tracking-widest text-[#7CE7FF] uppercase mb-1">
                          LEAD EMAIL ADDRESS
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="lead@college.edu"
                          value={formData.leadEmail}
                          onChange={(e) => setFormData({ ...formData, leadEmail: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#04162E]/80 border border-[#00D9FF]/30 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D9FF]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold tracking-widest text-[#7CE7FF] uppercase mb-1">
                          PHONE NUMBER
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 9876543210"
                          value={formData.leadPhone}
                          onChange={(e) => setFormData({ ...formData, leadPhone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#04162E]/80 border border-[#00D9FF]/30 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D9FF]"
                        />
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex flex-col gap-4"
                    >
                      <div>
                        <label className="block text-xs font-bold tracking-widest text-[#7CE7FF] uppercase mb-1">
                          PREFERRED TRACK
                        </label>
                        <select
                          value={formData.track}
                          onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#04162E]/80 border border-[#00D9FF]/30 text-white focus:outline-none focus:border-[#00D9FF]"
                        >
                          <option value="AI & ML">AI & Machine Learning</option>
                          <option value="Web Development">Web Development</option>
                          <option value="App Development">App Development</option>
                          <option value="Data Science">Data Science</option>
                          <option value="Cyber Security">Cyber Security</option>
                          <option value="IoT">Internet of Things (IoT)</option>
                          <option value="Cloud Computing">Cloud Computing</option>
                          <option value="Blockchain">Blockchain</option>
                          <option value="AR/VR">AR / VR</option>
                          <option value="Robotics">Robotics</option>
                        </select>
                      </div>

                      <div className="p-4 rounded-xl bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-xs text-gray-300">
                        <p className="font-bold text-[#7CE7FF] mb-1">Important Notice:</p>
                        By clicking submit, your team agrees to follow the INFINIX&apos;26 Code of Conduct and participate in the preliminary round.
                      </div>
                    </motion.div>
                  )}

                  {/* Buttons */}
                  <div className="mt-4 flex items-center justify-between gap-4">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={() => setStep(step - 1)}
                        className="px-6 py-2.5 rounded-full glass-panel border border-gray-600 text-xs font-bold text-gray-300 hover:text-white"
                      >
                        BACK
                      </button>
                    ) : <div />}

                    <button
                      type="submit"
                      className="px-8 py-3 rounded-full bg-gradient-to-r from-[#00D9FF] via-[#4CCFFF] to-[#00D9FF] text-black font-extrabold text-xs tracking-widest uppercase shadow-[0_0_20px_#00D9FF] hover:scale-105 transition-all flex items-center gap-2"
                    >
                      {step === 3 ? 'SUBMIT TEAM' : 'NEXT STEP'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
