import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const CentralPlanet: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center select-none group">
      {/* Outer Atmosphere Glow */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-56 h-56 sm:w-72 sm:h-72 bg-gradient-to-r from-rose-500/30 via-purple-500/20 to-amber-500/30 rounded-full blur-3xl pointer-events-none group-hover:scale-125 group-hover:opacity-80 transition-all duration-500"
      />

      {/* Main Rotating Central Planet */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-slate-950 via-rose-950 to-amber-900 border-2 border-rose-400/40 shadow-[0_0_50px_rgba(244,63,94,0.3)] group-hover:shadow-[0_0_80px_rgba(244,63,94,0.6)] group-hover:border-rose-300 transition-all duration-500 overflow-hidden flex items-center justify-center"
      >
        {/* Planet Surface Texture Stripes */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_40%,rgba(244,63,94,0.15)_50%,transparent_60%)]" />
        <div className="absolute top-1/3 inset-x-0 h-4 bg-rose-500/10 blur-sm rounded-full" />
      </motion.div>

      {/* Center Label */}
      <div className="absolute z-10 text-center pointer-events-none space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Our Universe</span>
        </div>
      </div>
    </div>
  );
};
