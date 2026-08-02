import React from 'react';
import { PageContainer } from '../../../components/User/PageContainer';
import { BackButton } from '../../../components/User/BackButton';
import { Heart, Sparkles, Calendar } from 'lucide-react';

interface LetterDetailViewProps {
  onBack: () => void;
}

export const LetterDetailView: React.FC<LetterDetailViewProps> = ({ onBack }) => {
  return (
    <PageContainer maxWidth="3xl">
      <BackButton onClick={onBack} label="Back to Letters" />

      <div className="animate-fadeIn">
        {/* Paper-Style Reader Card */}
        <div className="relative backdrop-blur-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-rose-500/20 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 overflow-hidden">
          {/* Subtle Ambient Top Border */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500"></div>

          {/* Letter Header */}
          <div className="border-b border-slate-800/80 pb-6 space-y-3 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-2">
              <Heart className="w-7 h-7 fill-rose-500/20 animate-pulse" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Happy Birthday ❤️
            </h1>

            <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-rose-400" />
              <span>June 19, 2026</span>
              <span>•</span>
              <span className="text-rose-400">Written with Love</span>
            </div>
          </div>

          {/* Letter Body Content (Placeholder text formatted with paper aesthetics) */}
          <div className="space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed font-serif tracking-wide sm:px-4">
            <p>Dearest Shubham,</p>

            <p>
              Happy 30th Birthday! Reaching this incredible milestone is a celebration of everything you are—kind, hardworking, passionate, and deeply cherished.
            </p>

            <p>
              This website is a small digital universe built just for you, filled with memories, letters, and songs that remind us of all the wonderful moments we have shared. Every corner of this experience was crafted with love and excitement for your special day.
            </p>

            <p>
              May this year bring you endless happiness, health, success, and adventures. Keep shining bright and staying true to the amazing person you are.
            </p>

            <div className="pt-4 flex flex-col items-end text-right font-sans">
              <p className="text-xs text-slate-400">Forever & Always,</p>
              <p className="text-base font-bold bg-gradient-to-r from-rose-300 to-amber-300 bg-clip-text text-transparent">
                With All My Love ❤️
              </p>
            </div>
          </div>

          {/* Bottom Stamp Footer */}
          <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Memory Note #01
            </span>
            <span>OurVerse Letters</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
