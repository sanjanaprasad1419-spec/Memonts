import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CentralPlanet } from './CentralPlanet';
import { OrbitingPlanet, type WorldChapter } from './OrbitingPlanet';
import { ShootingStars } from './ShootingStars';
import { SecretStar } from './SecretStar';
import { WorldPlaceholderView } from './WorldPlaceholderView';
import { BlendedPhotoBackground } from '../BlendedPhotoBackground';
import { stopBgMusic } from '../../../utils/bgMusic';
import {
  Image as ImageIcon,
  FileText,
  Music as MusicIcon,
  Video,
  Mic,
  Clock,
  Sparkles,
  Calendar,
} from 'lucide-react';

export const InteractiveUniverse: React.FC = () => {
  const [selectedChapter, setSelectedChapter] = useState<WorldChapter | null>(null);

  useEffect(() => {
    // Ensure background music stops completely when entering the main dashboard universe
    stopBgMusic();
  }, []);

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const chapters: WorldChapter[] = [
    {
      id: 'constellation',
      name: '🌠 Constellation',
      subtitle: 'Every picture has its own story.',
      icon: ImageIcon,
      color: 'amber',
      angle: -60,
      radius: 170,
    },
    {
      id: 'letters-stars',
      name: '💌 Letters Between Stars',
      subtitle: 'Words I wanted you to read.',
      icon: FileText,
      color: 'rose',
      angle: 0,
      radius: 200,
    },
    {
      id: 'echoes',
      name: '🎵 Echoes',
      subtitle: 'Songs that remind me of us.',
      icon: MusicIcon,
      color: 'purple',
      angle: 60,
      radius: 170,
    },
    {
      id: 'moments-motion',
      name: '🎥 Moments In Motion',
      subtitle: 'Videos frozen in time.',
      icon: Video,
      color: 'blue',
      angle: 120,
      radius: 200,
    },
    {
      id: 'your-voice',
      name: '🎙 Your Voice',
      subtitle: 'Because voices fade slower than memories.',
      icon: Mic,
      color: 'emerald',
      angle: 180,
      radius: 170,
    },
    {
      id: 'time-capsule',
      name: '🪐 Time Capsule',
      subtitle: 'Not today. One day.',
      icon: Clock,
      color: 'pink',
      angle: -140,
      radius: 210,
    },
    {
      id: 'hidden-universe',
      name: '✨ Hidden Universe',
      subtitle: "Some surprises aren't easy to find.",
      icon: Sparkles,
      color: 'indigo',
      angle: -100,
      radius: 210,
    },
  ];

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-slate-100 overflow-hidden flex flex-col justify-between select-none">
      {/* Uploaded Memory Photos Blended in Background */}
      <BlendedPhotoBackground />

      {/* Occasional Shooting Stars */}
      <ShootingStars />

      {/* Hidden Secret Star */}
      <SecretStar />

      {/* Date Header Badge */}
      <div className="absolute top-20 left-6 z-20 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-800 text-xs font-medium text-slate-400">
        <Calendar className="w-3.5 h-3.5 text-rose-400" />
        <span>{currentDateFormatted}</span>
      </div>

      {/* View Switcher: Universe Observatory vs Selected World View */}
      <AnimatePresence mode="wait">
        {selectedChapter ? (
          <WorldPlaceholderView
            key="world-view"
            chapter={selectedChapter}
            onBack={() => setSelectedChapter(null)}
          />
        ) : (
          <motion.div
            key="universe-observatory"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 flex-1 flex items-center justify-center p-4 min-h-[85vh]"
          >
            {/* Center Planet */}
            <CentralPlanet />

            {/* Surrounding Orbiting Planets */}
            {chapters.map((ch) => (
              <OrbitingPlanet
                key={ch.id}
                chapter={ch}
                onSelect={(selected) => setSelectedChapter(selected)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Bottom Right Footer */}
      <div className="fixed bottom-4 right-6 z-30 text-[11px] font-medium text-slate-500/80 tracking-wide pointer-events-none">
        Created with ❤️ by Sanjana
      </div>
    </div>
  );
};
