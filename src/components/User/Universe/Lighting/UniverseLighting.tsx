import React from 'react';

export const UniverseLighting: React.FC = () => {
  return (
    <>
      {/* Soft Ambient Light */}
      <ambientLight intensity={0.4} color="#e0e7ff" />

      {/* Main Directional Rim Light */}
      <directionalLight
        position={[8, 12, 10]}
        intensity={1.2}
        color="#fbbf24"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Opposite Soft Rim Light */}
      <directionalLight position={[-10, -6, -8]} intensity={0.8} color="#f43f5e" />

      {/* Top Volumetric Glow Light */}
      <pointLight position={[0, 10, 0]} intensity={1.5} color="#c084fc" distance={25} />
    </>
  );
};
