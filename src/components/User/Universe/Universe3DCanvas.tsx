import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import { UniverseLighting } from './Lighting/UniverseLighting';
import { UniverseParticles } from './Particles/UniverseParticles';
import { CinematicCamera } from './CameraRig/CinematicCamera';
import { OrbitRig } from './OrbitController/OrbitRig';
import { StarCursor } from './Cursor/StarCursor';
import { EnvelopeOpeningModal } from './EnvelopeOpeningModal';
import { WorldPlaceholderView } from '../InteractiveUniverse/WorldPlaceholderView';
import { UserGalleryView } from '../../../pages/BirthdayDashboard/views/UserGalleryView';
import { UserLettersView } from '../../../pages/BirthdayDashboard/views/UserLettersView';
import { UserMusicView } from '../../../pages/BirthdayDashboard/views/UserMusicView';
import { UserVideosView } from '../../../pages/BirthdayDashboard/views/UserVideosView';
import { UserVoiceNotesView } from '../../../pages/BirthdayDashboard/views/UserVoiceNotesView';
import { UserFutureMemoriesView } from '../../../pages/BirthdayDashboard/views/UserFutureMemoriesView';
import { type WorldChapter3D } from './MemoryPlate/GlassPlate';
import {
  Camera,
  FileText,
  Music as MusicIcon,
  Video,
  Mic,
  Clock,
  Sparkles,
  Calendar,
} from 'lucide-react';

import { RealisticMoon } from './InteractiveMoon/RealisticMoon';
import { DistantPlanets } from './DistantPlanets/DistantPlanets';
import { FadedBackgroundCollage } from './FadedBackgroundCollage';

export const Universe3DCanvas: React.FC = () => {
  const [selectedChapter, setSelectedChapter] = useState<WorldChapter3D | null>(null);
  const [animatingChapter, setAnimatingChapter] = useState<WorldChapter3D | null>(null);
  const [isZooming, setIsZooming] = useState<boolean>(false);

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // 7 Holographic Memory Chapters Perfectly Spaced Out (Zero Overlaps, All 7 Cards 100% Visible!)
  const chapters: WorldChapter3D[] = [
    {
      id: 'constellation',
      name: 'Constellation',
      subtitle: 'Every picture has a story.',
      icon: Camera,
      color: 'amber',
      angle: -55,
      radius: 5.5,
      height: 1.1, // Floating top right
    },
    {
      id: 'letters-stars',
      name: 'Letters Between Stars',
      subtitle: 'Words I wanted you to read.',
      icon: FileText,
      color: 'rose',
      angle: 25,
      radius: 5.4,
      height: -0.4, // Right front
    },
    {
      id: 'echoes',
      name: 'Echoes',
      subtitle: 'Songs that remind me of us.',
      icon: MusicIcon,
      color: 'purple',
      angle: 65,
      radius: 5.8,
      height: 1.0, // Top right
    },
    {
      id: 'moments-motion',
      name: 'Moments In Motion',
      subtitle: 'Memories that still move.',
      icon: Video,
      color: 'blue',
      angle: 125,
      radius: 5.5,
      height: -0.5, // Bottom right
    },
    {
      id: 'your-voice',
      name: 'Your Voice',
      subtitle: 'The sound I never want to forget.',
      icon: Mic,
      color: 'emerald',
      angle: -170,
      radius: 5.6,
      height: 0.5, // Left mid
    },
    {
      id: 'time-capsule',
      name: 'Time Capsule',
      subtitle: 'Not today. One day.',
      icon: Clock,
      color: 'pink',
      angle: -125,
      radius: 5.7,
      height: -0.5, // Bottom left - 100% CLEAR AND FULLY VISIBLE!
    },
    {
      id: 'hidden-universe',
      name: 'Hidden Universe',
      subtitle: 'Some surprises are waiting.',
      icon: Sparkles,
      color: 'indigo',
      angle: -90,
      radius: 5.8,
      height: 1.25, // Top left
    },
  ];

  const handleSelectChapter = (ch: WorldChapter3D) => {
    setIsZooming(true);
    setAnimatingChapter(ch);
  };

  const handleAnimationComplete = () => {
    if (animatingChapter) {
      setSelectedChapter(animatingChapter);
      setAnimatingChapter(null);
      setIsZooming(false);
    }
  };

  const handleBack = () => {
    setSelectedChapter(null);
    setAnimatingChapter(null);
    setIsZooming(false);
  };

  const renderActiveWorldView = () => {
    if (!selectedChapter) return null;

    switch (selectedChapter.id) {
      case 'constellation':
        return <UserGalleryView onBack={handleBack} />;
      case 'letters-stars':
        return <UserLettersView onBack={handleBack} onSelectLetter={() => {}} />;
      case 'echoes':
        return <UserMusicView onBack={handleBack} />;
      case 'moments-motion':
        return <UserVideosView onBack={handleBack} />;
      case 'your-voice':
        return <UserVoiceNotesView onBack={handleBack} />;
      case 'time-capsule':
        return <UserFutureMemoriesView onBack={handleBack} />;
      default:
        return <WorldPlaceholderView chapter={selectedChapter} onBack={handleBack} />;
    }
  };

  return (
    <div className="relative w-full h-screen bg-black text-slate-100 overflow-hidden flex flex-col justify-between select-none">
      {/* Dynamic Organic Faded Background Collage (Active across Observatory & when Cards open) */}
      <FadedBackgroundCollage opacity={0.25} rotationIntervalMs={3600} />

      {/* 3D Glowing Star Cursor */}
      <StarCursor />

      {/* Date Header Badge */}
      <div className="absolute top-32 left-6 z-20 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-800 text-xs font-medium text-slate-300 shadow-xl">
        <Calendar className="w-3.5 h-3.5 text-rose-400" />
        <span>{currentDateFormatted}</span>
      </div>

      {/* Card Fly & Gift Envelope Unfolding Modal */}
      {animatingChapter && (
        <EnvelopeOpeningModal
          chapter={animatingChapter}
          onAnimationComplete={handleAnimationComplete}
        />
      )}

      {/* View Switcher: 3D Living Universe Canvas vs Selected Active World View */}
      <AnimatePresence mode="wait">
        {selectedChapter ? (
          <motion.div
            key={`world-view-${selectedChapter.id}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-30 w-full h-full overflow-y-auto"
          >
            {renderActiveWorldView()}
          </motion.div>
        ) : (
          <motion.div
            key="3d-canvas-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            className="absolute inset-0 z-10 w-full h-full"
          >
            {/* Realistic Interactive Full Moon (Exclusively on 3D Universe Page) */}
            <RealisticMoon />
            <Canvas
              dpr={[1, 2]}
              camera={{ position: [0, 0, 9.2], fov: 50 }}
              gl={{ antialias: true, alpha: true }}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            >
              <UniverseLighting />
              <UniverseParticles />
              <DistantPlanets />
              <CinematicCamera
                isZooming={isZooming}
                onZoomComplete={() => {}}
              />
              <OrbitRig
                chapters={chapters}
                onSelectChapter={handleSelectChapter}
              />
            </Canvas>

            {/* Bottom 3D Galaxy Chapter Navigation Bar */}
            <div className="absolute bottom-6 inset-x-0 z-20 flex flex-col items-center gap-2 px-4 pointer-events-auto">
              <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800 backdrop-blur-md shadow-lg">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Select Any Memory Card To Open</span>
              </span>

              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 custom-scrollbar backdrop-blur-2xl bg-slate-950/90 border border-slate-800/90 p-2 rounded-2xl shadow-2xl">
                {chapters.map((ch) => {
                  const Icon = ch.icon;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => handleSelectChapter(ch)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/50 text-xs font-bold text-slate-200 hover:text-white transition-all cursor-pointer whitespace-nowrap group hover:scale-105 active:scale-95 shadow-md"
                    >
                      <Icon className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
                      <span>{ch.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="fixed bottom-4 right-6 z-30 text-[11px] font-medium text-slate-500/80 tracking-wide pointer-events-none">
        Created with ❤️ by Sanjana
      </div>
    </div>
  );
};
