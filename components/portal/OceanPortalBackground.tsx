'use client';

import React, { useEffect, useRef } from 'react';

export default function OceanPortalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Subtle 2D Particles & Bubbles
    const particles: { x: number; y: number; radius: number; speedY: number; wobble: number; opacity: number }[] = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 0.8,
        speedY: Math.random() * 0.6 + 0.2,
        wobble: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.4 + 0.15,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep Navy Abyssal Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#020b18');
      grad.addColorStop(0.5, '#04162e');
      grad.addColorStop(1, '#01050e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Soft Underwater Radial Fog Spotlights
      const fog1 = ctx.createRadialGradient(width * 0.5, height * 0.3, 20, width * 0.5, height * 0.3, width * 0.6);
      fog1.addColorStop(0, 'rgba(0, 217, 255, 0.08)');
      fog1.addColorStop(1, 'rgba(1, 5, 14, 0)');
      ctx.fillStyle = fog1;
      ctx.fillRect(0, 0, width, height);

      // Draw Subtle Floating Bubbles & Particles
      particles.forEach((p) => {
        p.y -= p.speedY;
        p.wobble += 0.02;
        const xPos = p.x + Math.sin(p.wobble) * 8;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(xPos, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124, 231, 255, ${p.opacity})`;
        ctx.shadowColor = '#00D9FF';
        ctx.shadowBlur = 4;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#01050e]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
    </div>
  );
}
