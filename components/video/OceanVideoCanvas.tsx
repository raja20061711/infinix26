'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const TOTAL_FRAMES = 150;

// Helper to format frame filename e.g. /frames/frame_001.webp
const getFrameSrc = (index: number) => {
  const frameNum = String(index + 1).padStart(3, '0');
  return `/frames/frame_${frameNum}.webp`;
};

// Data Structures for Subtle Natural Underwater Environment Physics
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

interface Plankton {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  alphaSpeed: number;
}

export default function OceanVideoCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const currentFrameRef = useRef<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Environment Physics State
  const bubblesRef = useRef<Bubble[]>([]);
  const planktonRef = useRef<Plankton[]>([]);
  const timeRef = useRef<number>(0);

  const fogGradRef = useRef<CanvasGradient | null>(null);
  const vignetteGradRef = useRef<CanvasGradient | null>(null);

  // Initialize Physics & Gradients
  const initEnvironmentPhysics = (width: number, height: number, ctx: CanvasRenderingContext2D) => {
    const safeW = Math.max(300, width);
    const safeH = Math.max(300, height);

    // 1. Soft Floating Bubbles (15 bubbles)
    const bubbles: Bubble[] = [];
    for (let i = 0; i < 15; i++) {
      bubbles.push({
        x: Math.random() * safeW,
        y: Math.random() * safeH,
        radius: Math.random() * 3.5 + 1.2,
        speed: Math.random() * 0.7 + 0.3,
        wobbleSpeed: Math.random() * 0.02 + 0.01,
        wobbleAmp: Math.random() * 6 + 2,
        opacity: Math.random() * 0.35 + 0.15,
        seed: Math.random() * 100,
      });
    }
    bubblesRef.current = bubbles;

    // 2. Soft Floating Plankton Particles (25 particles)
    const plankton: Plankton[] = [];
    for (let i = 0; i < 25; i++) {
      plankton.push({
        x: Math.random() * safeW,
        y: Math.random() * safeH,
        radius: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2 - 0.08,
        alpha: Math.random() * 0.4 + 0.15,
        alphaSpeed: Math.random() * 0.012 + 0.003,
      });
    }
    planktonRef.current = plankton;

    // Cache static gradients once on resize
    const fogGrad = ctx.createLinearGradient(0, 0, 0, height);
    fogGrad.addColorStop(0, 'rgba(4, 22, 46, 0.35)');
    fogGrad.addColorStop(0.4, 'rgba(2, 13, 28, 0.45)');
    fogGrad.addColorStop(1, 'rgba(1, 4, 13, 0.85)');
    fogGradRef.current = fogGrad;

    const safeR1 = Math.max(10, width * 0.3);
    const safeR2 = Math.max(50, width * 0.8);
    const vignetteGrad = ctx.createRadialGradient(
      width * 0.5, height * 0.4, safeR1,
      width * 0.5, height * 0.4, safeR2
    );
    vignetteGrad.addColorStop(0, 'rgba(1, 4, 13, 0.1)');
    vignetteGrad.addColorStop(0.6, 'rgba(1, 4, 13, 0.45)');
    vignetteGrad.addColorStop(1, 'rgba(1, 4, 13, 0.94)');
    vignetteGradRef.current = vignetteGrad;
  };

  // Preload image helper
  const preloadImage = (index: number): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      if (index < 0 || index >= TOTAL_FRAMES) return;
      if (imagesRef.current[index]) {
        resolve(imagesRef.current[index]!);
        return;
      }

      const img = new Image();
      img.src = getFrameSrc(index);
      img.onload = () => {
        imagesRef.current[index] = img;
        resolve(img);
      };
      img.onerror = () => {
        resolve(img);
      };
    });
  };

  // Preload nearby window of frames
  const preloadNearbyFrames = (centerIndex: number, range: number = 20) => {
    const start = Math.max(0, centerIndex - 5);
    const end = Math.min(TOTAL_FRAMES - 1, centerIndex + range);
    for (let i = start; i <= end; i++) {
      if (!imagesRef.current[i]) {
        preloadImage(i);
      }
    }
  };

  // Find nearest loaded image
  const getNearestLoadedImage = (targetIndex: number): HTMLImageElement | null => {
    if (imagesRef.current[targetIndex] && imagesRef.current[targetIndex]!.complete && imagesRef.current[targetIndex]!.naturalWidth > 0) {
      return imagesRef.current[targetIndex];
    }
    for (let i = targetIndex - 1; i >= 0; i--) {
      if (imagesRef.current[i] && imagesRef.current[i]!.complete && imagesRef.current[i]!.naturalWidth > 0) {
        return imagesRef.current[i];
      }
    }
    for (let i = targetIndex + 1; i < TOTAL_FRAMES; i++) {
      if (imagesRef.current[i] && imagesRef.current[i]!.complete && imagesRef.current[i]!.naturalWidth > 0) {
        return imagesRef.current[i];
      }
    }
    return null;
  };

  // Render Scene (Natural Underwater Lighting, No God Rays, No Spotlight)
  const renderScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = Math.max(300, window.innerWidth);
    const height = Math.max(300, window.innerHeight);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      initEnvironmentPhysics(width, height, ctx);
    }

    timeRef.current += 0.016;
    const time = timeRef.current;

    ctx.clearRect(0, 0, width, height);

    // -------------------------------------------------------------
    // LAYER 1: Base WebP Underwater Video Sequence Frame
    // -------------------------------------------------------------
    const img = getNearestLoadedImage(currentFrameRef.current);
    if (img) {
      const imgAspect = (img.width && img.height) ? (img.width / img.height) : (16 / 9);
      const canvasAspect = width / height;

      let drawWidth = width;
      let drawHeight = height;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasAspect > imgAspect) {
        drawHeight = width / imgAspect;
        offsetY = (height - drawHeight) / 2;
      } else {
        drawWidth = height * imgAspect;
        offsetX = (width - drawWidth) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    } else {
      // Deep ocean fallback gradient if video frame is initializing
      if (fogGradRef.current) {
        ctx.fillStyle = fogGradRef.current;
        ctx.fillRect(0, 0, width, height);
      }
    }

    // -------------------------------------------------------------
    // LAYER 2: Soft Drifting Plankton Particles
    // -------------------------------------------------------------
    ctx.save();
    planktonRef.current.forEach((p) => {
      p.x += p.vx + Math.sin(time + p.y * 0.01) * 0.2;
      p.y += p.vy;
      p.alpha += Math.sin(time * p.alphaSpeed) * 0.008;

      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, p.radius), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(124, 231, 255, ${Math.max(0.08, Math.min(0.6, p.alpha))})`;
      ctx.fill();
    });
    ctx.restore();

    // -------------------------------------------------------------
    // LAYER 3: Tiny Floating Bubbles System
    // -------------------------------------------------------------
    ctx.save();
    bubblesRef.current.forEach((b) => {
      b.y -= b.speed;
      const wobbleX = b.x + Math.sin(b.y * b.wobbleSpeed + b.seed) * b.wobbleAmp;

      if (b.y < -20) {
        b.y = height + 20;
        b.x = Math.random() * width;
      }

      ctx.beginPath();
      ctx.arc(wobbleX, b.y, Math.max(1, b.radius), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(124, 231, 255, ${b.opacity})`;
      ctx.lineWidth = 1.1;
      ctx.stroke();

      ctx.fillStyle = `rgba(0, 217, 255, ${b.opacity * 0.12})`;
      ctx.fill();

      // Top-left Specular Highlight
      ctx.beginPath();
      ctx.arc(
        wobbleX - b.radius * 0.35,
        b.y - b.radius * 0.35,
        Math.max(0.5, b.radius * 0.28),
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.85})`;
      ctx.fill();
    });
    ctx.restore();

    // -------------------------------------------------------------
    // LAYER 4: Subtle Underwater Fog & Dark Premium Vignette
    // -------------------------------------------------------------
    if (fogGradRef.current) {
      ctx.fillStyle = fogGradRef.current;
      ctx.fillRect(0, 0, width, height);
    }

    if (vignetteGradRef.current) {
      ctx.fillStyle = vignetteGradRef.current;
      ctx.fillRect(0, 0, width, height);
    }
  };

  // Continuous RAF loop for living natural underwater movement
  useEffect(() => {
    let animationFrameId: number;

    const loop = () => {
      renderScene();
      animationFrameId = requestAnimationFrame(loop);
    };

    // Initialize initial batch of WebP frames
    const initialBatchPromises: Promise<HTMLImageElement>[] = [];
    for (let i = 0; i < Math.min(30, TOTAL_FRAMES); i++) {
      initialBatchPromises.push(preloadImage(i));
    }

    Promise.allSettled(initialBatchPromises).then(() => {
      setIsLoaded(true);

      // Preload remaining frames in background
      for (let i = 30; i < TOTAL_FRAMES; i++) {
        setTimeout(() => {
          preloadImage(i);
        }, (i - 30) * 10);
      }
    });

    loop();

    const handleResize = () => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          initEnvironmentPhysics(window.innerWidth, window.innerHeight, ctx);
        }
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // GSAP ScrollTrigger setup to scrub video frame index based on scroll position
  useEffect(() => {
    if (!isLoaded) return;

    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.1,
      onUpdate: (self) => {
        const progress = Math.max(0, Math.min(1, self.progress));
        const targetFrame = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES));
        currentFrameRef.current = targetFrame;
        preloadNearbyFrames(targetFrame);
      },
    });

    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
    };
  }, [isLoaded]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#01040d]">
      {/* Clean Premium Underwater Video Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          filter: 'contrast(1.12) brightness(0.9) saturate(1.2)',
        }}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Fallback Poster Background until frames load */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-cover opacity-90 brightness-[0.88] contrast-[1.12]"
          style={{
            backgroundImage: `url('/user-target-ocean.png')`,
            backgroundPosition: 'center 25%',
          }}
        />
      )}
    </div>
  );
}
