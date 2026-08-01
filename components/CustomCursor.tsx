'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.dataset.hoverable === 'true'
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const render = () => {
      // Smooth interpolation for outer ring
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX - 6}px, ${mouseY - 6}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX - 20}px, ${ringY - 20}px, 0)`;
      }

      rafId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* Inner Dot Cursor */}
      <div
        ref={dotRef}
        style={{ willChange: 'transform' }}
        className={`fixed top-0 left-0 w-3 h-3 bg-[#00D9FF] rounded-full pointer-events-none z-[9999] shadow-[0_0_12px_#00D9FF] transition-scale duration-200 ${
          isHovered ? 'scale-[1.8]' : 'scale-100'
        }`}
      />

      {/* Outer Glowing Ring */}
      <div
        ref={ringRef}
        style={{ willChange: 'transform' }}
        className={`fixed top-0 left-0 w-10 h-10 border rounded-full pointer-events-none z-[9998] bg-[#00D9FF]/5 backdrop-blur-[1px] transition-all duration-200 ${
          isHovered
            ? 'scale-[1.6] border-[#7CE7FF]'
            : 'scale-100 border-[#00D9FF]/40'
        }`}
      />
    </>
  );
}

