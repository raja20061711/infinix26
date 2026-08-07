"use client";

import React, { useId } from "react";

interface ShinyButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "start" | "stop";
  disabled?: boolean;
}

export function ShinyButton({
  children,
  onClick,
  className = "",
  variant = "start",
  disabled = false,
}: ShinyButtonProps) {
  const isStart = variant === "start";
  const id = useId().replace(/:/g, "");

  const highlight = isStart ? "#00ffaa" : "#ff2a55";
  const highlightSubtle = isStart ? "#55ffcc" : "#ff6680";
  const bg = isStart ? "#010d07" : "#0d0105";
  const bgSubtle = isStart ? "#071a0f" : "#1a0508";
  const glow40 = isStart ? "rgba(0,255,170,0.4)" : "rgba(255,42,85,0.4)";
  const glow20 = isStart ? "rgba(0,255,170,0.2)" : "rgba(255,42,85,0.2)";
  const glow80 = isStart ? "rgba(0,255,170,0.8)" : "rgba(255,42,85,0.8)";
  const glow50 = isStart ? "rgba(0,255,170,0.5)" : "rgba(255,42,85,0.5)";

  const cssText = `
    @property --ga-${id} {
      syntax: "<angle>"; initial-value: 0deg; inherits: false;
    }
    @property --gao-${id} {
      syntax: "<angle>"; initial-value: 0deg; inherits: false;
    }
    @property --gp-${id} {
      syntax: "<percentage>"; initial-value: 5%; inherits: false;
    }
    @property --gs-${id} {
      syntax: "<color>"; initial-value: white; inherits: false;
    }

    .shiny-btn-${id} {
      isolation: isolate;
      position: relative;
      overflow: hidden;
      cursor: ${disabled ? "not-allowed" : "pointer"};
      opacity: ${disabled ? "0.6" : "1"};
      padding: 0;
      width: 100%;
      height: 100%;
      min-height: 140px;
      font-family: 'Orbitron', sans-serif;
      font-size: 1.5rem;
      font-weight: 900;
      letter-spacing: 0.15em;
      border: 2px solid transparent;
      border-radius: 24px;
      color: #ffffff;
      background:
        linear-gradient(${bg}, ${bg}) padding-box,
        conic-gradient(
          from calc(var(--ga-${id}) - var(--gao-${id})),
          transparent,
          ${highlight} var(--gp-${id}),
          var(--gs-${id}) calc(var(--gp-${id}) * 2),
          ${highlight} calc(var(--gp-${id}) * 3),
          transparent calc(var(--gp-${id}) * 4)
        ) border-box;
      box-shadow:
        inset 0 0 0 1px ${bgSubtle},
        0 0 60px ${glow40},
        0 0 120px ${glow20};
      transition: --gao-${id} 800ms cubic-bezier(0.25,1,0.5,1),
                  --gp-${id}  800ms cubic-bezier(0.25,1,0.5,1),
                  --gs-${id}  800ms cubic-bezier(0.25,1,0.5,1),
                  box-shadow  800ms cubic-bezier(0.25,1,0.5,1),
                  transform   800ms cubic-bezier(0.25,1,0.5,1);
      animation: shiny-ga-${id} 3s linear infinite,
                 shiny-ga-${id} 7.5s linear infinite reverse paused;
      animation-composition: add;
    }

    .shiny-btn-${id}::before {
      content: '';
      pointer-events: none;
      position: absolute;
      inset-inline-start: 50%;
      inset-block-start: 50%;
      translate: -50% -50%;
      z-index: -1;
      --size: calc(100% - 6px);
      width: var(--size);
      height: var(--size);
      background: radial-gradient(
        circle at 2px 2px,
        white calc(2px / 4),
        transparent 0
      ) padding-box;
      background-size: 4px 4px;
      background-repeat: space;
      mask-image: conic-gradient(
        from calc(var(--ga-${id}) + 45deg),
        black,
        transparent 10% 90%,
        black
      );
      border-radius: inherit;
      opacity: 0.3;
      animation: shiny-ga-${id} 3s linear infinite,
                 shiny-ga-${id} 7.5s linear infinite reverse paused;
      animation-composition: add;
    }

    .shiny-btn-${id}::after {
      content: '';
      pointer-events: none;
      position: absolute;
      inset-inline-start: 50%;
      inset-block-start: 50%;
      translate: -50% -50%;
      z-index: -1;
      width: 100%;
      aspect-ratio: 1;
      background: linear-gradient(
        -50deg,
        transparent,
        ${highlight},
        transparent
      );
      mask-image: radial-gradient(circle at bottom, transparent 40%, black);
      opacity: 0.5;
      animation: shiny-shimmer-${id} 3s linear infinite,
                 shiny-shimmer-${id} 7.5s linear infinite reverse paused;
      animation-composition: add;
    }

    .shiny-btn-${id} .shiny-inner {
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    .shiny-btn-${id} .shiny-inner::before {
      content: '';
      pointer-events: none;
      position: absolute;
      inset-inline-start: 50%;
      inset-block-start: 50%;
      translate: -50% -50%;
      z-index: -1;
      --size: calc(100% + 1rem);
      width: var(--size);
      height: var(--size);
      box-shadow: inset 0 -1ex 2rem 4px ${highlight};
      opacity: 0;
      transition: opacity 800ms cubic-bezier(0.25,1,0.5,1);
      animation: shiny-breathe-${id} 4.5s linear infinite;
    }

    .shiny-btn-${id}:not(:disabled):is(:hover,:focus-visible) {
      --gp-${id}: 20%;
      --gao-${id}: 95deg;
      --gs-${id}: ${highlightSubtle};
      box-shadow:
        inset 0 0 0 1px ${bgSubtle},
        0 0 80px ${glow80},
        0 0 160px ${glow50};
      transform: scale(1.01);
    }

    .shiny-btn-${id}:not(:disabled):is(:hover,:focus-visible),
    .shiny-btn-${id}:not(:disabled):is(:hover,:focus-visible)::before,
    .shiny-btn-${id}:not(:disabled):is(:hover,:focus-visible)::after {
      animation-play-state: running;
    }

    .shiny-btn-${id}:not(:disabled):is(:hover,:focus-visible) .shiny-inner::before {
      opacity: 1;
    }

    .shiny-btn-${id}:active:not(:disabled) {
      transform: scale(0.98);
    }

    @keyframes shiny-ga-${id} {
      to { --ga-${id}: 360deg; }
    }
    @keyframes shiny-shimmer-${id} {
      to { rotate: 360deg; }
    }
    @keyframes shiny-breathe-${id} {
      from, to { scale: 1; }
      50% { scale: 1.2; }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssText }} />
      <button
        className={`shiny-btn-${id} ${className}`}
        onClick={!disabled ? onClick : undefined}
        disabled={disabled}
      >
        <span className="shiny-inner">{children}</span>
      </button>
    </>
  );
}
