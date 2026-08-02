import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const UniverseParticles: React.FC = () => {
  const starsRef = useRef<THREE.Points>(null);
  const dustRef = useRef<THREE.Points>(null);

  // 2500 Tiny Stars in 3D Space
  const [starPositions, starColors] = useMemo(() => {
    const count = 2500;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const palette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#93c5fd'),
      new THREE.Color('#c084fc'),
      new THREE.Color('#fef08a'),
      new THREE.Color('#f43f5e'),
    ];

    for (let i = 0; i < count; i++) {
      const radius = 8 + Math.random() * 45;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      pos[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      pos[i * 3 + 1] = radius * Math.sin(phi);
      pos[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }

    return [pos, col];
  }, []);

  // 600 Galaxy Dust Particles (Slightly larger, slower motion)
  const dustPositions = useMemo(() => {
    const count = 600;
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }

    return pos;
  }, []);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();

    if (starsRef.current) {
      starsRef.current.rotation.y = elapsedTime * 0.015;
      starsRef.current.rotation.x = Math.sin(elapsedTime * 0.01) * 0.02;
    }

    if (dustRef.current) {
      dustRef.current.rotation.y = -elapsedTime * 0.025;
      dustRef.current.rotation.z = Math.cos(elapsedTime * 0.015) * 0.03;
    }
  });

  return (
    <group>
      {/* 2500 Star Field */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[starColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.07}
          vertexColors={true}
          transparent={true}
          opacity={0.85}
          sizeAttenuation={true}
        />
      </points>

      {/* 600 Galaxy Dust Particles */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          color="#a855f7"
          transparent={true}
          opacity={0.45}
          blending={THREE.AdditiveBlending}
          sizeAttenuation={true}
        />
      </points>

      {/* Volumetric Soft Purple & Blue Nebula Lighting Spheres */}
      <mesh position={[ -12, 5, -20 ]} scale={18}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#3b0764" transparent={true} opacity={0.18} />
      </mesh>

      <mesh position={[ 14, -6, -22 ]} scale={20}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#1e1b4b" transparent={true} opacity={0.22} />
      </mesh>

      <mesh position={[ 0, 8, -25 ]} scale={22}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#4c0519" transparent={true} opacity={0.15} />
      </mesh>
    </group>
  );
};
