import React from 'react';
import { FadedBackgroundCollage } from './Universe/FadedBackgroundCollage';

export const BlendedPhotoBackground: React.FC = () => {
  return <FadedBackgroundCollage opacity={0.25} rotationIntervalMs={3600} />;
};

