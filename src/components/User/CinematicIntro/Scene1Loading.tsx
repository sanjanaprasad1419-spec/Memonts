import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface Scene1LoadingProps {
  onComplete: () => void;
}

export const Scene1Loading: React.FC<Scene1LoadingProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 1 } }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950 text-white p-6 select-none"
    >
      {/* Center Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="flex flex-col items-center space-y-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-0.5 shadow-2xl shadow-rose-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Heart className="w-8 h-8 text-rose-400 fill-rose-500/40 animate-pulse" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-rose-300 via-pink-200 to-amber-200 bg-clip-text text-transparent">
          Sansh-memonts
        </h1>
      </motion.div>

      {/* Progress & Subtitle */}
      <div className="mt-12 w-full max-w-xs space-y-3 text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Loading... {progress}%
        </div>

        <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <motion.div
            className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
};
