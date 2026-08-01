'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function UnderwaterCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 32);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 1. Bioluminescent Floating Particles & Ocean Dust
    const particleCount = 850;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 70;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x7ce7ff,
      size: 0.36,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 2. Rising Underwater Bubbles
    const bubbleCount = 65;
    const bubbleGroup = new THREE.Group();
    const bubbleSphereGeo = new THREE.SphereGeometry(0.3, 12, 12);
    const bubbleSphereMat = new THREE.MeshBasicMaterial({
      color: 0x7ce7ff,
      transparent: true,
      opacity: 0.45,
    });

    const bubbles: { mesh: THREE.Mesh; speed: number; wobbleSpeed: number; initialX: number }[] = [];

    for (let i = 0; i < bubbleCount; i++) {
      const mesh = new THREE.Mesh(bubbleSphereGeo, bubbleSphereMat);
      const x = (Math.random() - 0.5) * 80;
      const y = (Math.random() - 0.5) * 180;
      const z = (Math.random() - 0.5) * 35;
      const scale = Math.random() * 0.8 + 0.35;
      mesh.scale.set(scale, scale, scale);
      mesh.position.set(x, y, z);
      bubbleGroup.add(mesh);
      bubbles.push({
        mesh,
        speed: Math.random() * 0.05 + 0.02,
        wobbleSpeed: Math.random() * 2 + 1,
        initialX: x,
      });
    }
    scene.add(bubbleGroup);

    // 3. Photorealistic Swimming 3D Fish with Tail-Wagging Physics
    const textureLoader = new THREE.TextureLoader();
    const fishTexture = textureLoader.load('/fish.png');

    const fishGroup = new THREE.Group();
    const fishCount = 35;
    const fishGeo = new THREE.PlaneGeometry(3.8, 2.2);
    const fishMat = new THREE.MeshBasicMaterial({
      map: fishTexture,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    const fishes: {
      mesh: THREE.Mesh;
      speed: number;
      yBase: number;
      wagSpeed: number;
      offset: number;
      swimDirection: number;
    }[] = [];

    for (let i = 0; i < fishCount; i++) {
      const fishMesh = new THREE.Mesh(fishGeo, fishMat);
      const scale = Math.random() * 0.5 + 0.5;
      fishMesh.scale.set(scale, scale, scale);

      const direction = Math.random() > 0.5 ? 1 : -1;
      if (direction < 0) {
        fishMesh.scale.x = -scale;
      }

      const x = (Math.random() - 0.5) * 120;
      const y = (Math.random() - 0.5) * 180;
      const z = (Math.random() - 0.5) * 30 - 5;

      fishMesh.position.set(x, y, z);
      fishGroup.add(fishMesh);

      fishes.push({
        mesh: fishMesh,
        speed: (Math.random() * 0.06 + 0.03) * direction,
        yBase: y,
        wagSpeed: Math.random() * 6 + 4,
        offset: Math.random() * 10,
        swimDirection: direction,
      });
    }
    scene.add(fishGroup);

    // Scroll State ONLY (Camera Mouse Motion Controls Removed for Stability)
    let targetScrollY = 0;
    let currentScrollY = 0;

    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth Scroll Interpolation for Diving Physics
      currentScrollY += (targetScrollY - currentScrollY) * 0.04;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
      const scrollProgress = currentScrollY / maxScroll;

      // Stable Scroll-Driven Parallax on Ocean Image (No Mouse Tilt Displacement)
      if (bgRef.current) {
        const moveY = scrollProgress * -120;
        const scaleZoom = 1.05 + scrollProgress * 0.25;
        bgRef.current.style.transform = `scale(${scaleZoom}) translate3d(0px, ${moveY}px, 0px)`;
      }

      // Stable Camera Position (No Mouse Motion Wobble)
      camera.position.x = 0;
      camera.position.y = -scrollProgress * 85;
      camera.position.z = 32 - Math.sin(scrollProgress * Math.PI) * 6;
      camera.rotation.x = -scrollProgress * 0.15;

      // Particles Motion
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(elapsedTime + i) * 0.005;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      // Bubbles Motion
      bubbles.forEach((b) => {
        b.mesh.position.y += b.speed;
        b.mesh.position.x = b.initialX + Math.sin(elapsedTime * b.wobbleSpeed) * 0.85;
      });

      // 3D Fish Physics & Tail Wagging Motion
      fishes.forEach((f) => {
        f.mesh.position.x += f.speed;
        f.mesh.position.y = f.yBase + Math.sin(elapsedTime * 1.5 + f.offset) * 0.6;
        f.mesh.rotation.z = Math.sin(elapsedTime * f.wagSpeed + f.offset) * 0.12 * f.swimDirection;

        if (f.swimDirection > 0 && f.mesh.position.x > 60) {
          f.mesh.position.x = -60;
        } else if (f.swimDirection < 0 && f.mesh.position.x < -60) {
          f.mesh.position.x = 60;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#01040d]">
      {/* Dark Abyssal Ocean Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover opacity-90 brightness-[0.88] contrast-[1.12] transition-transform duration-75 ease-out"
        style={{
          backgroundImage: `url('/user-target-ocean.png')`,
          backgroundPosition: 'center 25%',
          imageRendering: 'crisp-edges',
        }}
      />

      {/* Elegant Soft Top Surface Water Light Blending Overlay */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#00D9FF]/15 via-[#04162E]/10 to-transparent pointer-events-none z-1" />

      {/* Deep Ocean Vignette for Contrast */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_#01040d_95%)] pointer-events-none z-1" />

      {/* 3D WebGL Swimming Fish, Bubbles & Dust Canvas */}
      <div ref={containerRef} className="absolute inset-0 z-1" />
    </div>
  );
}
