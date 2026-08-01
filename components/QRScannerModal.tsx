'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, RefreshCw, CheckCircle2, ShieldAlert, Sparkles, QrCode } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QRScannerModal({ isOpen, onClose }: QRScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Start Camera Stream when modal is open and camera tab is active
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode]);

  const startCamera = async () => {
    setError(null);
    setIsScanning(true);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please allow camera permissions or enter ticket code manually.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleSimulatedScan = (code?: string) => {
    const ticketCode = code || `INF26-PASS-${Math.floor(100000 + Math.random() * 900000)}`;
    setScannedResult(ticketCode);
    stopCamera();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleSimulatedScan(manualCode.trim());
    }
  };

  const resetScanner = () => {
    setScannedResult(null);
    setManualCode('');
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  const handleCloseModal = () => {
    stopCamera();
    setScannedResult(null);
    setManualCode('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
            className="absolute inset-0 bg-[#020817]/85 backdrop-blur-2xl"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-[#00D9FF]/40 shadow-[0_0_50px_rgba(0,217,255,0.35)] overflow-hidden bg-[#04162E]/90 backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#00D9FF]/20 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00D9FF]/10 border border-[#00D9FF]/40 flex items-center justify-center text-[#00D9FF] shadow-[0_0_15px_rgba(0,217,255,0.4)]">
                  <QrCode className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-orbitron font-extrabold text-lg text-white uppercase tracking-wider">
                    SCANNER PORTAL
                  </h3>
                  <p className="text-[11px] text-[#7CE7FF] font-medium">
                    INFINIX&apos;26 Verification &amp; Ticket Check-In
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full glass-panel text-gray-400 hover:text-white hover:border-[#00D9FF] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switch Tabs */}
            {!scannedResult && (
              <div className="flex items-center justify-center p-1 bg-[#020e20] border border-[#00D9FF]/20 rounded-full mb-6">
                <button
                  onClick={() => setActiveTab('camera')}
                  className={`flex-1 py-2 px-4 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'camera'
                      ? 'bg-gradient-to-r from-[#00D9FF] to-[#0284c7] text-black shadow-[0_0_15px_rgba(0,217,255,0.5)]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Live Camera
                </button>
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`flex-1 py-2 px-4 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'manual'
                      ? 'bg-gradient-to-r from-[#00D9FF] to-[#0284c7] text-black shadow-[0_0_15px_rgba(0,217,255,0.5)]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  Enter Code
                </button>
              </div>
            )}

            {/* Result View */}
            {scannedResult ? (
              <div className="py-8 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-[#00D9FF]/20 border-2 border-[#00D9FF] flex items-center justify-center text-[#00D9FF] animate-pulse mb-6 shadow-[0_0_35px_#00D9FF]">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/40 mb-3">
                  VERIFIED PARTICIPANT PASS
                </span>
                <h4 className="font-orbitron font-black text-2xl text-white tracking-wider">
                  PASS VALIDATED
                </h4>
                <div className="mt-4 p-4 rounded-2xl bg-[#020e20] border border-[#00D9FF]/30 w-full max-w-sm">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">
                    Scanned Ticket Code:
                  </span>
                  <span className="font-mono font-bold text-base text-[#7CE7FF] break-all">
                    {scannedResult}
                  </span>
                </div>

                <div className="mt-8 flex items-center gap-4 w-full max-w-sm">
                  <button
                    onClick={resetScanner}
                    className="flex-1 py-3 rounded-full glass-panel border border-[#00D9FF]/40 text-xs font-bold text-white hover:text-[#00D9FF] transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Scan Another
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#00D9FF] to-[#0284c7] text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_#00D9FF]"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : activeTab === 'camera' ? (
              /* Camera Scanner View */
              <div className="flex flex-col items-center">
                <div className="relative w-full aspect-square max-w-[320px] rounded-3xl overflow-hidden border-2 border-[#00D9FF]/50 bg-black flex items-center justify-center shadow-[0_0_30px_rgba(0,217,255,0.3)] group">
                  {error ? (
                    <div className="p-6 text-center flex flex-col items-center justify-center">
                      <ShieldAlert className="w-12 h-12 text-amber-400 mb-3" />
                      <p className="text-xs text-gray-300 leading-relaxed mb-4">{error}</p>
                      <button
                        onClick={startCamera}
                        className="px-5 py-2 rounded-full bg-[#00D9FF]/20 text-[#00D9FF] border border-[#00D9FF]/40 text-xs font-bold hover:bg-[#00D9FF] hover:text-black transition-all"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />

                      {/* Sci-Fi Target Framing & Scanning Beam */}
                      <div className="absolute inset-0 pointer-events-none border-[3px] border-transparent border-t-[#00D9FF] border-b-[#00D9FF] opacity-80" />

                      {/* Sci-Fi Corner Markers */}
                      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#00D9FF]" />
                      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#00D9FF]" />
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#00D9FF]" />
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#00D9FF]" />

                      {/* Moving Scanning Beam */}
                      <motion.div
                        animate={{ y: ['0%', '280%', '0%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent shadow-[0_0_15px_#00D9FF]"
                      />

                      {/* Camera Overlay Instructions */}
                      <div className="absolute bottom-3 inset-x-3 py-1.5 px-3 rounded-full bg-[#04162E]/80 backdrop-blur-md border border-[#00D9FF]/30 text-center">
                        <span className="text-[10px] text-[#7CE7FF] font-semibold tracking-wider">
                          ALIGN QR CODE IN FRAME TO SCAN
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Camera Actions */}
                <div className="mt-6 flex items-center justify-between w-full max-w-[320px]">
                  <button
                    onClick={toggleCamera}
                    className="px-4 py-2 rounded-full glass-panel border border-[#00D9FF]/30 text-xs text-gray-300 hover:text-[#00D9FF] hover:border-[#00D9FF] transition-all flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Flip Camera
                  </button>

                  <button
                    onClick={() => handleSimulatedScan()}
                    className="px-4 py-2 rounded-full bg-[#00D9FF]/20 border border-[#00D9FF]/50 text-xs font-bold text-[#00D9FF] hover:bg-[#00D9FF] hover:text-black transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Simulate Scan
                  </button>
                </div>
              </div>
            ) : (
              /* Manual Input View */
              <form onSubmit={handleManualSubmit} className="py-4 flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-bold tracking-widest text-[#7CE7FF] uppercase mb-2">
                    TICKET / PARTICIPANT CODE
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INF26-PASS-984210"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl bg-[#020e20] border border-[#00D9FF]/30 text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-[#00D9FF] focus:shadow-[0_0_15px_rgba(0,217,255,0.4)] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!manualCode.trim()}
                  className="py-3.5 px-8 rounded-full bg-gradient-to-r from-[#00D9FF] via-[#4CCFFF] to-[#00D9FF] text-black font-extrabold text-xs tracking-widest uppercase shadow-[0_0_25px_rgba(0,217,255,0.5)] hover:shadow-[0_0_35px_rgba(0,217,255,0.8)] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  VERIFY CODE NOW
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
