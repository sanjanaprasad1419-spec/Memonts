import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  subscribeWelcomeBackgrounds,
  type WelcomeBackgroundPhoto,
} from '../../../services/backgroundService';
import {
  subscribeGalleryPhotos,
  type GalleryPhoto,
} from '../../../services/galleryService';

interface FadedBackgroundCollageProps {
  opacity?: number;
  rotationIntervalMs?: number;
}

const SLOT_POSITIONS = [
  {
    // Top Left
    className: 'top-[-2%] left-[-2%] w-[38vw] h-[38vh] -rotate-2',
    floatAnimation: { y: [0, -10, 0], transition: { duration: 7, repeat: Infinity, ease: 'easeInOut' as const } },
  },
  {
    // Top Center
    className: 'top-[-4%] left-[30vw] w-[40vw] h-[38vh] rotate-1',
    floatAnimation: { y: [0, 11, 0], transition: { duration: 8.5, repeat: Infinity, ease: 'easeInOut' as const } },
  },
  {
    // Top Right
    className: 'top-[-2%] right-[-2%] w-[38vw] h-[38vh] rotate-2',
    floatAnimation: { y: [0, 12, 0], transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' as const } },
  },
  {
    // Middle Left
    className: 'top-[28vh] left-[-3%] w-[38vw] h-[40vh] rotate-3',
    floatAnimation: { y: [0, -8, 0], transition: { duration: 6.5, repeat: Infinity, ease: 'easeInOut' as const } },
  },
  {
    // Middle Center (Fills center of screen)
    className: 'top-[26vh] left-[28vw] w-[44vw] h-[44vh] -rotate-1',
    floatAnimation: { y: [0, 14, 0], transition: { duration: 9, repeat: Infinity, ease: 'easeInOut' as const } },
  },
  {
    // Middle Right
    className: 'top-[28vh] right-[-3%] w-[38vw] h-[40vh] -rotate-3',
    floatAnimation: { y: [0, 10, 0], transition: { duration: 7.5, repeat: Infinity, ease: 'easeInOut' as const } },
  },
  {
    // Bottom Left
    className: 'bottom-[-2%] left-[-2%] w-[38vw] h-[38vh] -rotate-1',
    floatAnimation: { y: [0, -14, 0], transition: { duration: 8.5, repeat: Infinity, ease: 'easeInOut' as const } },
  },
  {
    // Bottom Center
    className: 'bottom-[-4%] left-[30vw] w-[40vw] h-[38vh] rotate-2',
    floatAnimation: { y: [0, -11, 0], transition: { duration: 7.8, repeat: Infinity, ease: 'easeInOut' as const } },
  },
  {
    // Bottom Right
    className: 'bottom-[-2%] right-[-2%] w-[38vw] h-[38vh] rotate-1',
    floatAnimation: { y: [0, 9, 0], transition: { duration: 7, repeat: Infinity, ease: 'easeInOut' as const } },
  },
];

export const FadedBackgroundCollage: React.FC<FadedBackgroundCollageProps> = ({
  opacity = 0.22,
  rotationIntervalMs = 3800,
}) => {
  const [welcomePhotos, setWelcomePhotos] = useState<WelcomeBackgroundPhoto[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);

  useEffect(() => {
    const unsub1 = subscribeWelcomeBackgrounds((items) => setWelcomePhotos(items || []));
    const unsub2 = subscribeGalleryPhotos((items) => setGalleryPhotos(items || []));
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  // Combine unique image URLs from both background and gallery sources
  const allPhotoUrls = useMemo(() => {
    const urls: string[] = [];
    const seen = new Set<string>();

    const addPhoto = (url?: string) => {
      if (!url || typeof url !== 'string' || !url.trim()) return;
      if (url.match(/\.(mp4|webm|ogg|mov|m4v|avi|mkv)(\?.*)?$/i)) return;
      if (!seen.has(url)) {
        seen.add(url);
        urls.push(url);
      }
    };

    welcomePhotos.forEach((p) => addPhoto(p.imageUrl));
    galleryPhotos.forEach((p) => addPhoto(p.imageUrl));

    return urls;
  }, [welcomePhotos, galleryPhotos]);

  // Ensure pool has sufficient photos to populate 9 slots
  const pool = useMemo(() => {
    if (allPhotoUrls.length === 0) return [];
    let list = [...allPhotoUrls];
    while (list.length < 9) {
      list = [...list, ...allPhotoUrls];
    }
    return list;
  }, [allPhotoUrls]);

  // Map each of the 9 floating slots to an index in `pool`
  const [slotPhotoIndices, setSlotPhotoIndices] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const activeSlotIndexRef = useRef<number>(0);

  // Staggered photo updates: change 1 slot every rotationIntervalMs for dynamic organic transition
  useEffect(() => {
    if (pool.length === 0) return;

    const interval = setInterval(() => {
      setSlotPhotoIndices((prevIndices) => {
        const next = [...prevIndices];
        const slotToUpdate = activeSlotIndexRef.current;
        activeSlotIndexRef.current = (activeSlotIndexRef.current + 1) % 9;

        const currentUsed = new Set(next);
        let candidates = pool
          .map((_, idx) => idx)
          .filter((idx) => !currentUsed.has(idx) && idx !== prevIndices[slotToUpdate]);

        if (candidates.length === 0) {
          candidates = pool
            .map((_, idx) => idx)
            .filter((idx) => idx !== prevIndices[slotToUpdate]);
        }

        if (candidates.length > 0) {
          const randomNext = candidates[Math.floor(Math.random() * candidates.length)];
          next[slotToUpdate] = randomNext;
        } else {
          next[slotToUpdate] = (next[slotToUpdate] + 1) % pool.length;
        }

        return next;
      });
    }, rotationIntervalMs);

    return () => clearInterval(interval);
  }, [pool, rotationIntervalMs]);

  if (pool.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
      style={{ opacity }}
    >
      {SLOT_POSITIONS.map((slot, slotIdx) => {
        const photoIndexInPool = slotPhotoIndices[slotIdx] % pool.length;
        const currentPhotoUrl = pool[photoIndexInPool];

        return (
          <motion.div
            key={`slot-${slotIdx}`}
            animate={slot.floatAnimation}
            className={`absolute ${slot.className} pointer-events-none filter blur-[1px] sm:blur-[2px] [mask-image:radial-gradient(ellipse_75%_75%_at_50%_50%,black_35%,transparent_100%)]`}
          >
            <AnimatePresence mode="wait">
              {currentPhotoUrl && (
                <motion.img
                  key={`slot-${slotIdx}-img-${currentPhotoUrl}`}
                  src={currentPhotoUrl}
                  alt=""
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.04 }}
                  transition={{ duration: 2.2, ease: 'easeInOut' }}
                  className="w-full h-full object-cover rounded-[40px]"
                />
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

