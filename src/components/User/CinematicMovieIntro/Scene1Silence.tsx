import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface Scene1SilenceProps {
  onComplete: () => void;
}

export const Scene1Silence: React.FC<Scene1SilenceProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
      className="absolute inset-0 z-40 bg-black flex items-center justify-center select-none cursor-none"
    >
      <div className="flex items-center gap-1 font-mono text-slate-300 text-lg">
        <span>&gt;</span>
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-2.5 h-5 bg-slate-100 inline-block shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        />
      </div>
    </motion.div>
  );
};
