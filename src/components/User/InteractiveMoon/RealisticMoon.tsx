import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const RealisticMoon: React.FC = () => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <motion.div
      drag
      dragMomentum={false}
      whileDrag={{ scale: 1.12, cursor: 'grabbing' }}
      className="fixed top-6 left-6 z-50 flex items-center gap-4 pointer-events-auto select-none cursor-grab active:cursor-grabbing"
    >
      {/* Realistic Moon Container */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group"
      >
        {/* Outer Glowing Lunar Aura */}
        <div
          className={`absolute -inset-3 rounded-full bg-gradient-to-r from-amber-100/50 via-slate-100/60 to-blue-200/50 blur-lg transition-all duration-500 ${
            isHovered ? 'scale-125 opacity-100' : 'opacity-65'
          }`}
        />

        {/* Larger Realistic Moon Sphere */}
        <div
          className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full transition-all duration-300 ease-out shadow-[0_0_30px_rgba(255,255,255,0.55)] ${
            isHovered ? 'scale-110 shadow-[0_0_48px_rgba(255,255,255,0.85)] border-white' : 'scale-100 border-white/80'
          } border-2`}
          style={{
            background:
              'radial-gradient(circle at 35% 35%, #ffffff 0%, #f1f5f9 22%, #cbd5e1 50%, #94a3b8 78%, #64748b 100%)',
          }}
        >
          {/* Lunar Craters & Surface Detail Overlay */}
          <div className="absolute inset-0 rounded-full opacity-35 mix-blend-multiply pointer-events-none overflow-hidden">
            <div className="absolute top-3 left-4 w-4 h-4 rounded-full bg-slate-600/70 blur-[0.5px]" />
            <div className="absolute top-9 left-10 w-6 h-6 rounded-full bg-slate-700/60 blur-[0.5px]" />
            <div className="absolute bottom-4 left-6 w-5 h-5 rounded-full bg-slate-600/60 blur-[0.5px]" />
            <div className="absolute top-6 right-4 w-3.5 h-3.5 rounded-full bg-slate-700/70 blur-[0.5px]" />
            <div className="absolute bottom-7 right-6 w-7 h-7 rounded-full bg-slate-600/50 blur-[0.5px]" />
            <div className="absolute top-12 left-3 w-3 h-3 rounded-full bg-slate-700/50 blur-[0.5px]" />
          </div>

          {/* Crescent Rim Highlight */}
          <div className="absolute inset-0 rounded-full shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.4),inset_3px_3px_7px_rgba(255,255,255,0.95)]" />
        </div>
      </div>

      {/* Thinking Cloud Bubble (Popping out on Hover) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -14 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -14 }}
            transition={{ type: 'spring', stiffness: 350, damping: 24 }}
            className="relative flex items-center"
          >
            {/* Thought Cloud Tail Dots */}
            <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 flex flex-col gap-1 items-center">
              <div className="w-3 h-3 rounded-full bg-slate-900/95 border border-slate-700/80 shadow-md" />
              <div className="w-2 h-2 rounded-full bg-slate-900/95 border border-slate-700/80 shadow-sm" />
            </div>

            {/* Cloud Speech Bubble Body */}
            <div className="ml-1.5 px-4.5 py-3 rounded-2xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.85)] text-slate-100 flex flex-col gap-0.5 max-w-xs">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                <span>💭 (Chaand be like)</span>
              </span>
              <p className="text-xs sm:text-sm font-bold text-white tracking-wide whitespace-nowrap">
                Haan yeh karlo pehle!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
