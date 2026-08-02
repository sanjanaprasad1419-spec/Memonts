import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ParticleBackground } from './ParticleBackground';
import { AudioIndicator } from './AudioIndicator';
import { Scene1Loading } from './Scene1Loading';
import { Scene2Welcome } from './Scene2Welcome';
import { Scene3FloatingMemories } from './Scene3FloatingMemories';
import { Scene4TypewriterReveal } from './Scene4TypewriterReveal';
import { Scene5GiftWorld } from './Scene5GiftWorld';
import { FastForward } from 'lucide-react';

interface CinematicIntroProps {
  onEnterGiftWorld: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onEnterGiftWorld }) => {
  const [currentScene, setCurrentScene] = useState<1 | 2 | 3 | 4 | 5>(1);

  const handleNextScene = () => {
    setCurrentScene((prev) => {
      if (prev < 5) return (prev + 1) as 1 | 2 | 3 | 4 | 5;
      return 5;
    });
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 text-slate-100 overflow-hidden flex flex-col justify-between select-none">
      {/* Ambient Animated Particles & Lights */}
      <ParticleBackground />

      {/* Music Coming Soon Corner Badge */}
      <AudioIndicator />

      {/* Optional Skip Intro Control (Available after Scene 1) */}
      {currentScene > 1 && currentScene < 5 && (
        <button
          onClick={() => setCurrentScene(5)}
          className="fixed top-5 left-5 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold shadow-lg cursor-pointer transition-colors"
        >
          <span>Skip Intro</span>
          <FastForward className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Cinematic Scenes Animated Switcher */}
      <AnimatePresence mode="wait">
        {currentScene === 1 && (
          <Scene1Loading key="scene-1" onComplete={handleNextScene} />
        )}
        {currentScene === 2 && (
          <Scene2Welcome key="scene-2" onComplete={handleNextScene} />
        )}
        {currentScene === 3 && (
          <Scene3FloatingMemories key="scene-3" onComplete={handleNextScene} />
        )}
        {currentScene === 4 && (
          <Scene4TypewriterReveal key="scene-4" onComplete={handleNextScene} />
        )}
        {currentScene === 5 && (
          <Scene5GiftWorld key="scene-5" onEnterGiftWorld={onEnterGiftWorld} />
        )}
      </AnimatePresence>
    </div>
  );
};
