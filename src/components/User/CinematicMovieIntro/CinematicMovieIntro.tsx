import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CustomCursor } from './CustomCursor';
import { SpaceBackground } from './SpaceBackground';
import { AudioIndicator } from './AudioIndicator';
import { Scene2StoryBegins } from './Scene2StoryBegins';
import { Scene3UniverseAwakens } from './Scene3UniverseAwakens';
import { Scene5FreezeAnticipation } from './Scene5FreezeAnticipation';
import { Scene6GoldenReveal } from './Scene6GoldenReveal';
import { Scene7InvitationCard } from './Scene7InvitationCard';
import { stopBgMusic } from '../../../utils/bgMusic';
import { stopTypingSound } from '../../../utils/typeSound';
import { FastForward } from 'lucide-react';

interface CinematicMovieIntroProps {
  onEnterGiftWorld: () => void;
}

export const CinematicMovieIntro: React.FC<CinematicMovieIntroProps> = ({ onEnterGiftWorld }) => {
  // Scene Flow:
  // 1: Story Typing (Pure Black)
  // 2: Universe & Welcome Shubham (Photo Collage background)
  // 3: Today... -> isn't just another day. -> Because...
  // 4: Happy 30th Birthday Shubham ❤️ (Golden Reveal)
  // 5: Invitation Card (Enter My World ❤️)
  const [currentScene, setCurrentScene] = useState<1 | 2 | 3 | 4 | 5>(1);

  const handleNextScene = () => {
    setCurrentScene((prev) => {
      if (prev < 5) return (prev + 1) as 1 | 2 | 3 | 4 | 5;
      return 5;
    });
  };

  const handleSkipIntro = () => {
    stopTypingSound();
    setCurrentScene(5); // Instantly jump to Scene 5 (Enter My World ❤️ page)
  };

  const handleEnterWorld = () => {
    stopBgMusic();
    onEnterGiftWorld();
  };

  return (
    <div className="relative w-full h-screen bg-black text-slate-100 overflow-hidden flex flex-col justify-between select-none">
      {/* Custom 60fps Glowing Cursor */}
      <CustomCursor />

      {/* Space Environment Background */}
      {currentScene > 1 && (
        <SpaceBackground
          isFrozen={currentScene === 3}
          showGoldenGlow={currentScene === 4}
          starDensity={currentScene >= 2 ? 'high' : 'low'}
        />
      )}

      {/* Audio Corner Badge */}
      <AudioIndicator />

      {/* Prominent Skip Intro Button (Positioned top-20 left-6 below navbar with z-[100] high visibility) */}
      {currentScene < 5 && (
        <button
          onClick={handleSkipIntro}
          className="interactive fixed top-20 left-6 z-[100] flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 text-white font-black text-xs uppercase tracking-wider border border-rose-300/60 shadow-[0_0_25px_rgba(244,63,94,0.5)] cursor-pointer transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_35px_rgba(244,63,94,0.8)]"
        >
          <span>Skip Intro</span>
          <FastForward className="w-4 h-4 text-amber-200 animate-pulse" />
        </button>
      )}

      {/* Cinematic Scenes Animated Switcher */}
      <AnimatePresence mode="wait">
        {currentScene === 1 && (
          <Scene2StoryBegins key="scene-story" onComplete={handleNextScene} />
        )}

        {currentScene === 2 && (
          <Scene3UniverseAwakens key="scene-universe" onComplete={handleNextScene} />
        )}

        {currentScene === 3 && (
          <Scene5FreezeAnticipation key="scene-today" onComplete={handleNextScene} />
        )}

        {currentScene === 4 && (
          <Scene6GoldenReveal key="scene-reveal" onComplete={handleNextScene} />
        )}

        {currentScene === 5 && (
          <Scene7InvitationCard key="scene-invitation" onEnterMyWorld={handleEnterWorld} />
        )}
      </AnimatePresence>
    </div>
  );
};
