import React from 'react';
import { Calendar, Image as ImageIcon } from 'lucide-react';

interface MemoryCardProps {
  imagePlaceholderText?: string;
  caption: string;
  date: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  imagePlaceholderText = 'Photo Memory',
  caption,
  date,
  aspectRatio = 'square',
}) => {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
  };

  return (
    <div className="backdrop-blur-md bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700/80 transition-all duration-300 group flex flex-col">
      {/* Placeholder Image container */}
      <div className={`relative w-full ${aspectClasses[aspectRatio]} bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/30 border-b border-slate-800 flex flex-col items-center justify-center p-4 text-center overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent z-10 opacity-80"></div>
        <ImageIcon className="w-10 h-10 text-rose-500/40 group-hover:scale-110 transition-transform duration-300 mb-2 relative z-0" />
        <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase relative z-0">
          {imagePlaceholderText}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
        <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
          {caption}
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <Calendar className="w-3.5 h-3.5 text-rose-400" />
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
};
