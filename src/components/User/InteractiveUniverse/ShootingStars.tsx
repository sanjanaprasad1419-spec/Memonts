import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShootingStar {
  id: number;
  top: string;
  left: string;
  angle: number;
}

export const ShootingStars: React.FC = () => {
  const [activeStar, setActiveStar] = useState<ShootingStar | null>(null);

  useEffect(() => {
    const triggerStar = () => {
      const star: ShootingStar = {
        id: Date.now(),
        top: `${Math.floor(Math.random() * 50)}%`,
        left: `${Math.floor(Math.random() * 60)}%`,
        angle: Math.floor(Math.random() * 20) + 35,
      };
      setActiveStar(star);

      setTimeout(() => setActiveStar(null), 1800);
    };

    // Trigger shooting star every 6-9 seconds
    const interval = setInterval(triggerStar, 7000);
    triggerStar();

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
      <AnimatePresence>
        {activeStar && (
          <motion.div
            key={activeStar.id}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0], x: 220, y: 220, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              top: activeStar.top,
              left: activeStar.left,
              transform: `rotate(${activeStar.angle}deg)`,
            }}
            className="absolute w-28 h-0.5 bg-gradient-to-r from-amber-200 via-rose-300 to-transparent rounded-full shadow-[0_0_12px_rgba(251,191,36,0.8)]"
          />
        )}
      </AnimatePresence>
    </div>
  );
};
