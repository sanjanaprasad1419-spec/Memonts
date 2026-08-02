import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GlassPlate, type WorldChapter3D } from '../MemoryPlate/GlassPlate';
import { GlassHeart } from '../Heart/GlassHeart';

interface OrbitRigProps {
  chapters: WorldChapter3D[];
  onSelectChapter: (chapter: WorldChapter3D) => void;
}

export const OrbitRig: React.FC<OrbitRigProps> = ({ chapters, onSelectChapter }) => {
  const [hoveredPlateId, setHoveredPlateId] = useState<string | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Subtle ambient floating motion
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(elapsedTime * 0.2) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central 3D Glass Crystal Heart */}
      <GlassHeart hoveredPlate={hoveredPlateId} />

      {/* 7 Memory Glass Cards Emitting Simultaneously From Central Heart (No Connecting Lines!) */}
      {chapters.map((ch, idx) => {
        const angleRad = (ch.angle * Math.PI) / 180;

        // Radial position emitting outwards from central heart
        const r = ch.radius * 0.82;
        const x = r * Math.cos(angleRad);
        const z = r * Math.sin(angleRad);
        const y = ch.height;

        return (
          <GlassPlate
            key={ch.id || idx}
            chapter={ch}
            position={[x, y, z]}
            isHovered={hoveredPlateId === ch.id}
            onHover={(id) => setHoveredPlateId(id)}
            onSelect={onSelectChapter}
          />
        );
      })}
    </group>
  );
};
