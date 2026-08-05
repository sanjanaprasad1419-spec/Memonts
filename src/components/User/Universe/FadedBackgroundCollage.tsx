import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  opacity = 0.3,
  rotationIntervalMs = 3500,
}) => {
  const [welcomePhotos, setWelcomePhotos] = useState<WelcomeBackgroundPhoto[]>([]);

  useEffect(() => {
    const unsub = subscribeWelcomeBackgrounds((items) => setWelcomePhotos(items || []));
    return () => unsub();
  }, []);

  // Exclusively render photos uploaded in Admin Background section (NO Constellation / Gallery photos!)
  const allPhotoUrls = useMemo(() => {
    const urls: string[] = [];
    const seen = new Set<string>();

    welcomePhotos.forEach((p) => {
      const url = p?.imageUrl;
      if (!url || typeof url !== 'string' || !url.trim()) return;
      if (url.match(/\.(mp4|webm|ogg|mov|m4v|avi|mkv)(\?.*)?$/i)) return;
      if (!seen.has(url)) {
        seen.add(url);
        urls.push(url);
      }
    });

    return urls;
  }, [welcomePhotos]);

  // Ensure pool has at least 9 photos to populate all 9 grid cells
  const pool = useMemo(() => {
    if (allPhotoUrls.length === 0) return [];
    let list = [...allPhotoUrls];
    while (list.length < 9) {
      list = [...list, ...allPhotoUrls];
    }
    return list;
  }, [allPhotoUrls]);

  // Map each of the 9 grid cells to an index in `pool`
  const [cellPhotoIndices, setCellPhotoIndices] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const activeCellRef = useRef<number>(0);

  // Staggered photo updates: update 1 cell every rotationIntervalMs for smooth background evolution
  useEffect(() => {
    if (pool.length === 0) return;

    const interval = setInterval(() => {
      setCellPhotoIndices((prevIndices) => {
        const next = [...prevIndices];
        const cellToUpdate = activeCellRef.current;
        activeCellRef.current = (activeCellRef.current + 1) % 9;

        const currentUsed = new Set(next);
        let candidates = pool
          .map((_, idx) => idx)
          .filter((idx) => !currentUsed.has(idx) && idx !== prevIndices[cellToUpdate]);

        if (candidates.length === 0) {
          candidates = pool
            .map((_, idx) => idx)
            .filter((idx) => idx !== prevIndices[cellToUpdate]);
        }

        if (candidates.length > 0) {
          const randomNext = candidates[Math.floor(Math.random() * candidates.length)];
          next[cellToUpdate] = randomNext;
        } else {
          next[cellToUpdate] = (next[cellToUpdate] + 1) % pool.length;
        }

        return next;
      });
    }, rotationIntervalMs);

    return () => clearInterval(interval);
  }, [pool, rotationIntervalMs]);

  if (pool.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none p-1 sm:p-2"
      style={{ opacity }}
    >
      {/* 3x3 Non-Overlapping Feathered Photo Collage Grid covering 100% screen including top-center, center & bottom-center */}
      <div className="grid grid-cols-3 grid-rows-3 gap-2 sm:gap-4 w-full h-full">
        {cellPhotoIndices.map((photoIdxInPool, cellIdx) => {
          const currentPhotoUrl = pool[photoIdxInPool % pool.length];

          return (
            <div
              key={`cell-${cellIdx}`}
              className={`relative w-full h-full overflow-hidden filter blur-[1px] sm:blur-[2px] [mask-image:radial-gradient(ellipse_95%_95%_at_50%_50%,black_35%,transparent_95%)] ${
                cellIdx % 2 === 0 ? 'scale-105 -rotate-1' : 'scale-105 rotate-1'
              }`}
            >
              <AnimatePresence mode="wait">
                {currentPhotoUrl && (
                  <motion.img
                    key={`cell-${cellIdx}-img-${currentPhotoUrl}`}
                    src={currentPhotoUrl}
                    alt=""
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 2.2, ease: 'easeInOut' }}
                    className="w-full h-full object-cover rounded-3xl"
                  />
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};


