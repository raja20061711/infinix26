'use client';

import React, { useEffect, useRef } from 'react';

export default function WaterRippleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const ripples: { x: number; y: number; radius: number; maxRadius: number; opacity: number; speed: number }[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      // Spawn subtle water ripple ring on mouse movement
      if (Math.random() > 0.4) {
        ripples.push({
          x: e.clientX,
          y: e.clientY,
          radius: 2,
          maxRadius: Math.random() * 60 + 40,
          opacity: 0.5,
          speed: Math.random() * 1.5 + 1,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.opacity = 0.5 * (1 - r.radius / r.maxRadius);

        if (r.radius >= r.maxRadius || r.opacity <= 0) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 217, 255, ${r.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#00D9FF';
        ctx.shadowBlur = 8;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20 mix-blend-screen"
    />
  );
}
