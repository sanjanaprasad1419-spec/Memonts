import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const RealisticMoon: React.FC = () => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <div className="absolute top-6 left-6 z-40 flex items-center gap-3 pointer-events-auto select-none">
      {/* Realistic Moon Container */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group cursor-pointer"
      >
        {/* Outer Glowing Lunar Aura */}
        <div
          className={`absolute -inset-2.5 rounded-full bg-gradient-to-r from-amber-100/40 via-slate-100/50 to-blue-200/40 blur-md transition-all duration-500 ${
            isHovered ? 'scale-125 opacity-100' : 'opacity-60'
          }`}
        />

        {/* Realistic Moon Sphere */}
        <div
          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full transition-all duration-300 ease-out shadow-[0_0_22px_rgba(255,255,255,0.45)] ${
            isHovered ? 'scale-110 shadow-[0_0_38px_rgba(255,255,255,0.8)] border-white' : 'scale-100 border-white/70'
          } border`}
          style={{
            background:
              'radial-gradient(circle at 35% 35%, #ffffff 0%, #f1f5f9 25%, #cbd5e1 55%, #94a3b8 80%, #64748b 100%)',
          }}
        >
          {/* Lunar Craters & Surface Detail Overlay */}
          <div className="absolute inset-0 rounded-full opacity-30 mix-blend-multiply pointer-events-none overflow-hidden">
            <div className="absolute top-2 left-3 w-3 h-3 rounded-full bg-slate-600/70 blur-[0.5px]" />
            <div className="absolute top-6 left-7 w-4 h-4 rounded-full bg-slate-700/60 blur-[0.5px]" />
            <div className="absolute bottom-3 left-4 w-3.5 h-3.5 rounded-full bg-slate-600/60 blur-[0.5px]" />
            <div className="absolute top-4 right-3 w-2.5 h-2.5 rounded-full bg-slate-700/70 blur-[0.5px]" />
            <div className="absolute bottom-5 right-4 w-5 h-5 rounded-full bg-slate-600/50 blur-[0.5px]" />
            <div className="absolute top-9 left-2 w-2 h-2 rounded-full bg-slate-700/50 blur-[0.5px]" />
          </div>

          {/* Crescent Rim Highlight */}
          <div className="absolute inset-0 rounded-full shadow-[inset_-3px_-3px_8px_rgba(0,0,0,0.35),inset_2px_2px_5px_rgba(255,255,255,0.9)]" />
        </div>
      </div>

      {/* Thinking Cloud Bubble (Popping out on Hover) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -12 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -12 }}
            transition={{ type: 'spring', stiffness: 350, damping: 24 }}
            className="relative flex items-center"
          >
            {/* Thought Cloud Tail Dots */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900/95 border border-slate-700/80 shadow-md" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900/95 border border-slate-700/80 shadow-sm" />
            </div>

            {/* Cloud Speech Bubble Body */}
            <div className="ml-1.5 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.85)] text-slate-100 flex flex-col gap-0.5 max-w-xs">
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
    </div>
  );
};
