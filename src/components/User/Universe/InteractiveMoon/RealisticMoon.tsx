import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const RealisticMoon: React.FC = () => {
  const [isCloudOpen, setIsCloudOpen] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const isDraggingRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle Drag Start
  const handleDragStart = (_: any, info: any) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    setIsCloudOpen(false); // Instantly close thinking cloud when dragging starts
    dragStartPos.current = { x: info.point.x, y: info.point.y };
  };

  // Handle Drag End
  const handleDragEnd = (_: any, info: any) => {
    const dist = Math.hypot(
      info.point.x - dragStartPos.current.x,
      info.point.y - dragStartPos.current.y
    );

    // If dragged more than 5px, keep ref true briefly to prevent click handler from triggering
    if (dist > 5) {
      setTimeout(() => {
        isDraggingRef.current = false;
        setIsDragging(false);
      }, 150);
    } else {
      isDraggingRef.current = false;
      setIsDragging(false);
    }
  };

  // Handle Click / Tap on Moon
  const handleMoonClick = () => {
    if (isDraggingRef.current || isDragging) return;
    setIsCloudOpen((prev) => !prev);
  };

  return (
    <div
      ref={containerRef}
      className="fixed top-8 left-8 z-40 select-none pointer-events-auto"
    >
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.05}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleMoonClick}
        onMouseEnter={() => !isDragging && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group cursor-grab active:cursor-grabbing touch-none flex items-center gap-4"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Outer Atmospheric Cosmic Aura */}
        <div
          className={`absolute -inset-4 rounded-full bg-gradient-to-r from-amber-200/30 via-slate-100/40 to-pink-300/30 blur-xl transition-all duration-500 pointer-events-none ${
            isHovered || isDragging ? 'scale-125 opacity-100' : 'opacity-60 scale-100'
          }`}
        />

        {/* Photorealistic 3D Moon Sphere */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-[0_0_35px_rgba(255,255,255,0.4),inset_-10px_-10px_25px_rgba(0,0,0,0.85),inset_6px_6px_15px_rgba(255,255,255,0.9)] border border-slate-300/40 transition-shadow duration-300">
          {/* Base Realistic Shading Radial Gradient */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 35% 30%, #ffffff 0%, #e2e8f0 20%, #cbd5e1 45%, #94a3b8 70%, #475569 90%, #1e293b 100%)',
            }}
          />

          {/* SVG High-Precision Realistic Lunar Surface Texture & Maria */}
          <svg
            className="absolute inset-0 w-full h-full rounded-full mix-blend-multiply opacity-75 pointer-events-none"
            viewBox="0 0 200 200"
          >
            <defs>
              {/* Lunar Surface Micro Noise */}
              <filter id="moon-noise" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
                <feColorMatrix
                  type="matrix"
                  values="0.3 0 0 0 0.1
                          0.3 0 0 0 0.1
                          0.3 0 0 0 0.1
                          0 0 0 0.6 0"
                />
              </filter>
            </defs>

            {/* Dark Lunar Maria (Oceanus Procellarum, Mare Serenitatis, Mare Tranquillitatis) */}
            <g fill="#334155" opacity="0.65">
              {/* Oceanus Procellarum (Large western sea) */}
              <path d="M 30,60 Q 60,40 85,75 T 45,130 Q 20,110 30,60 Z" filter="blur(3px)" />
              {/* Mare Imbrium */}
              <circle cx="75" cy="55" r="24" filter="blur(3px)" />
              {/* Mare Serenitatis */}
              <circle cx="120" cy="65" r="18" filter="blur(2.5px)" />
              {/* Mare Tranquillitatis */}
              <circle cx="138" cy="92" r="22" filter="blur(3px)" />
              {/* Mare Crisium */}
              <ellipse cx="162" cy="78" rx="12" ry="9" filter="blur(1.5px)" />
              {/* Mare Nectaris & Fecunditatis */}
              <circle cx="145" cy="125" r="16" filter="blur(2.5px)" />
              <circle cx="115" cy="140" r="20" filter="blur(3px)" />
              {/* Tycho Crater Ray System (Southern Highlands) */}
              <circle cx="95" cy="160" r="10" fill="#cbd5e1" opacity="0.9" />
              <circle cx="95" cy="160" r="6" fill="#f8fafc" />
            </g>

            {/* Micro Topography Noise Layer */}
            <rect width="200" height="200" filter="url(#moon-noise)" opacity="0.45" />

            {/* Major Impact Craters with Rim Highlights & Depth Shadows */}
            <g opacity="0.8">
              {/* Copernicus Crater with Ray Lines */}
              <circle cx="68" cy="98" r="8" fill="#1e293b" stroke="#e2e8f0" strokeWidth="1.2" />
              <circle cx="68" cy="98" r="4" fill="#0f172a" />
              <path d="M68,90 L68,82 M68,106 L68,114 M60,98 L52,98 M76,98 L84,98" stroke="#f1f5f9" strokeWidth="0.8" opacity="0.6" />

              {/* Kepler Crater */}
              <circle cx="42" cy="92" r="5" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1" />

              {/* Aristarchus Bright Spot */}
              <circle cx="48" cy="62" r="4" fill="#ffffff" />

              {/* Plato Crater */}
              <ellipse cx="82" cy="35" rx="7" ry="4" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.8" />

              {/* Additional Southern Craters */}
              <circle cx="130" cy="150" r="7" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1" />
              <circle cx="70" cy="145" r="6" fill="#1e293b" stroke="#94a3b8" strokeWidth="0.8" />
              <circle cx="155" cy="115" r="5" fill="#1e293b" stroke="#cbd5e1" strokeWidth="0.8" />
            </g>
          </svg>

          {/* 3D Spherical Volume Shadow Mapping (Terminator Light & Dark Edge) */}
          <div className="absolute inset-0 rounded-full shadow-[inset_-16px_-12px_28px_rgba(2,6,23,0.85),inset_8px_8px_16px_rgba(255,255,255,0.7)] pointer-events-none" />
        </div>

        {/* Thinking Cloud Bubble */}
        <AnimatePresence>
          {isCloudOpen && !isDragging && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -10 }}
              transition={{ type: 'spring', stiffness: 350, damping: 24 }}
              className="relative flex items-center pointer-events-auto"
            >
              {/* Thought Cloud Tail Dots */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900/95 border border-slate-700/80 shadow-md" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900/95 border border-slate-700/80 shadow-sm" />
              </div>

              {/* Cloud Speech Bubble Body */}
              <div className="ml-1.5 px-4 py-3 rounded-2xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.85)] text-slate-100 flex flex-col gap-1 max-w-xs border-rose-500/30">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                  <span>💭 (Chaand be like)</span>
                </span>
                <p className="text-xs font-bold text-white tracking-wide whitespace-nowrap">
                  Haan yeh karlo pehle!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
