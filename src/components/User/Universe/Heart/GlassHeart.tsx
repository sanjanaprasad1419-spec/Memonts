import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playUniverseSound } from '../../../../utils/universeSounds';

interface GlassHeartProps {
  hoveredPlate: string | null;
}

export const GlassHeart: React.FC<GlassHeartProps> = ({ hoveredPlate }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const internalGlowRef = useRef<THREE.PointLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);
  const particlesGroupRef = useRef<THREE.Group>(null);
  const particleGeomRef = useRef<THREE.BufferGeometry>(null);

  // Handcrafted 3D Crystal Sculpted Heart Geometry
  const heartGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0;
    const y = 0;

    // Upright Heart Path
    shape.moveTo(x + 0.25, y + 0.25);
    shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
    shape.bezierCurveTo(x - 0.35, y, x - 0.35, y + 0.38, x - 0.35, y + 0.38);
    shape.bezierCurveTo(x - 0.35, y + 0.58, x - 0.12, y + 0.78, x + 0.25, y + 0.98);
    shape.bezierCurveTo(x + 0.62, y + 0.78, x + 0.85, y + 0.58, x + 0.85, y + 0.38);
    shape.bezierCurveTo(x + 0.85, y, x + 0.5, y, x + 0.5, y);
    shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.45,
      bevelEnabled: true,
      bevelSegments: 16,
      steps: 4,
      bevelSize: 0.22,
      bevelThickness: 0.24,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    geom.computeVertexNormals();
    return geom;
  }, []);

  // Orbiting golden dust particles
  const particleData = useMemo(() => {
    const count = 90;
    const pos = new Float32Array(count * 3);
    const angles = new Float32Array(count);
    const radii = new Float32Array(count);
    const speeds = new Float32Array(count);
    const heights = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      radii[i] = 1.0 + Math.random() * 1.2;
      angles[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.15 + Math.random() * 0.25;
      heights[i] = (Math.random() - 0.5) * 1.4;

      pos[i * 3] = radii[i] * Math.cos(angles[i]);
      pos[i * 3 + 1] = heights[i];
      pos[i * 3 + 2] = radii[i] * Math.sin(angles[i]);
    }

    return { pos, angles, radii, speeds, heights, count };
  }, []);

  const lastBeatTime = useRef(0);

  // 60FPS Heart Animation Loop
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();

    if (meshRef.current) {
      // Position heart visual center EXACTLY in the middle at Z = 0
      const floatY = Math.sin(elapsedTime * 1.2) * 0.05 + 0.1;
      meshRef.current.position.set(0, floatY, 0);

      // Slow, graceful 3D rotation
      meshRef.current.rotation.x = 0;
      meshRef.current.rotation.y = elapsedTime * 0.18;
      meshRef.current.rotation.z = Math.PI + Math.sin(elapsedTime * 0.4) * 0.04;

      // Heartbeat Pulse
      const beatCycle = (elapsedTime % 2.0) / 2.0;
      let pulseBump = 0;

      if (beatCycle < 0.1) {
        pulseBump = Math.sin((beatCycle / 0.1) * Math.PI) * 0.04;
      } else if (beatCycle > 0.16 && beatCycle < 0.24) {
        pulseBump = Math.sin(((beatCycle - 0.16) / 0.08) * Math.PI) * 0.02;
      }

      const hoverScale = hoveredPlate ? 0.06 : 0;
      const baseScale = 2.0 * (1 + pulseBump + hoverScale);

      meshRef.current.scale.set(baseScale, baseScale, baseScale);

      if (beatCycle < 0.04 && elapsedTime - lastBeatTime.current > 1.8) {
        lastBeatTime.current = elapsedTime;
        playUniverseSound('heartbeat');
      }

      if (internalGlowRef.current) {
        internalGlowRef.current.intensity = 3.8 + pulseBump * 25.0;
      }
    }

    if (particleGeomRef.current && particlesGroupRef.current) {
      const positions = particleGeomRef.current.attributes.position.array as Float32Array;

      for (let i = 0; i < particleData.count; i++) {
        particleData.angles[i] += particleData.speeds[i] * 0.015;
        const r = particleData.radii[i] + Math.sin(elapsedTime + i) * 0.05;

        positions[i * 3] = r * Math.cos(particleData.angles[i]);
        positions[i * 3 + 1] = particleData.heights[i] + Math.sin(elapsedTime * 1.5 + i) * 0.08 + 0.1;
        positions[i * 3 + 2] = r * Math.sin(particleData.angles[i]);
      }

      particleGeomRef.current.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Warm Internal Gold Point Light */}
      <pointLight
        ref={internalGlowRef}
        position={[0, 0.1, 0.1]}
        color="#fbbf24"
        intensity={3.8}
        distance={6}
      />

      {/* Soft Pink Core Point Light */}
      <pointLight position={[0, 0.0, 0.2]} color="#ec4899" intensity={4.5} distance={7} />

      {/* Behind Rim Light */}
      <directionalLight
        ref={rimLightRef}
        position={[0, 0.2, -4]}
        color="#f43f5e"
        intensity={1.8}
      />

      {/* Premium Crystal Glass Heart Mesh Centered at RenderOrder 5 (In between front & back cards!) */}
      <mesh ref={meshRef} geometry={heartGeometry} renderOrder={5} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#f43f5e"
          emissive="#ec4899"
          emissiveIntensity={0.35}
          roughness={0.08}
          metalness={0.05}
          transmission={0.92}
          thickness={1.3}
          ior={1.52}
          clearcoat={1.0}
          clearcoatRoughness={0.04}
          reflectivity={0.98}
          transparent={true}
          opacity={0.94}
        />
      </mesh>

      {/* Orbiting Golden Soft Particles */}
      <group ref={particlesGroupRef}>
        <points>
          <bufferGeometry ref={particleGeomRef}>
            <bufferAttribute
              attach="attributes-position"
              args={[particleData.pos, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.04}
            color="#fbbf24"
            transparent={true}
            opacity={0.75}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
    </group>
  );
};
