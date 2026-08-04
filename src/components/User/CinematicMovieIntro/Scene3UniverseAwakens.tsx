import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { startSoftBgMusic } from '../../../utils/bgMusic';
import { FadedBackgroundCollage } from '../Universe/FadedBackgroundCollage';

interface Scene3UniverseAwakensProps {
  onComplete: () => void;
}

export const Scene3UniverseAwakens: React.FC<Scene3UniverseAwakensProps> = ({ onComplete }) => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showName, setShowName] = useState(false);

  useEffect(() => {
    // Start soft background music when Welcome screen appears
    startSoftBgMusic();

    // Timeline sequence
    const t2 = setTimeout(() => setShowWelcome(true), 1500);
    const t3 = setTimeout(() => setShowName(true), 3000);
    const t4 = setTimeout(onComplete, 6800);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)', transition: { duration: 1.2 } }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden"
    >
      {/* 5-Photo Batch Rotating Faded Background Collage behind text & stars */}
      <FadedBackgroundCollage opacity={0.16} rotationIntervalMs={5000} />

      {/* Main Text Content */}
      <div className="relative z-10 space-y-4 max-w-xl">
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="text-2xl sm:text-3xl font-serif italic text-slate-300 tracking-wider"
          >
            Welcome...
          </motion.div>
        )}

        {showName && (
          <motion.h1
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl font-black tracking-tight text-white font-sans drop-shadow-2xl"
          >
            Shubham ❤️
          </motion.h1>
        )}
      </div>
    </motion.div>
  );
};
