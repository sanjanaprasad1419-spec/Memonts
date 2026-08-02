import React, { useState } from 'react';
import { UserLayout } from '../../components/User/UserLayout';
import { UserHomeView } from './views/UserHomeView';
import { MemoryHubView } from './views/MemoryHubView';
import { BirthdayCelebrationView } from './views/BirthdayCelebrationView';
import { UserGalleryView } from './views/UserGalleryView';
import { UserLettersView } from './views/UserLettersView';
import { LetterDetailView } from './views/LetterDetailView';
import { UserVideosView } from './views/UserVideosView';
import { UserVoiceNotesView } from './views/UserVoiceNotesView';
import { UserMusicView } from './views/UserMusicView';
import { UserFutureMemoriesView } from './views/UserFutureMemoriesView';

export type UserSubView =
  | 'home'
  | 'hub'
  | 'celebration'
  | 'gallery'
  | 'letters'
  | 'letter-view'
  | 'videos'
  | 'voice-notes'
  | 'music'
  | 'future';

export const BirthdayDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<UserSubView>('home');

  const getSectionTitle = (view: UserSubView): string => {
    switch (view) {
      case 'home':
        return 'Welcome';
      case 'hub':
        return 'Memory Hub';
      case 'celebration':
        return '30th Birthday';
      case 'gallery':
        return 'Photo Gallery';
      case 'letters':
        return 'Personal Letters';
      case 'letter-view':
        return 'Reading Letter';
      case 'videos':
        return 'Video Vault';
      case 'voice-notes':
        return 'Voice Notes';
      case 'music':
        return 'Background Music';
      case 'future':
        return 'Future Memories';
      default:
        return 'Experience';
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <UserHomeView onEnter={() => setCurrentView('hub')} />;
      case 'hub':
        return <MemoryHubView />;
      case 'celebration':
        return <BirthdayCelebrationView onBack={() => setCurrentView('hub')} />;
      case 'gallery':
        return <UserGalleryView onBack={() => setCurrentView('hub')} />;
      case 'letters':
        return (
          <UserLettersView
            onBack={() => setCurrentView('hub')}
            onSelectLetter={() => {
              setCurrentView('letter-view');
            }}
          />
        );
      case 'letter-view':
        return <LetterDetailView onBack={() => setCurrentView('letters')} />;
      case 'videos':
        return <UserVideosView onBack={() => setCurrentView('hub')} />;
      case 'voice-notes':
        return <UserVoiceNotesView onBack={() => setCurrentView('hub')} />;
      case 'music':
        return <UserMusicView onBack={() => setCurrentView('hub')} />;
      case 'future':
        return <UserFutureMemoriesView onBack={() => setCurrentView('hub')} />;
      default:
        return <UserHomeView onEnter={() => setCurrentView('hub')} />;
    }
  };

  return (
    <UserLayout
      currentSectionTitle={getSectionTitle(currentView)}
      onNavigateHome={() => setCurrentView('home')}
    >
      {renderCurrentView()}
    </UserLayout>
  );
};
