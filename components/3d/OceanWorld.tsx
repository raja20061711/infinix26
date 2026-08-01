'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function OceanWorld() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup with Abyssal Dark Ocean Void (#01040d)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x01040d);

    // Dynamic Distance Fog that thickens with depth
    const fog = new THREE.FogExp2(0x01040d, 0.012);
    scene.fog = fog;

    // Camera setup
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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    containerRef.current.appendChild(renderer.domElement);

    // 1. Water Surface (Top Animated Wave Surface)
    const surfaceGeo = new THREE.PlaneGeometry(140, 140, 48, 48);
    const surfaceMat = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const waterSurface = new THREE.Mesh(surfaceGeo, surfaceMat);
    waterSurface.position.set(0, 42, -5);
    waterSurface.rotation.x = Math.PI / 2.2;
    scene.add(waterSurface);

    // 2. Volumetric God Rays (18 Light Rays Streaming Down)
    const raysGroup = new THREE.Group();
    const rayGeo = new THREE.CylinderGeometry(0.3, 16, 140, 16, 1, true);
    const rayMat = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    for (let i = 0; i < 18; i++) {
      const ray = new THREE.Mesh(rayGeo, rayMat);
      ray.position.set((Math.random() - 0.5) * 100, 45, (Math.random() - 0.5) * 45);
      ray.rotation.z = (Math.random() - 0.5) * 0.35 - 0.15;
      ray.rotation.x = (Math.random() - 0.5) * 0.2;
      raysGroup.add(ray);
    }
    scene.add(raysGroup);

    // 3. Bioluminescent Plankton & Floating Ocean Particles
    const particleCount = 1200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 160;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 320; // Spans entire depth
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
      particleScales[i] = Math.random() * 0.45 + 0.1;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('scale', new THREE.BufferAttribute(particleScales, 1));

    const particleMat = new THREE.PointsMaterial({
      color: 0x7ce7ff,
      size: 0.38,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 4. Bubble Particle Emitter System (1500 Bubbles)
    const bubbleCount = 90;
    const bubbleGroup = new THREE.Group();
    const bubbleSphereGeo = new THREE.SphereGeometry(0.3, 12, 12);
    const bubbleSphereMat = new THREE.MeshBasicMaterial({
      color: 0x4ccfff,
      transparent: true,
      opacity: 0.45,
    });

    const bubbles: { mesh: THREE.Mesh; speed: number; wobbleSpeed: number; initialX: number }[] = [];

    for (let i = 0; i < bubbleCount; i++) {
      const mesh = new THREE.Mesh(bubbleSphereGeo, bubbleSphereMat);
      const x = (Math.random() - 0.5) * 90;
      const y = (Math.random() - 0.5) * 300;
      const z = (Math.random() - 0.5) * 45;
      const scale = Math.random() * 0.85 + 0.35;
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

    // 5. Realistic Procedural 3D Swimming Fish School with Tail & Fin Physics
    const fishGroup = new THREE.Group();
    const fishCount = 45;

    // Create 3D Fish Geometry (Body + Tail Fin)
    const createFishGeometry = () => {
      const fishShape = new THREE.Shape();
      fishShape.moveTo(0, 0);
      fishShape.quadraticCurveTo(1.2, 0.7, 2.5, 0);
      fishShape.quadraticCurveTo(3.2, 0, 3.8, 0.5); // Upper Tail
      fishShape.lineTo(3.8, -0.5); // Lower Tail
      fishShape.quadraticCurveTo(3.2, 0, 2.5, 0);
      fishShape.quadraticCurveTo(1.2, -0.7, 0, 0);

      const extrudeSettings = {
        depth: 0.3,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.1,
        bevelThickness: 0.1,
      };

      return new THREE.ExtrudeGeometry(fishShape, extrudeSettings);
    };

    const fishGeo = createFishGeometry();
    const fishMat = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      wireframe: false,
      transparent: true,
      opacity: 0.85,
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
      const scale = Math.random() * 0.4 + 0.35;
      fishMesh.scale.set(scale, scale, scale);

      const direction = Math.random() > 0.5 ? 1 : -1;
      if (direction < 0) {
        fishMesh.rotation.y = Math.PI;
      }

      const x = (Math.random() - 0.5) * 130;
      const y = (Math.random() - 0.5) * 240;
      const z = (Math.random() - 0.5) * 40 - 5;

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

    // 6. Realistic 3D Swimming Sea Turtle in Section 2 (About Depth y = -25)
    const turtleGroup = new THREE.Group();
    const turtleBodyGeo = new THREE.SphereGeometry(2.5, 16, 12);
    turtleBodyGeo.scale(1.5, 0.6, 1);
    const turtleMat = new THREE.MeshBasicMaterial({
      color: 0x062848,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });

    const turtleMesh = new THREE.Mesh(turtleBodyGeo, turtleMat);

    // Front Flippers
    const flipperGeo = new THREE.BoxGeometry(3, 0.2, 1);
    const flipperL = new THREE.Mesh(flipperGeo, turtleMat);
    flipperL.position.set(1.5, 0, 1.5);
    flipperL.rotation.y = 0.4;
    const flipperR = new THREE.Mesh(flipperGeo, turtleMat);
    flipperR.position.set(1.5, 0, -1.5);
    flipperR.rotation.y = -0.4;

    turtleGroup.add(turtleMesh, flipperL, flipperR);
    turtleGroup.position.set(-30, -25, -5);
    scene.add(turtleGroup);

    // Mouse & Scroll State for 3D Camera Diving Physics
    let mouseX = 0;
    let mouseY = 0;
    let targetScrollY = 0;
    let currentScrollY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth Scroll Interpolation for Ocean Diving Physics
      currentScrollY += (targetScrollY - currentScrollY) * 0.04;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
      const scrollProgress = currentScrollY / maxScroll;

      // Dynamic Fog Density thickening with depth
      fog.density = 0.012 + scrollProgress * 0.018;

      // 3D Camera Diving Travel
      const targetCamY = -scrollProgress * 110;
      const targetCamZ = 32 - Math.sin(scrollProgress * Math.PI) * 6;
      const targetRotX = -scrollProgress * 0.18;

      camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
      camera.position.y += (targetCamY + (-mouseY * 3) - camera.position.y) * 0.04;
      camera.position.z += (targetCamZ - camera.position.z) * 0.04;
      camera.rotation.x += (targetRotX - camera.rotation.x) * 0.04;

      // Water Surface Waves Animation
      const surfPos = waterSurface.geometry.attributes.position;
      for (let i = 0; i < surfPos.count; i++) {
        const u = surfPos.getX(i);
        const v = surfPos.getY(i);
        const z = Math.sin(u * 0.12 + elapsedTime * 1.5) * Math.cos(v * 0.12 + elapsedTime * 1.2) * 0.8;
        surfPos.setZ(i, z);
      }
      waterSurface.geometry.attributes.position.needsUpdate = true;

      // Light Rays Motion
      raysGroup.rotation.y = Math.sin(elapsedTime * 0.08) * 0.07;

      // Particles Motion
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(elapsedTime + i) * 0.005;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      // Bubbles Emitter Motion
      bubbles.forEach((b) => {
        b.mesh.position.y += b.speed + scrollProgress * 0.02;
        b.mesh.position.x = b.initialX + Math.sin(elapsedTime * b.wobbleSpeed) * 0.85;
        if (b.mesh.position.y > 50) {
          b.mesh.position.y = -250;
        }
      });

      // 3D Procedural Fish Tail-Wagging Swimming Physics
      fishes.forEach((f) => {
        f.mesh.position.x += f.speed;
        f.mesh.position.y = f.yBase + Math.sin(elapsedTime * 1.5 + f.offset) * 0.6;
        f.mesh.rotation.z = Math.sin(elapsedTime * f.wagSpeed + f.offset) * 0.15;

        // Screen Wrap Loop
        if (f.swimDirection > 0 && f.mesh.position.x > 65) {
          f.mesh.position.x = -65;
        } else if (f.swimDirection < 0 && f.mesh.position.x < -65) {
          f.mesh.position.x = 65;
        }
      });

      // 3D Sea Turtle Swimming Motion across Section 2
      turtleGroup.position.x += 0.04;
      flipperL.rotation.z = Math.sin(elapsedTime * 2) * 0.3;
      flipperR.rotation.z = -Math.sin(elapsedTime * 2) * 0.3;
      if (turtleGroup.position.x > 60) {
        turtleGroup.position.x = -60;
      }

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
      window.removeEventListener('mousemove', handleMouseMove);
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
      {/* 3D WebGL Real-Time Ocean Canvas */}
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Surface Light Accent at Top */}
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-[#00D9FF]/25 via-[#041a30]/10 to-transparent pointer-events-none z-1" />

      {/* Deep Ocean Abyss Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_35%,_#01040d_95%)] pointer-events-none z-1" />
    </div>
  );
}
