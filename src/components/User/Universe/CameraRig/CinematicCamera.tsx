import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CinematicCameraProps {
  isZooming: boolean;
  onZoomComplete?: () => void;
}

export const CinematicCamera: React.FC<CinematicCameraProps> = ({ isZooming, onZoomComplete }) => {
  const { camera } = useThree();
  const targetZ = useRef(20); // Start in space
  const currentZ = useRef(20);

  useEffect(() => {
    // Balanced 3D camera distance (9.2) so foreground cards never obstruct bottom bar
    targetZ.current = 9.2;
  }, []);

  useEffect(() => {
    if (isZooming) {
      targetZ.current = 4.2; // Zoom close when card selected
    } else {
      targetZ.current = 9.2; // Balanced camera distance
    }
  }, [isZooming]);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();

    // Smoothly lerp camera Z position
    currentZ.current = THREE.MathUtils.lerp(currentZ.current, targetZ.current, 0.05);
    camera.position.z = currentZ.current;

    // Slow, subtle space breathing floating movement
    camera.position.y = Math.sin(elapsedTime * 0.3) * 0.1;
    camera.position.x = Math.cos(elapsedTime * 0.25) * 0.08;

    camera.lookAt(0, 0, 0);

    if (isZooming && Math.abs(currentZ.current - targetZ.current) < 0.2) {
      if (onZoomComplete) onZoomComplete();
    }
  });

  return null;
};
