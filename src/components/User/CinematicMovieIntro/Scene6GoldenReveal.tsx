import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BlendedPhotoBackground } from '../BlendedPhotoBackground';

interface Scene6GoldenRevealProps {
  onComplete: () => void;
}

export const Scene6GoldenReveal: React.FC<Scene6GoldenRevealProps> = ({ onComplete }) => {
  const [wordStep, setWordStep] = useState(0);

  useEffect(() => {
    // Cinematic pop timing sequence
    const t1 = setTimeout(() => setWordStep(1), 500);
    const t2 = setTimeout(() => setWordStep(2), 1400);
    const t3 = setTimeout(() => setWordStep(3), 2300);
    const t4 = setTimeout(() => setWordStep(4), 3300);
    const t5 = setTimeout(onComplete, 7500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 1 } }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden"
    >
      {/* Uploaded Memory Photos Blended in Background */}
      <BlendedPhotoBackground />

      <div className="space-y-4 max-w-3xl relative z-10 font-sans">
        {wordStep >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, filter: 'blur(12px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ type: 'spring', damping: 20, stiffness: 250 }}
            className="text-3xl sm:text-5xl font-extrabold uppercase tracking-widest text-amber-200/90"
          >
            Happy
          </motion.div>
        )}

        {wordStep >= 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, filter: 'blur(12px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ type: 'spring', damping: 20, stiffness: 250 }}
            className="text-5xl sm:text-7xl font-black uppercase tracking-widest text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]"
          >
            30th
          </motion.div>
        )}

        {wordStep >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, filter: 'blur(12px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ type: 'spring', damping: 20, stiffness: 250 }}
            className="text-3xl sm:text-5xl font-extrabold uppercase tracking-widest text-amber-200/90"
          >
            Birthday
          </motion.div>
        )}

        {wordStep >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            transition={{ type: 'spring', damping: 18, stiffness: 200 }}
            className="text-4xl sm:text-7xl font-black tracking-tight bg-gradient-to-r from-amber-100 via-rose-200 to-amber-300 bg-clip-text text-transparent pt-4 drop-shadow-2xl"
          >
            Shubham ❤️
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
