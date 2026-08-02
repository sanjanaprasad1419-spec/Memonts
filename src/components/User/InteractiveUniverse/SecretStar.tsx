import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Heart } from 'lucide-react';

export const SecretStar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hidden Glowing Star */}
      <motion.button
        onClick={() => setIsOpen(true)}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.4, 0.9, 0.4],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="interactive absolute top-24 right-[15%] z-20 w-5 h-5 flex items-center justify-center cursor-pointer group"
        title="✨ Hidden Secret"
      >
        <div className="w-2.5 h-2.5 bg-amber-300 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.9)] group-hover:scale-150 transition-transform" />
      </motion.button>

      {/* Secret Popup Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative backdrop-blur-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="interactive absolute top-4 right-4 p-1.5 rounded-full bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Sparkles className="w-7 h-7 animate-spin-slow" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-extrabold text-white">
                  You found your first secret.
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  More hidden stars and surprise easter eggs will unlock as our universe expands!
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-rose-400 font-semibold">
                <Heart className="w-3.5 h-3.5 fill-rose-500/20" />
                <span>Found with curiosity</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
