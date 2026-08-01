'use client';

import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  alphaSpeed: number;
}

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  opacity: number;
  seed: number;
}

export default function CommitteeBackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const bubblesRef = useRef<Bubble[]>([]);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const initPhysics = (w: number, h: number) => {
      // 1. Subtle Moving Particles (20 particles)
      const particles: Particle[] = [];
      for (let i = 0; i < 20; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: Math.random() * 1.5 + 0.5,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15 - 0.05,
          alpha: Math.random() * 0.35 + 0.1,
          alphaSpeed: Math.random() * 0.008 + 0.002,
        });
      }
      particlesRef.current = particles;

      // 2. Very Light Floating Bubbles (12 bubbles)
      const bubbles: Bubble[] = [];
      for (let i = 0; i < 12; i++) {
        bubbles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: Math.random() * 3 + 1,
          speed: Math.random() * 0.5 + 0.2,
          wobbleSpeed: Math.random() * 0.015 + 0.005,
          wobbleAmp: Math.random() * 5 + 2,
          opacity: Math.random() * 0.25 + 0.1,
          seed: Math.random() * 100,
        });
      }
      bubblesRef.current = bubbles;
    };

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initPhysics(canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      timeRef.current += 0.012;
      const time = timeRef.current;

      ctx.clearRect(0, 0, w, h);

      // LAYER 1: Deep Navy Blue Abstract Ocean Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#020b18');
      bgGrad.addColorStop(0.5, '#04162e');
      bgGrad.addColorStop(1, '#01040d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // LAYER 2: Gentle Cyan Ambient Radial Glow (Top-Center)
      const ambientGrad = ctx.createRadialGradient(
        w * 0.5, h * 0.3, w * 0.05,
        w * 0.5, h * 0.3, w * 0.6
      );
      ambientGrad.addColorStop(0, 'rgba(0, 217, 255, 0.08)');
      ambientGrad.addColorStop(0.5, 'rgba(2, 13, 28, 0.04)');
      ambientGrad.addColorStop(1, 'rgba(1, 4, 13, 0)');
      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, w, h);

      // LAYER 3: Minimal Animated Soft Caustic Waves (Calm & Subtle)
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 217, 255, 0.025)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const yOffset = h * (0.2 + i * 0.25);
        ctx.moveTo(0, yOffset);
        for (let x = 0; x <= w; x += 30) {
          const y = yOffset + Math.sin(x * 0.005 + time + i) * 15 + Math.cos(x * 0.008 - time * 0.7) * 10;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();

      // LAYER 4: Soft Moving Particles
      ctx.save();
      particlesRef.current.forEach((p) => {
        p.x += p.vx + Math.sin(time + p.y * 0.01) * 0.15;
        p.y += p.vy;
        p.alpha += Math.sin(time * p.alphaSpeed) * 0.005;

        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.radius), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124, 231, 255, ${Math.max(0.05, Math.min(0.4, p.alpha))})`;
        ctx.fill();
      });
      ctx.restore();

      // LAYER 5: Very Light Floating Bubbles
      ctx.save();
      bubblesRef.current.forEach((b) => {
        b.y -= b.speed;
        const wobbleX = b.x + Math.sin(b.y * b.wobbleSpeed + b.seed) * b.wobbleAmp;

        if (b.y < -20) {
          b.y = h + 20;
          b.x = Math.random() * w;
        }

        ctx.beginPath();
        ctx.arc(wobbleX, b.y, Math.max(0.8, b.radius), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(124, 231, 255, ${b.opacity * 0.6})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = `rgba(0, 217, 255, ${b.opacity * 0.08})`;
        ctx.fill();
      });
      ctx.restore();

      // LAYER 6: Subtle Edge Vignette
      const vignetteGrad = ctx.createRadialGradient(
        w * 0.5, h * 0.5, Math.max(10, w * 0.35),
        w * 0.5, h * 0.5, Math.max(50, w * 0.75)
      );
      vignetteGrad.addColorStop(0, 'rgba(1, 4, 13, 0)');
      vignetteGrad.addColorStop(1, 'rgba(1, 4, 13, 0.75)');
      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, w, h);

      animationFrameId = requestAnimationFrame(render);
    };

    loop();

    function loop() {
      render();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
