import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export interface WorldChapter {
  id: string;
  name: string;
  subtitle: string;
  icon: LucideIcon;
  color: 'amber' | 'rose' | 'purple' | 'blue' | 'emerald' | 'pink' | 'indigo';
  angle: number; // in degrees
  radius: number; // in px on desktop
}

interface OrbitingPlanetProps {
  chapter: WorldChapter;
  onSelect: (chapter: WorldChapter) => void;
}

export const OrbitingPlanet: React.FC<OrbitingPlanetProps> = ({ chapter, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = chapter.icon;

  const colorStyles = {
    amber: {
      gradient: 'from-amber-500/30 via-orange-600/20 to-slate-950',
      border: 'border-amber-400/40 group-hover:border-amber-300',
      shadow: 'shadow-[0_0_25px_rgba(251,191,36,0.3)] group-hover:shadow-[0_0_40px_rgba(251,191,36,0.6)]',
      text: 'text-amber-300',
    },
    rose: {
      gradient: 'from-rose-500/30 via-pink-600/20 to-slate-950',
      border: 'border-rose-400/40 group-hover:border-rose-300',
      shadow: 'shadow-[0_0_25px_rgba(244,63,94,0.3)] group-hover:shadow-[0_0_40px_rgba(244,63,94,0.6)]',
      text: 'text-rose-300',
    },
    purple: {
      gradient: 'from-purple-500/30 via-indigo-600/20 to-slate-950',
      border: 'border-purple-400/40 group-hover:border-purple-300',
      shadow: 'shadow-[0_0_25px_rgba(168,85,247,0.3)] group-hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]',
      text: 'text-purple-300',
    },
    blue: {
      gradient: 'from-blue-500/30 via-cyan-600/20 to-slate-950',
      border: 'border-blue-400/40 group-hover:border-blue-300',
      shadow: 'shadow-[0_0_25px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_40px_rgba(59,130,246,0.6)]',
      text: 'text-blue-300',
    },
    emerald: {
      gradient: 'from-emerald-500/30 via-teal-600/20 to-slate-950',
      border: 'border-emerald-400/40 group-hover:border-emerald-300',
      shadow: 'shadow-[0_0_25px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_40px_rgba(16,185,129,0.6)]',
      text: 'text-emerald-300',
    },
    pink: {
      gradient: 'from-pink-500/30 via-rose-600/20 to-slate-950',
      border: 'border-pink-400/40 group-hover:border-pink-300',
      shadow: 'shadow-[0_0_25px_rgba(236,72,153,0.3)] group-hover:shadow-[0_0_40px_rgba(236,72,153,0.6)]',
      text: 'text-pink-300',
    },
    indigo: {
      gradient: 'from-indigo-500/30 via-purple-600/20 to-slate-950',
      border: 'border-indigo-400/40 group-hover:border-indigo-300',
      shadow: 'shadow-[0_0_25px_rgba(99,102,241,0.3)] group-hover:shadow-[0_0_40px_rgba(99,102,241,0.6)]',
      text: 'text-indigo-300',
    },
  };

  const style = colorStyles[chapter.color];

  // Position based on angle & radius
  const rad = (chapter.angle * Math.PI) / 180;
  const x = Math.cos(rad) * chapter.radius;
  const y = Math.sin(rad) * chapter.radius;

  return (
    <div
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
    >
      <button
        onClick={() => onSelect(chapter)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="interactive relative group cursor-pointer flex flex-col items-center focus:outline-none"
      >
        {/* Planet Sphere */}
        <motion.div
          whileHover={{ scale: 1.25 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr ${style.gradient} border ${style.border} ${style.shadow} transition-all duration-300 flex items-center justify-center relative overflow-hidden backdrop-blur-md`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.25),transparent_70%)]" />
          <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${style.text} relative z-10`} />
        </motion.div>

        {/* Floating Tooltip Card on Hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute top-20 z-40 w-52 p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-2xl text-center space-y-1 pointer-events-none"
            >
              <h4 className={`font-bold text-xs sm:text-sm ${style.text}`}>
                {chapter.name}
              </h4>
              <p className="text-[11px] text-slate-300 font-serif leading-tight">
                {chapter.subtitle}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};
