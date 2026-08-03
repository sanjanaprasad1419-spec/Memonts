import React, { type ReactNode } from 'react';
import { UserNavbar } from './UserNavbar';
import { GlobalMusicPlayer } from './GlobalMusicPlayer';

interface UserLayoutProps {
  children: ReactNode;
  currentSectionTitle: string;
  onNavigateHome: () => void;
}

export const UserLayout: React.FC<UserLayoutProps> = ({
  children,
  currentSectionTitle,
  onNavigateHome,
}) => {
  const isIntroPlaying = currentSectionTitle === 'Welcome';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-rose-500/30 selection:text-rose-200 relative overflow-x-hidden">
      {/* Dynamic Glow Accents */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      <UserNavbar currentSectionTitle={currentSectionTitle} onNavigateHome={onNavigateHome} />

      <main className="flex-1 flex flex-col relative z-10">
        {children}
      </main>

      {/* Global Background Music Player Across Universe */}
      <GlobalMusicPlayer isIntroPlaying={isIntroPlaying} />
    </div>
  );
};
