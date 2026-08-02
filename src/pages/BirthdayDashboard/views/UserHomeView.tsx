import React from 'react';
import { CinematicMovieIntro } from '../../../components/User/CinematicMovieIntro/CinematicMovieIntro';

interface UserHomeViewProps {
  onEnter: () => void;
}

export const UserHomeView: React.FC<UserHomeViewProps> = ({ onEnter }) => {
  return <CinematicMovieIntro onEnterGiftWorld={onEnter} />;
};
