import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SpaceBackgroundProps {
  isFrozen?: boolean;
  showGoldenGlow?: boolean;
  starDensity?: 'low' | 'high';
}

export const SpaceBackground: React.FC<SpaceBackgroundProps> = ({
  isFrozen = false,
  showGoldenGlow = false,
  starDensity = 'high',
}) => {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      setMouseOffset({
        x: (e.clientX - centerX) / 45,
        y: (e.clientY - centerY) / 45,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate deterministic star positions
  const starsCount = starDensity === 'high' ? 45 : 20;
  const stars = Array.from({ length: starsCount }).map((_, i) => ({
    id: i,
    top: `${(i * 17) % 100}%`,
    left: `${(i * 23) % 100}%`,
    size: (i % 3) + 1.5,
    opacity: 0.3 + ((i % 5) * 0.15),
    delay: (i % 4) * 0.8,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 bg-slate-950">
      {/* Aurora Layer 1 - Deep Purple/Navy */}
      <motion.div
        animate={{
          x: mouseOffset.x * -1.5,
          y: mouseOffset.y * -1.5,
          scale: isFrozen ? 1 : [1, 1.15, 1],
          opacity: [0.12, 0.22, 0.12],
        }}
        transition={{ duration: 16, repeat: isFrozen ? 0 : Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -left-32 w-[650px] h-[650px] bg-gradient-to-br from-indigo-950 via-purple-900/30 to-slate-950 rounded-full blur-[160px]"
      />

      {/* Aurora Layer 2 - Soft Blue/Rose */}
      <motion.div
        animate={{
          x: mouseOffset.x * 2,
          y: mouseOffset.y * 2,
          scale: isFrozen ? 1 : [1.1, 1, 1.1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 18, repeat: isFrozen ? 0 : Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute -bottom-32 -right-32 w-[700px] h-[700px] bg-gradient-to-tr from-slate-950 via-rose-950/20 to-blue-900/20 rounded-full blur-[160px]"
      />

      {/* Golden Reveal Glow (Activated in Scene 6) */}
      {showGoldenGlow && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 0.35, scale: 1.2 }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/30 via-rose-500/20 to-amber-600/30 rounded-full blur-[150px]"
        />
      )}

      {/* Star Particles Layer */}
      <motion.div
        animate={{
          x: mouseOffset.x * 0.8,
          y: mouseOffset.y * 0.8,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        className="absolute inset-0"
      >
        {stars.map((star) => (
          <motion.div
            key={star.id}
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
            animate={
              isFrozen
                ? { opacity: star.opacity }
                : {
                    opacity: [star.opacity * 0.4, star.opacity, star.opacity * 0.4],
                    scale: [1, 1.3, 1],
                  }
            }
            transition={{
              duration: 3 + (star.id % 3),
              repeat: isFrozen ? 0 : Infinity,
              ease: 'easeInOut',
              delay: star.delay,
            }}
            className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          />
        ))}
      </motion.div>

      {/* Vignette Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.85)_100%)] pointer-events-none" />
    </div>
  );
};
