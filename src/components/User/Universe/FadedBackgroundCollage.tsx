import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  subscribeWelcomeBackgrounds,
  type WelcomeBackgroundPhoto,
} from '../../../services/backgroundService';

interface FadedBackgroundCollageProps {
  opacity?: number;
  rotationIntervalMs?: number;
}

export const FadedBackgroundCollage: React.FC<FadedBackgroundCollageProps> = ({
  opacity = 0.15,
  rotationIntervalMs = 6000,
}) => {
  const [photos, setPhotos] = useState<WelcomeBackgroundPhoto[]>([]);
  const [batchIndex, setBatchIndex] = useState<number>(0);

  useEffect(() => {
    const unsub = subscribeWelcomeBackgrounds((items) => {
      setPhotos(items);
    });
    return () => unsub();
  }, []);

  const totalBatches = useMemo(() => {
    if (photos.length === 0) return 0;
    return Math.ceil(photos.length / 5);
  }, [photos.length]);

  // Rotate through batches of 5 photos every rotationIntervalMs
  useEffect(() => {
    if (totalBatches <= 1) return;
    const interval = setInterval(() => {
      setBatchIndex((prev) => (prev + 1) % totalBatches);
    }, rotationIntervalMs);
    return () => clearInterval(interval);
  }, [totalBatches, rotationIntervalMs]);

  // Extract current 5 photos for display
  const currentFivePhotos = useMemo(() => {
    if (photos.length === 0) return [];
    const start = (batchIndex * 5) % photos.length;
    const result: WelcomeBackgroundPhoto[] = [];
    for (let i = 0; i < Math.min(5, photos.length); i++) {
      result.push(photos[(start + i) % photos.length]);
    }
    return result;
  }, [photos, batchIndex]);

  if (photos.length === 0) return null;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-batch-${batchIndex}`}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: opacity, scale: 1.1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 2.2, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full filter blur-[2px] [mask-image:radial-gradient(ellipse_85%_85%_at_50%_50%,black_45%,transparent_100%)] overflow-hidden"
        >
          {/* 5-Photo Aesthetic Romantic Collage Grid */}
          <div className="grid grid-cols-3 grid-rows-2 gap-4 sm:gap-6 w-full h-full p-6">
            {currentFivePhotos.map((photo, i) => {
              // Layout positions for 5 photos across a 3x2 grid
              const gridSpan =
                i === 0
                  ? 'col-span-1 row-span-1 border border-slate-700/40 rounded-3xl overflow-hidden scale-105 -rotate-2'
                  : i === 1
                  ? 'col-span-1 row-span-2 border border-slate-700/40 rounded-3xl overflow-hidden scale-110 rotate-1'
                  : i === 2
                  ? 'col-span-1 row-span-1 border border-slate-700/40 rounded-3xl overflow-hidden scale-100 rotate-3'
                  : i === 3
                  ? 'col-span-1 row-span-1 border border-slate-700/40 rounded-3xl overflow-hidden scale-105 rotate-[-3deg]'
                  : 'col-span-1 row-span-1 border border-slate-700/40 rounded-3xl overflow-hidden scale-100 rotate-2';

              return (
                <div key={`${photo.id}-${i}`} className={`relative w-full h-full ${gridSpan}`}>
                  <img
                    src={photo.imageUrl}
                    alt=""
                    className="w-full h-full object-cover rounded-3xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40"></div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
