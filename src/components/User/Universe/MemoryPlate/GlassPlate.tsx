import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { playUniverseSound } from '../../../../utils/universeSounds';
import type { LucideIcon } from 'lucide-react';

export interface WorldChapter3D {
  id: string;
  name: string;
  subtitle: string;
  icon: LucideIcon;
  color: 'amber' | 'rose' | 'purple' | 'blue' | 'emerald' | 'pink' | 'indigo';
  angle: number;
  radius: number;
  height: number;
}

interface GlassPlateProps {
  chapter: WorldChapter3D;
  position: [number, number, number];
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (chapter: WorldChapter3D) => void;
}

export const GlassPlate: React.FC<GlassPlateProps> = ({
  chapter,
  position,
  isHovered,
  onHover,
  onSelect,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const Icon = chapter.icon;

  const [currentScale, setCurrentScale] = useState(1);

  // Position Z-depth check for layering
  const zDepth = position[2];
  const isFrontOfHeart = zDepth >= 0;

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();

    if (groupRef.current) {
      // Gentle floating pulse along emission position
      const pulseY = Math.sin(elapsedTime * 1.2 + chapter.angle) * 0.06;
      groupRef.current.position.y = position[1] + pulseY;

      // Uniform full scale for all cards (front and back cards stay 100% prominent & visible)
      const targetScale = isHovered ? 1.15 : 1.0;
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.12);
      setCurrentScale(newScale);
      groupRef.current.scale.set(newScale, newScale, newScale);
    }
  });

  const handlePointerOver = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    onHover(chapter.id);
    playUniverseSound('hover');
  };

  const handlePointerOut = () => {
    onHover(null);
  };

  const handleClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    playUniverseSound('click');
    onSelect(chapter);
  };

  // Dynamic Z-index so front cards render over heart and back cards render behind heart
  const htmlZIndex = isFrontOfHeart ? 15 : 2;

  return (
    <group ref={groupRef} position={position}>
      {/* Completely Transparent 3D Glass Mesh (Zero dark background block!) */}
      <mesh
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        renderOrder={isFrontOfHeart ? 10 : 1}
      >
        <boxGeometry args={[2.8, 1.6, 0.04]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.98}
          roughness={0.05}
          metalness={0.02}
          thickness={0.2}
          transparent={true}
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>

      {/* R3F HTML Overlay - 100% Crystal Clear & Transparent Styling */}
      <Html
        center
        distanceFactor={4.8}
        position={[0, 0, 0.05]}
        className="pointer-events-auto select-none"
        style={{
          zIndex: htmlZIndex,
          opacity: 1, // 100% Full Opacity for both front & back cards!
        }}
      >
        <div
          onMouseEnter={handlePointerOver}
          onMouseLeave={handlePointerOut}
          onClick={handleClick}
          className={`interactive w-64 p-4 rounded-2xl backdrop-blur-md border transition-all duration-300 cursor-pointer text-center ${
            isHovered
              ? 'bg-slate-950/70 border-rose-400/90 shadow-[0_0_25px_rgba(244,63,94,0.5)] scale-105'
              : 'bg-slate-950/40 border-slate-700/50 shadow-xl hover:border-slate-400 hover:bg-slate-950/60'
          }`}
        >
          {/* Glowing Icon */}
          <div className="flex justify-center mb-2">
            <div
              className={`p-2.5 rounded-xl border transition-colors ${
                isHovered
                  ? 'bg-rose-500/25 border-rose-400 text-rose-300 shadow-md'
                  : 'bg-slate-900/80 border-slate-800 text-slate-100'
              }`}
            >
              <Icon className="w-5.5 h-5.5" />
            </div>
          </div>

          {/* Title - 100% Crystal Clear & Prominent */}
          <h3 className="text-xs font-extrabold text-white tracking-wide drop-shadow-md">
            {chapter.name}
          </h3>

          {/* Subtitle */}
          <p
            className={`text-[11px] mt-1 transition-opacity duration-300 leading-snug ${
              isHovered ? 'text-rose-200 font-semibold opacity-100' : 'text-slate-300 opacity-90'
            }`}
          >
            {chapter.subtitle}
          </p>
        </div>
      </Html>
    </group>
  );
};
