'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function TiltCard({ children, className = '' }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const rX = ((mouseY - height / 2) / height) * -14;
      const rY = ((mouseX - width / 2) / width) * 14;

      setRotateX(rX);
      setRotateY(rY);

      setGlarePos({
        x: (mouseX / width) * 100,
        y: (mouseY / height) * 100,
        opacity: 0.2,
      });
    });
  };

  const handleMouseLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setRotateX(0);
    setRotateY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 250, mass: 0.1 }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Glare Reflection Layer */}
      <div
        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(0, 217, 255, 0.35) 0%, transparent 60%)`,
          opacity: glarePos.opacity,
        }}
      />

      <div style={{ transform: 'translateZ(20px)' }}>{children}</div>
    </motion.div>
  );
}

