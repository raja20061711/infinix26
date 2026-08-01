'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function SeaTurtleGraphic() {
  return (
    <div className="relative w-full h-[320px] md:h-[400px] flex items-center justify-center overflow-hidden">
      {/* Bioluminescent Ocean Glow */}
      <div className="absolute w-80 h-80 rounded-full bg-[#00D9FF]/20 blur-3xl animate-pulse-glow" />

      {/* Photorealistic 8K Swimming Sea Turtle */}
      <motion.div
        className="relative z-10 w-full max-w-[440px] cursor-pointer filter drop-shadow-[0_20px_40px_rgba(0,217,255,0.4)]"
        initial={{ y: 20, x: -10, rotate: -3 }}
        animate={{
          y: [-14, 14, -14],
          x: [-10, 10, -10],
          rotate: [-3, 3, -3],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <img
          src="/real-turtle.png"
          alt="Photorealistic Underwater Sea Turtle"
          className="w-full h-auto object-contain transform hover:scale-105 transition-transform duration-500 rounded-3xl"
        />

        {/* Trail Bubbles */}
        <motion.div
          className="absolute right-4 top-1/2 w-3 h-3 rounded-full bg-[#00D9FF]/70 blur-[1px]"
          animate={{ x: [0, 40, 80], y: [-5, -25, -45], opacity: [0.8, 0.4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <motion.div
          className="absolute right-12 top-1/3 w-2 h-2 rounded-full bg-[#7CE7FF]/90 blur-[1px]"
          animate={{ x: [0, 30, 60], y: [0, -20, -40], opacity: [1, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
        />
      </motion.div>
    </div>
  );
}
