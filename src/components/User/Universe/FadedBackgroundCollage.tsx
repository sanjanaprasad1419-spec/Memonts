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
    className: 'top-[4%] left-[2%] w-[34vw] max-w-[360px] h-[30vw] max-h-[310px] -rotate-3',
    floatAnimation: { y: [0, -10, 0], transition: { duration: 7, repeat: Infinity, ease: 'easeInOut' as const } },
  },
  {
    // Top Right
    className: 'top-[5%] right-[3%] w-[35vw] max-w-[370px] h-[32vw] max-h-[320px] rotate-2',
    floatAnimation: { y: [0, 12, 0], transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' as const } },
  },
  {
    // Middle Left
    className: 'top-[36%] left-[1%] w-[30vw] max-w-[320px] h-[28vw] max-h-[290px] rotate-4',
    floatAnimation: { y: [0, -8, 0], transition: { duration: 6.5, repeat: Infinity, ease: 'easeInOut' as const } },
  },
  {
    // Middle Right
    className: 'top-[38%] right-[2%] w-[31vw] max-w-[330px] h-[29vw] max-h-[300px] -rotate-4',
    floatAnimation: { y: [0, 10, 0], transition: { duration: 7.5, repeat: Infinity, ease: 'easeInOut' as const } },
  },
  {
    // Bottom Left
    className: 'bottom-[5%] left-[3%] w-[34vw] max-w-[360px] h-[31vw] max-h-[320px] -rotate-2',
    floatAnimation: { y: [0, -14, 0], transition: { duration: 8.5, repeat: Infinity, ease: 'easeInOut' as const } },
  },
  {
    // Bottom Right
    className: 'bottom-[6%] right-[4%] w-[32vw] max-w-[340px] h-[30vw] max-h-[310px] rotate-3',
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

  // Ensure pool has sufficient photos to populate 6 slots
  const pool = useMemo(() => {
    if (allPhotoUrls.length === 0) return [];
    let list = [...allPhotoUrls];
    while (list.length < 6) {
      list = [...list, ...allPhotoUrls];
    }
    return list;
  }, [allPhotoUrls]);

  // Map each of the 6 floating slots to an index in `pool`
  const [slotPhotoIndices, setSlotPhotoIndices] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  const activeSlotIndexRef = useRef<number>(0);

  // Staggered photo updates: change 1 slot every rotationIntervalMs for dynamic organic transition
  useEffect(() => {
    if (pool.length === 0) return;

    const interval = setInterval(() => {
      setSlotPhotoIndices((prevIndices) => {
        const next = [...prevIndices];
        const slotToUpdate = activeSlotIndexRef.current;
        activeSlotIndexRef.current = (activeSlotIndexRef.current + 1) % 6;

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

