import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type WorldChapter3D } from './MemoryPlate/GlassPlate';
import { Sparkles, Heart } from 'lucide-react';

interface EnvelopeOpeningModalProps {
  chapter: WorldChapter3D;
  onAnimationComplete: () => void;
}

export const EnvelopeOpeningModal: React.FC<EnvelopeOpeningModalProps> = ({
  chapter,
  onAnimationComplete,
}) => {
  // Phase 1: 'flying' (Card flies to heart)
  // Phase 2: 'opening' (Envelope unfolds)
  // Phase 3: 'revealed' (Transitions to full view)
  const [phase, setPhase] = useState<'flying' | 'opening' | 'revealed'>('flying');

  const IconComponent = chapter.icon;

  useEffect(() => {
    // Sequence: 800ms card fly -> 1200ms envelope unfold -> complete
    const timer1 = setTimeout(() => {
      setPhase('opening');
    }, 700);

    const timer2 = setTimeout(() => {
      setPhase('revealed');
      onAnimationComplete();
    }, 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onAnimationComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl overflow-hidden select-none">
      <AnimatePresence mode="wait">
        {/* Phase 1: Card Flying into the Glowing Heart */}
        {phase === 'flying' && (
          <motion.div
            key="flying-card"
            initial={{ scale: 0.3, y: 150, opacity: 0.2, rotate: -15 }}
            animate={{
              scale: [0.4, 1.1, 1],
              y: [100, -10, 0],
              opacity: [0.4, 1, 1],
              rotate: [ -15, 5, 0 ],
            }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col items-center justify-center"
          >
            {/* Glowing Particle Trails */}
            <div className="absolute -inset-10 bg-gradient-to-r from-rose-500/30 via-pink-500/40 to-amber-500/30 rounded-full blur-3xl animate-pulse" />

            <div className="relative w-72 sm:w-80 h-44 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-rose-950/90 border-2 border-rose-500/60 p-6 flex flex-col justify-between shadow-[0_0_50px_rgba(244,63,94,0.5)]">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300">
                  <IconComponent className="w-6 h-6" />
                </div>
                <Heart className="w-6 h-6 text-rose-400 fill-rose-500 animate-pulse" />
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-amber-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Memory Chapter</span>
                </span>
                <h3 className="text-lg font-extrabold text-white mt-0.5">{chapter.name}</h3>
                <p className="text-xs text-slate-300 line-clamp-1">{chapter.subtitle}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Phase 2: Golden Gift Envelope Opening */}
        {(phase === 'opening' || phase === 'revealed') && (
          <motion.div
            key="opening-envelope"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative flex flex-col items-center justify-center p-4"
          >
            {/* Envelope Outer Shadow */}
            <div className="absolute -inset-16 bg-gradient-to-tr from-rose-600/30 via-amber-500/40 to-pink-600/30 rounded-full blur-3xl" />

            {/* 3D Foldable Gift Envelope */}
            <div className="relative w-80 sm:w-96 h-56 rounded-3xl bg-slate-900 border border-amber-500/50 shadow-2xl overflow-hidden flex flex-col justify-end">
              {/* Envelope Inside Letter Card Sliding Up */}
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: -30, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="absolute inset-x-4 top-4 bottom-4 rounded-2xl bg-gradient-to-b from-rose-950/90 via-slate-900 to-slate-950 border border-rose-400/40 p-5 flex flex-col items-center justify-center text-center shadow-xl z-10"
              >
                <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-300 mb-2">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-white">{chapter.name}</h2>
                <p className="text-xs font-semibold text-rose-300 mt-1">{chapter.subtitle}</p>
                <span className="mt-3 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-200 text-[11px] font-bold flex items-center gap-1 animate-pulse">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Unfolding Memory...</span>
                </span>
              </motion.div>

              {/* Envelope Flap Opening Animation */}
              <motion.div
                initial={{ rotateX: 0 }}
                animate={{ rotateX: -180 }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeInOut' }}
                style={{ transformOrigin: 'top' }}
                className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-amber-600/40 via-rose-600/30 to-transparent border-b border-amber-400/40 z-20 pointer-events-none rounded-t-3xl flex justify-center items-start pt-3"
              >
                {/* Glowing Heart Wax Seal */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 border border-amber-200 flex items-center justify-center shadow-lg">
                  <Heart className="w-4 h-4 text-white fill-white" />
                </div>
              </motion.div>

              {/* Envelope Body Base */}
              <div className="h-24 bg-slate-950/90 border-t border-slate-800 z-30" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
