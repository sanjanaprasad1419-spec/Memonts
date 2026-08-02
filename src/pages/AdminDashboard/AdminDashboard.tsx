import React, { useState } from 'react';
import { AdminSidebar, type AdminTab } from '../../components/Admin/AdminSidebar';
import { AdminNavbar } from '../../components/Admin/AdminNavbar';
import { OverviewTab } from './views/OverviewTab';
import { MemoryManagerTab } from './views/MemoryManagerTab';
import { EventsTab } from './views/EventsTab';
import { GalleryTab } from './views/GalleryTab';
import { LettersTab } from './views/LettersTab';
import { VoiceNotesTab } from './views/VoiceNotesTab';
import { VideosTab } from './views/VideosTab';
import { MusicTab } from './views/MusicTab';
import { SettingsTab } from './views/SettingsTab';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const getPageTitle = (tab: AdminTab): string => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'memory-manager':
        return 'Memory Manager';
      case 'events':
        return 'Events Management';
      case 'gallery':
        return 'Photo Gallery';
      case 'letters':
        return 'Personal Letters';
      case 'voice-notes':
        return 'Voice Notes';
      case 'videos':
        return 'Video Vault';
      case 'music':
        return 'Background Music';
      case 'settings':
        return 'Admin Settings';
      default:
        return 'Admin Panel';
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <OverviewTab onNavigate={setActiveTab} />;
      case 'memory-manager':
        return <MemoryManagerTab />;
      case 'events':
        return <EventsTab />;
      case 'gallery':
        return <GalleryTab />;
      case 'letters':
        return <LettersTab />;
      case 'voice-notes':
        return <VoiceNotesTab />;
      case 'videos':
        return <VideosTab />;
      case 'music':
        return <MusicTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <OverviewTab onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden selection:bg-rose-500/30 selection:text-rose-200">
      {/* Admin Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Navbar */}
        <AdminNavbar
          pageTitle={getPageTitle(activeTab)}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
};
