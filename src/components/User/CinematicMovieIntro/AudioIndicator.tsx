import React, { useState } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { startSoftBgMusic, stopBgMusic } from '../../../utils/bgMusic';

export const AudioIndicator: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleMusic = () => {
    if (isPlaying) {
      stopBgMusic();
      setIsPlaying(false);
    } else {
      startSoftBgMusic();
      setIsPlaying(true);
    }
  };

  return (
    <button
      onClick={toggleMusic}
      className="interactive fixed top-5 right-5 z-50 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold shadow-lg select-none cursor-pointer transition-all hover:border-rose-500/40"
    >
      <Music className={`w-3.5 h-3.5 ${isPlaying ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
      <span>{isPlaying ? 'Surili Akhiyon Wale (Soft)' : 'Muted'}</span>
      {isPlaying ? (
        <Volume2 className="w-3.5 h-3.5 text-rose-400" />
      ) : (
        <VolumeX className="w-3.5 h-3.5 text-slate-500" />
      )}
    </button>
  );
};
