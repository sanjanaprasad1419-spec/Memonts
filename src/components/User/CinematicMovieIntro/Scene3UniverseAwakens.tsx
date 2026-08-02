import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeWelcomeBackgrounds, type WelcomeBackgroundPhoto } from '../../../services/backgroundService';
import { startSoftBgMusic } from '../../../utils/bgMusic';

interface Scene3UniverseAwakensProps {
  onComplete: () => void;
}

export const Scene3UniverseAwakens: React.FC<Scene3UniverseAwakensProps> = ({ onComplete }) => {
  const [skyAwakened, setSkyAwakened] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showName, setShowName] = useState(false);
  const [welcomePhotos, setWelcomePhotos] = useState<WelcomeBackgroundPhoto[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    // Start soft background music when Welcome screen appears
    startSoftBgMusic();

    // Subscribe to Firestore welcomeBackground collection in real time
    const unsubscribe = subscribeWelcomeBackgrounds((items) => {
      setWelcomePhotos(items);
    });

    // Timeline sequence
    const t1 = setTimeout(() => setSkyAwakened(true), 600);
    const t2 = setTimeout(() => setShowWelcome(true), 2000);
    const t3 = setTimeout(() => setShowName(true), 3400);
    const t4 = setTimeout(onComplete, 6800);

    return () => {
      unsubscribe();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  // Rotate through photos for smooth background crossfade every 5 seconds
  useEffect(() => {
    if (welcomePhotos.length <= 1) return;
    const interval = setInterval(() => {
      setActivePhotoIndex((prev) => (prev + 1) % welcomePhotos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [welcomePhotos]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)', transition: { duration: 1.2 } }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden"
    >
      {/* Realtime Firestore Welcome Background Photo Collage */}
      <AnimatePresence>
        {welcomePhotos.length > 0 ? (
          <motion.div
            key={`collage-${activePhotoIndex}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.12, scale: 1.12 }}
            exit={{ opacity: 0, transition: { duration: 2 } }}
            transition={{ duration: 5.5, ease: 'easeInOut' }}
            className="absolute inset-0 z-0 pointer-events-none filter blur-md [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_30%,transparent_100%)] overflow-hidden"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full h-full p-4">
              {welcomePhotos.slice(0, 6).map((photo, i) => (
                <div
                  key={photo.id || i}
                  className={`relative w-full h-full ${
                    i % 2 === 0 ? 'scale-110 translate-y-3' : 'scale-105 -translate-y-3'
                  }`}
                >
                  <img
                    src={photo.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Premium Abstract Aurora Background Fallback if empty */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: skyAwakened ? 1 : 0 }}
            transition={{ duration: 2.5, ease: 'easeInOut' }}
            className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-purple-950/20 to-slate-950/90 pointer-events-none"
          />
        )}
      </AnimatePresence>

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
