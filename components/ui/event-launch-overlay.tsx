"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EventLaunchOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
}

export function EventLaunchOverlay({ isVisible, onComplete }: EventLaunchOverlayProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onComplete, 3200);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8 } }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, #001a0a 0%, #000000 100%)" }}
        >
          {/* Radiating rings */}
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-emerald-400"
              initial={{ width: 80, height: 80, opacity: 0.9 }}
              animate={{ width: 1800, height: 1800, opacity: 0 }}
              transition={{
                duration: 2.5,
                delay: i * 0.22,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Center flash burst */}
          <motion.div
            className="absolute w-32 h-32 rounded-full"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 12, opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ background: "radial-gradient(circle, #00ffaa 0%, #00D9FF 50%, transparent 100%)" }}
          />

          {/* Particle streaks */}
          {Array.from({ length: 20 }).map((_, i) => {
            const angle = (i / 20) * 360;
            const rad = (angle * Math.PI) / 180;
            return (
              <motion.div
                key={`streak-${i}`}
                className="absolute w-1 rounded-full"
                style={{
                  height: `${40 + Math.random() * 60}px`,
                  background: i % 2 === 0
                    ? "linear-gradient(to top, #00ffaa, transparent)"
                    : "linear-gradient(to top, #00D9FF, transparent)",
                  left: "50%",
                  top: "50%",
                  transformOrigin: "bottom center",
                  rotate: `${angle}deg`,
                }}
                initial={{ scaleY: 0, opacity: 0, x: "-50%", y: "-100%" }}
                animate={{
                  scaleY: [0, 1, 0],
                  opacity: [0, 1, 0],
                  x: `calc(-50% + ${Math.cos(rad) * 200}px)`,
                  y: `calc(-100% + ${Math.sin(rad) * 200}px)`,
                }}
                transition={{
                  duration: 1.4,
                  delay: 0.1 + (i % 5) * 0.05,
                  ease: "easeOut",
                }}
              />
            );
          })}

          {/* Central content */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-4 text-center"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              src="/infinix-event-logo-clean.png"
              alt="INFINIX'26"
              className="w-24 h-24 object-contain"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.4 }}
              style={{ filter: "drop-shadow(0 0 30px #00ffaa) drop-shadow(0 0 60px #00D9FF)" }}
            />

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="font-orbitron font-black text-4xl sm:text-6xl text-white tracking-widest uppercase"
                style={{ textShadow: "0 0 30px #00ffaa, 0 0 60px #00D9FF" }}>
                🚀 EVENT LIVE!
              </div>
              <div className="font-orbitron text-emerald-400 text-sm tracking-[0.4em] uppercase mt-2">
                INFINIX&apos;26 HACKATHON IS STARTED
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
