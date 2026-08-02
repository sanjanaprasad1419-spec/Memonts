import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Heart } from 'lucide-react';

interface Scene3FloatingMemoriesProps {
  onComplete: () => void;
}

export const Scene3FloatingMemories: React.FC<Scene3FloatingMemoriesProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const polaroids = [
    { id: 1, rotation: -6, x: '-32%', y: '-25%', label: 'Sunset Memories', delay: 0 },
    { id: 2, rotation: 8, x: '30%', y: '-20%', label: 'Road trip Moments', delay: 0.3 },
    { id: 3, rotation: -4, x: '-30%', y: '25%', label: 'Coffee & Laughs', delay: 0.6 },
    { id: 4, rotation: 6, x: '32%', y: '22%', label: 'Special Evening', delay: 0.9 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 1 } }}
      transition={{ duration: 1.2 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 select-none overflow-hidden"
    >
      {/* Floating Polaroid Cards */}
      {polaroids.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{
            opacity: 0.85,
            scale: 1,
            y: [0, -12, 0],
            rotate: [p.rotation, p.rotation + 2, p.rotation],
          }}
          transition={{
            opacity: { duration: 1, delay: p.delay },
            scale: { duration: 1, delay: p.delay },
            y: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: p.delay },
            rotate: { duration: 7, repeat: Infinity, ease: 'easeInOut', delay: p.delay },
          }}
          style={{ left: `calc(50% + ${p.x})`, top: `calc(50% + ${p.y})` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 hidden md:flex flex-col bg-slate-900/90 border border-slate-700/60 p-3 rounded-2xl shadow-2xl backdrop-blur-md w-48 shadow-slate-950/80 pointer-events-none"
        >
          <div className="w-full h-36 bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/40 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-slate-500">
            <ImageIcon className="w-8 h-8 text-rose-400/40 mb-1" />
            <span className="text-[10px] uppercase font-semibold text-slate-400">Placeholder Photo</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between px-1 text-[11px] font-serif text-slate-300">
            <span>{p.label}</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500/30" />
          </div>
        </motion.div>
      ))}

      {/* Center Text Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="relative z-10 backdrop-blur-2xl bg-slate-950/70 border border-slate-800/80 rounded-3xl p-8 sm:p-12 shadow-2xl max-w-xl text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>Memories</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-rose-200 bg-clip-text text-transparent">
          Every picture tells a story.
        </h2>
      </motion.div>
    </motion.div>
  );
};
