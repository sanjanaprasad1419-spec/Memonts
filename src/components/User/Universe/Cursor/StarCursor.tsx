import React, { useEffect, useRef, useState } from 'react';

export const StarCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number }[]>([]);

  useEffect(() => {
    let animFrameId: number;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.closest('button') ||
          target.closest('a') ||
          target.closest('.interactive') ||
          target.classList.contains('interactive'))
      ) {
        if (!isHovered) {
          setIsHovered(true);
          triggerParticleBurst(targetX, targetY);
        }
      } else {
        setIsHovered(false);
      }
    };

    const triggerParticleBurst = (x: number, y: number) => {
      const newParticles = Array.from({ length: 6 }).map((_, i) => ({
        id: Date.now() + i,
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        size: Math.random() * 4 + 2,
      }));
      setParticles((prev) => [...prev.slice(-12), ...newParticles]);
    };

    const updatePosition = () => {
      currentX += (targetX - currentX) * 0.25;
      currentY += (targetY - currentY) * 0.25;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentX - (isHovered ? 16 : 8)}px, ${
          currentY - (isHovered ? 16 : 8)
        }px, 0)`;
      }
      if (starRef.current) {
        starRef.current.style.transform = `translate3d(${targetX - 4}px, ${targetY - 4}px, 0)`;
      }

      animFrameId = requestAnimationFrame(updatePosition);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    animFrameId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animFrameId);
    };
  }, [isVisible, isHovered]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none hidden md:block">
      {/* Outer Glowing Star Halo */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 rounded-full border border-rose-300/50 bg-rose-500/10 backdrop-blur-xs transition-all duration-150 pointer-events-none ${
          isHovered ? 'w-8 h-8 border-amber-300/80 bg-amber-400/20 scale-125' : 'w-4 h-4'
        }`}
      />

      {/* Inner Glowing White Star */}
      <div
        ref={starRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.95)] pointer-events-none"
      />

      {/* Particle Bursts on Hover */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
          className="fixed rounded-full bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-ping pointer-events-none opacity-80"
        />
      ))}
    </div>
  );
};
