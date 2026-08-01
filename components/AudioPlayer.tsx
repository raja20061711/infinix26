'use client';

import React, { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  isPlaying: boolean;
}

export default function AudioPlayer({ isPlaying }: AudioPlayerProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (isPlaying) {
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const ctx = new AudioContextClass();
          audioCtxRef.current = ctx;

          // Main Gain
          const masterGain = ctx.createGain();
          masterGain.gain.setValueAtTime(0.08, ctx.currentTime);
          masterGain.connect(ctx.destination);
          gainNodeRef.current = masterGain;

          // Deep Ocean Drone Oscillator 1 (Low Sine wave)
          const osc1 = ctx.createOscillator();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(55, ctx.currentTime); // A1 note

          // Filter for deep ocean pressure sound
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(220, ctx.currentTime);

          osc1.connect(filter);
          filter.connect(masterGain);
          osc1.start();
          osc1Ref.current = osc1;

          // Secondary Sub Synth Osc 2 (Gentle pitch modulation)
          const osc2 = ctx.createOscillator();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(110, ctx.currentTime);
          const filter2 = ctx.createBiquadFilter();
          filter2.type = 'lowpass';
          filter2.frequency.setValueAtTime(300, ctx.currentTime);

          osc2.connect(filter2);
          filter2.connect(masterGain);
          osc2.start();
          osc2Ref.current = osc2;
        } else if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
      } catch (err) {
        console.warn('Audio play restricted by browser policy:', err);
      }
    } else {
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        audioCtxRef.current.suspend();
      }
    }
  }, [isPlaying]);

  return null;
}
