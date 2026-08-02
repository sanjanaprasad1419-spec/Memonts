import React from 'react';
import { Calendar, ArrowRight, Heart } from 'lucide-react';

interface LetterCardProps {
  title: string;
  date: string;
  preview: string;
  onRead: () => void;
}

export const LetterCard: React.FC<LetterCardProps> = ({ title, date, preview, onRead }) => {
  return (
    <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-slate-950/80 border border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-xl hover:border-rose-500/40 transition-all duration-300 group flex flex-col justify-between space-y-5 relative overflow-hidden">
      {/* Envelope Accent Line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500"></div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shadow-inner">
            <Heart className="w-6 h-6 fill-rose-500/20" />
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] font-medium text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-rose-400" />
            <span>{date}</span>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white group-hover:text-rose-200 transition-colors">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
            {preview}
          </p>
        </div>
      </div>

      <button
        onClick={onRead}
        className="w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm text-white bg-slate-950/80 hover:bg-gradient-to-r hover:from-rose-600 hover:to-amber-600 border border-slate-800 hover:border-rose-500/40 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md group/btn"
      >
        <span>Read Letter</span>
        <ArrowRight className="w-4 h-4 text-rose-400 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
      </button>
    </div>
  );
};
