import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export const DistantPlanets: React.FC = () => {
  const earthMeshRef = useRef<THREE.Mesh>(null);
  const keplerMeshRef = useRef<THREE.Mesh>(null);
  const earthGlowRef = useRef<THREE.Mesh>(null);
  const keplerGlowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Slow atmospheric rotation
    if (earthMeshRef.current) earthMeshRef.current.rotation.y = t * 0.2;
    if (keplerMeshRef.current) keplerMeshRef.current.rotation.y = t * 0.16;

    // Camera telescope twinkling / lens flare pulse effect
    if (earthGlowRef.current) {
      const scale = 1 + Math.sin(t * 2.4) * 0.12;
      earthGlowRef.current.scale.set(scale, scale, scale);
    }
    if (keplerGlowRef.current) {
      const scale = 1 + Math.cos(t * 2.0) * 0.14;
      keplerGlowRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group renderOrder={10}>
      {/* 🌍 1. DISTANT PLANET EARTH (Top-Left Quad, z = -3.5) */}
      <group position={[-5.8, 2.8, -3.5]}>
        {/* Outer Lens Flare Star Bloom Halo */}
        <mesh ref={earthGlowRef} scale={1.85}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.55}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Diffuse Outer Atmosphere Halo */}
        <mesh scale={2.5}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshBasicMaterial
            color="#60a5fa"
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Earth Planet Core Sphere */}
        <mesh ref={earthMeshRef}>
          <sphereGeometry args={[0.22, 32, 32]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>

        {/* Small Earth Label Badge */}
        <Html center distanceFactor={10} zIndexRange={[100, 0]} className="pointer-events-none select-none">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/90 border border-cyan-400/50 text-[9px] font-extrabold font-mono tracking-widest text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)] backdrop-blur-md whitespace-nowrap mt-7">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>Earth</span>
          </div>
        </Html>
      </group>

      {/* 🪐 2. DISTANT PLANET KEPLER (Bottom-Right Quad, z = -3.8) */}
      <group position={[5.8, -2.6, -3.8]}>
        {/* Outer Lens Flare Star Bloom Halo */}
        <mesh ref={keplerGlowRef} scale={1.85}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.55}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Diffuse Outer Atmosphere Halo */}
        <mesh scale={2.5}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial
            color="#f59e0b"
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Kepler Planet Core Sphere */}
        <mesh ref={keplerMeshRef}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshBasicMaterial color="#d97706" />
        </mesh>

        {/* Small Kepler Label Badge */}
        <Html center distanceFactor={10} zIndexRange={[100, 0]} className="pointer-events-none select-none">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/90 border border-amber-400/50 text-[9px] font-extrabold font-mono tracking-widest text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.4)] backdrop-blur-md whitespace-nowrap mt-7">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>Kepler</span>
          </div>
        </Html>
      </group>
    </group>
  );
};
