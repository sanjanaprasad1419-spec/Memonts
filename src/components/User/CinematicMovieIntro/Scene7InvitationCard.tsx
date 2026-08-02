import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { BlendedPhotoBackground } from '../BlendedPhotoBackground';

interface Scene7InvitationCardProps {
  onEnterMyWorld: () => void;
}

export const Scene7InvitationCard: React.FC<Scene7InvitationCardProps> = ({ onEnterMyWorld }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 0.8 } }}
      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden"
    >
      {/* Uploaded Memory Photos Blended in Background */}
      <BlendedPhotoBackground />

      {/* Floating Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="relative z-10 backdrop-blur-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-800/80 rounded-3xl p-8 sm:p-14 shadow-2xl max-w-2xl w-full space-y-8 overflow-hidden"
      >
        {/* Glow Accent Circles */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Heart Emblem */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500/20 via-pink-500/20 to-amber-500/20 border border-rose-500/30 text-rose-400 shadow-inner">
          <Heart className="w-8 h-8 fill-rose-500/20 animate-pulse" />
        </div>

        {/* Headings */}
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-rose-100 to-amber-200 bg-clip-text text-transparent">
            This place <br className="hidden sm:block" /> was built only for you.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto font-medium leading-relaxed">
            Inside are memories, little surprises, stories, laughter and moments collected with love.
          </p>
        </div>

        {/* Premium CTA Button */}
        <div className="pt-2">
          <button
            onClick={onEnterMyWorld}
            className="interactive group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:via-pink-500 hover:to-amber-500 border border-rose-500/40 shadow-2xl shadow-rose-600/30 hover:shadow-rose-600/50 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>Enter My World ❤️</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
