import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Scene4TypewriterRevealProps {
  onComplete: () => void;
}

export const Scene4TypewriterReveal: React.FC<Scene4TypewriterRevealProps> = ({ onComplete }) => {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setLineIndex(1), 1000);
    const t2 = setTimeout(() => setLineIndex(2), 2400);
    const t3 = setTimeout(() => setLineIndex(3), 4000);
    const t4 = setTimeout(onComplete, 6200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 1 } }}
      transition={{ duration: 1 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6 bg-slate-950/95 select-none overflow-hidden"
    >
      {/* Soft Golden Ambient Glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: lineIndex >= 3 ? 0.35 : 0.15, scale: lineIndex >= 3 ? 1.2 : 1 }}
        transition={{ duration: 2 }}
        className="absolute w-[550px] h-[550px] bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 rounded-full blur-[160px] pointer-events-none"
      />

      <div className="relative z-10 space-y-6 max-w-3xl">
        {lineIndex >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-2xl sm:text-4xl font-semibold tracking-wider text-slate-300 uppercase font-sans"
          >
            Happy Birthday
          </motion.div>
        )}

        {lineIndex >= 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9 }}
            className="text-5xl sm:text-7xl font-black tracking-tight text-white font-sans"
          >
            Shubham
          </motion.div>
        )}

        {lineIndex >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1 }}
            className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-rose-300 to-amber-400 bg-clip-text text-transparent pt-4"
          >
            Happy Birthday ❤️
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
