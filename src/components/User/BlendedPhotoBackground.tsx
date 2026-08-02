import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeWelcomeBackgrounds, type WelcomeBackgroundPhoto } from '../../services/backgroundService';

export const BlendedPhotoBackground: React.FC = () => {
  const [photos, setPhotos] = useState<WelcomeBackgroundPhoto[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    // Subscribe to Firestore welcomeBackground collection in real time
    const unsubscribe = subscribeWelcomeBackgrounds((fetched) => {
      setPhotos(fetched);
    });

    return () => unsubscribe();
  }, []);

  // Crossfade between uploaded memory photos every 5.5 seconds
  useEffect(() => {
    if (photos.length <= 1) return;
    const interval = setInterval(() => {
      setActivePhotoIndex((prev) => (prev + 1) % photos.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [photos]);

  if (photos.length === 0) return null;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={`blended-photo-${activePhotoIndex}`}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.12, scale: 1.12 }}
          exit={{ opacity: 0, transition: { duration: 2 } }}
          transition={{ duration: 5.5, ease: 'easeInOut' }}
          className="absolute inset-0 filter blur-md [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_30%,transparent_100%)] overflow-hidden"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full h-full p-4">
            {photos.slice(0, 6).map((photo, i) => (
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
      </AnimatePresence>
    </div>
  );
};
