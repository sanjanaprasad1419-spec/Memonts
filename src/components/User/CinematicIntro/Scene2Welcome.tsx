import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface Scene2WelcomeProps {
  onComplete: () => void;
}

export const Scene2Welcome: React.FC<Scene2WelcomeProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)', transition: { duration: 1 } }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6 select-none"
    >
      <div className="space-y-4 max-w-2xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight bg-gradient-to-r from-white via-rose-100 to-amber-200 bg-clip-text text-transparent"
        >
          Welcome, Shubham ❤️
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-base sm:text-xl text-slate-300 font-serif italic tracking-wide"
        >
          A small world made with love.
        </motion.p>
      </div>
    </motion.div>
  );
};
