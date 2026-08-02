import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Scene5FreezeAnticipationProps {
  onComplete: () => void;
}

export const Scene5FreezeAnticipation: React.FC<Scene5FreezeAnticipationProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    // 1. Today... for 2 seconds
    const t1 = setTimeout(() => setStep(2), 2000);
    // 2. isn't just another day. for 4.5 seconds
    const t2 = setTimeout(() => setStep(3), 6500);
    // 3. Because... for 3 seconds
    const t3 = setTimeout(onComplete, 9500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      className="absolute inset-0 z-30 bg-slate-950/95 flex items-center justify-center p-6 text-center select-none"
    >
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.h2
            key="step-1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(8px)' }}
            transition={{ duration: 0.9 }}
            className="text-3xl sm:text-5xl font-serif text-slate-200 font-light tracking-widest"
          >
            Today...
          </motion.h2>
        )}

        {step === 2 && (
          <motion.h2
            key="step-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(8px)' }}
            transition={{ duration: 0.9 }}
            className="text-3xl sm:text-5xl font-serif text-rose-200 font-light tracking-wide max-w-xl leading-relaxed"
          >
            isn't just another day.
          </motion.h2>
        )}

        {step === 3 && (
          <motion.h2
            key="step-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(8px)' }}
            transition={{ duration: 0.9 }}
            className="text-3xl sm:text-5xl font-serif text-amber-200 font-light tracking-widest"
          >
            Because...
          </motion.h2>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
