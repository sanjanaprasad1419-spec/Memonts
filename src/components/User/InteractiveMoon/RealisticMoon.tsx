import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const RealisticMoon: React.FC = () => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Show thought cloud ONLY when cursor is hovered AND moon is NOT being dragged
  const showThoughtCloud = isHovered && !isDragging;

  return (
    <motion.div
      drag
      dragConstraints={{ left: -25, right: 120, top: -20, bottom: 120 }}
      dragElastic={0.15}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 22 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      whileDrag={{ scale: 1.08, cursor: 'grabbing' }}
      className="absolute top-6 left-6 z-30 flex items-center gap-3 select-none cursor-grab active:cursor-grabbing pointer-events-auto"
    >
      {/* Moon Container */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group shrink-0"
      >
        {/* Soft Ambient Lunar Aura Glow */}
        <div
          className={`absolute -inset-2 rounded-full bg-gradient-to-r from-slate-100/30 via-amber-100/20 to-blue-200/30 blur-md transition-all duration-300 ${
            showThoughtCloud ? 'scale-125 opacity-90' : 'opacity-50'
          }`}
        />

        {/* Photorealistic Moon Sphere */}
        <div
          className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full transition-all duration-300 ease-out border border-white/80 ${
            showThoughtCloud
              ? 'scale-110 shadow-[0_0_32px_rgba(255,255,255,0.7)] border-white'
              : 'scale-100 shadow-[0_0_20px_rgba(255,255,255,0.4)]'
          }`}
          style={{
            background:
              'radial-gradient(circle at 35% 35%, #ffffff 0%, #f8fafc 18%, #e2e8f0 42%, #cbd5e1 68%, #94a3b8 88%, #475569 100%)',
          }}
        >
          {/* Natural Lunar Craters Shading Overlay */}
          <div className="absolute inset-0 rounded-full opacity-35 mix-blend-multiply pointer-events-none overflow-hidden">
            <div className="absolute top-2.5 left-3.5 w-3.5 h-3.5 rounded-full bg-slate-600/70 blur-[0.5px]" />
            <div className="absolute top-7 left-8 w-5 h-5 rounded-full bg-slate-700/60 blur-[0.5px]" />
            <div className="absolute bottom-3 left-5 w-4 h-4 rounded-full bg-slate-600/60 blur-[0.5px]" />
            <div className="absolute top-5 right-3 w-3 h-3 rounded-full bg-slate-700/70 blur-[0.5px]" />
            <div className="absolute bottom-5 right-5 w-5.5 h-5.5 rounded-full bg-slate-600/50 blur-[0.5px]" />
            <div className="absolute top-10 left-2.5 w-2 h-2 rounded-full bg-slate-700/50 blur-[0.5px]" />
          </div>

          {/* Realistic Rim Lighting Highlight */}
          <div className="absolute inset-0 rounded-full shadow-[inset_-3px_-3px_8px_rgba(0,0,0,0.4),inset_2.5px_2.5px_6px_rgba(255,255,255,0.95)]" />
        </div>
      </div>

      {/* Cute Thought Cloud Bubble (Visible ONLY on Hover when NOT dragging) */}
      <AnimatePresence>
        {showThoughtCloud && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, x: -10, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className="relative flex items-center shrink-0 pointer-events-none"
          >
            {/* Thought Bubble Tail Dots */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950/95 border border-slate-700/80 shadow-md" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950/95 border border-slate-700/80 shadow-sm" />
            </div>

            {/* Cloud Box */}
            <div className="ml-1 px-3.5 py-2.5 rounded-2xl bg-slate-950/95 border border-slate-700/80 backdrop-blur-xl shadow-[0_10px_28px_rgba(0,0,0,0.85)] text-slate-100 flex flex-col gap-0.5 max-w-[210px] animate-[bounce_3s_infinite_ease-in-out]">
              <span className="text-[10px] font-extrabold tracking-wider text-amber-300/90 uppercase">
                (Chaand be like)
              </span>
              <p className="text-xs font-bold text-white tracking-wide leading-tight whitespace-nowrap">
                "Haan yeh karlo pehle!"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
