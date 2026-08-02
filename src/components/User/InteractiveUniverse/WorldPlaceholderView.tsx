import React from 'react';
import { motion } from 'framer-motion';
import { BackButton } from '../BackButton';
import { Sparkles, Heart } from 'lucide-react';
import type { WorldChapter } from './OrbitingPlanet';

interface WorldPlaceholderViewProps {
  chapter: WorldChapter;
  onBack: () => void;
}

export const WorldPlaceholderView: React.FC<WorldPlaceholderViewProps> = ({ chapter, onBack }) => {
  const Icon = chapter.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none"
    >
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex justify-start">
          <BackButton onClick={onBack} label="Return to Universe" />
        </div>

        {/* Chapter Header Card */}
        <div className="backdrop-blur-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-slate-800/80 rounded-3xl p-8 sm:p-14 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Ambient Top Glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-purple-500 to-amber-400" />

          {/* Chapter Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-950 border border-slate-800 text-rose-400 shadow-inner">
            <Icon className="w-10 h-10" />
          </div>

          {/* Headings */}
          <div className="space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chapter World</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              {chapter.name}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-serif italic">
              "{chapter.subtitle}"
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 max-w-md mx-auto space-y-2">
            <h4 className="text-sm font-bold text-slate-200">
              Surprise Content Coming Soon
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              This world chapter is currently under preparation. Full memory experiences, galleries, letters, and audio features will unfold in Phase 7.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium pt-2">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
            <span>Built for Shubham</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
