import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { subscribeMusic, setActiveBackgroundSong, type SongItem } from '../../services/musicService';
import { Play, Pause, Volume2, VolumeX, Square, Music as MusicIcon, Sparkles } from 'lucide-react';

interface GlobalMusicPlayerProps {
  isIntroPlaying?: boolean;
}

export const GlobalMusicPlayer: React.FC<GlobalMusicPlayerProps> = ({ isIntroPlaying = false }) => {
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [activeSong, setActiveSong] = useState<SongItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isExplicitlyStopped, setIsExplicitlyStopped] = useState<boolean>(false);
  const [isPausedByMedia, setIsPausedByMedia] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Subscribe to Realtime Music Collection
  useEffect(() => {
    const unsubscribe = subscribeMusic((items) => {
      setSongs(items);
      const active = items.find((s) => s.isActiveBackground && s.audioUrl && s.audioUrl.trim().length > 10);
      if (active) {
        setActiveSong(active);
      } else if (items.length > 0 && !activeSong) {
        const firstWithAudio = items.find((s) => s.audioUrl && s.audioUrl.trim().length > 10);
        if (firstWithAudio) setActiveSong(firstWithAudio);
      }
    });

    const handleBgMusicChanged = (e: Event) => {
      const customEvt = e as CustomEvent;
      const song = customEvt.detail as SongItem | null;
      if (song && song.audioUrl && song.audioUrl.trim().length > 10) {
        setActiveSong(song);
        setIsExplicitlyStopped(false);
        setIsPausedByMedia(false);
      } else {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }
    };

    window.addEventListener('bg-music-changed', handleBgMusicChanged);

    return () => {
      unsubscribe();
      window.removeEventListener('bg-music-changed', handleBgMusicChanged);
    };
  }, []);

  // Listen to Window Media Events
  useEffect(() => {
    const handlePauseBgMedia = () => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPausedByMedia(true);
        setIsPlaying(false);
      }
    };

    const handleResumeBgMedia = () => {
      if (audioRef.current && isPausedByMedia && !isExplicitlyStopped && !isIntroPlaying) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          setIsPausedByMedia(false);
        }).catch(() => {});
      }
    };

    const handleStopAllMusic = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        setIsExplicitlyStopped(true);
      }
    };

    window.addEventListener('pause-bg-music', handlePauseBgMedia);
    window.addEventListener('resume-bg-music', handleResumeBgMedia);
    window.addEventListener('stop-all-music', handleStopAllMusic);

    return () => {
      window.removeEventListener('pause-bg-music', handlePauseBgMedia);
      window.removeEventListener('resume-bg-music', handleResumeBgMedia);
      window.removeEventListener('stop-all-music', handleStopAllMusic);
    };
  }, [isPausedByMedia, isExplicitlyStopped, isIntroPlaying]);

  // Sync Audio Element ONLY with Exact Admin Uploaded Audio URL
  useEffect(() => {
    if (isIntroPlaying || !activeSong || !activeSong.audioUrl || activeSong.audioUrl.trim().length <= 10) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(activeSong.audioUrl);
      audioRef.current.loop = true;
    } else {
      if (audioRef.current.src !== activeSong.audioUrl) {
        audioRef.current.src = activeSong.audioUrl;
      }
    }

    // Play ONLY if active background theme and not paused by video/voice notes or explicitly stopped
    if (activeSong.isActiveBackground && !isExplicitlyStopped && !isPausedByMedia) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.info('Playback waiting for user gesture click:', err);
          setIsPlaying(false);
        });
    }
  }, [activeSong, isExplicitlyStopped, isPausedByMedia, isIntroPlaying]);

  const togglePlay = () => {
    if (!activeSong || !activeSong.audioUrl || activeSong.audioUrl.trim().length <= 10) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(activeSong.audioUrl);
      audioRef.current.loop = true;
    }

    if (audioRef.current.src !== activeSong.audioUrl) {
      audioRef.current.src = activeSong.audioUrl;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsExplicitlyStopped(false);
      setIsPausedByMedia(false);

      // Set active theme
      setActiveBackgroundSong(activeSong.id);

      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('Playback error:', err);
          setIsPlaying(false);
        });
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsExplicitlyStopped(true);
    setActiveBackgroundSong(null);
  };

  // Hide during intro, or if no songs available
  if (isIntroPlaying || songs.length === 0 || !activeSong || !activeSong.audioUrl) {
    return null;
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      whileDrag={{ scale: 1.04, cursor: 'grabbing' }}
      style={{ touchAction: 'none' }}
      className="fixed bottom-5 left-5 z-[100] animate-fadeIn select-none cursor-grab active:cursor-grabbing pointer-events-auto"
    >
      <div className="flex items-center gap-3 backdrop-blur-2xl bg-slate-950/95 border border-rose-500/50 rounded-2xl p-2.5 sm:px-4 sm:py-3 shadow-[0_10px_35px_rgba(0,0,0,0.85)] shadow-rose-950/50">
        {/* Animated Equalizer Soundwaves / Drag Indicator */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 shadow-md flex items-center justify-center shrink-0">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            {isPlaying ? (
              <div className="flex items-end justify-center gap-0.5 h-4">
                <span className="w-0.5 bg-rose-400 animate-[bounce_1s_infinite_100ms] h-full" />
                <span className="w-0.5 bg-pink-400 animate-[bounce_1s_infinite_300ms] h-2/3" />
                <span className="w-0.5 bg-amber-400 animate-[bounce_1s_infinite_200ms] h-4/5" />
              </div>
            ) : (
              <MusicIcon className="w-4 h-4 text-rose-400" />
            )}
          </div>
        </div>

        {/* Track Title & Artist */}
        <div className="hidden sm:flex flex-col min-w-0 max-w-[180px] pointer-events-none">
          <span className="text-xs font-bold text-slate-100 truncate">
            {activeSong.title}
          </span>
          <span className="text-[10px] text-slate-400 truncate flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span>{activeSong.artist}</span>
          </span>
        </div>

        {/* Controls */}
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="flex items-center gap-1 sm:gap-1.5 pl-1 border-l border-slate-800 pointer-events-auto"
        >
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-rose-300 transition-colors cursor-pointer"
            title={isPlaying ? 'Pause Music' : 'Play Background Music'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-rose-400" />}
          </button>

          {/* Mute/Unmute */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Stop Button */}
          <button
            onClick={handleStop}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            title="Stop Music"
          >
            <Square className="w-3.5 h-3.5 text-rose-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
