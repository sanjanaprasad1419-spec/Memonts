import React from 'react';
import { VolumeX, Music } from 'lucide-react';

export const AudioIndicator: React.FC = () => {
  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-400 text-xs font-semibold shadow-lg select-none">
      <VolumeX className="w-4 h-4 text-slate-500" />
      <Music className="w-3.5 h-3.5 text-rose-400" />
      <span>Music Coming Soon</span>
    </div>
  );
};
