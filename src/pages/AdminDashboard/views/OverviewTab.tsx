import React, { useState, useEffect } from 'react';
import { StatCard } from '../../../components/Admin/StatCard';
import { SectionTitle } from '../../../components/Admin/SectionTitle';
import { ActionButton } from '../../../components/Admin/ActionButton';
import {
  Calendar,
  Image as ImageIcon,
  FileText,
  Video,
  Mic,
  Music as MusicIcon,
  Plus,
  Clock,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import type { AdminTab } from '../../../components/Admin/AdminSidebar';
import { subscribeToEvents } from '../../../services/eventService';
import { subscribeGalleryPhotos } from '../../../services/galleryService';

interface OverviewTabProps {
  onNavigate: (tab: AdminTab) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onNavigate }) => {
  const [counts, setCounts] = useState({
    events: 0,
    photos: 0,
    letters: 0,
    videos: 0,
    voiceNotes: 0,
    music: 0,
  });

  useEffect(() => {
    const unsubEvents = subscribeToEvents((events) => {
      setCounts((prev) => ({ ...prev, events: events.length }));
    });

    const unsubGallery = subscribeGalleryPhotos((photos) => {
      setCounts((prev) => ({ ...prev, photos: photos.length }));
    });

    return () => {
      unsubEvents();
      unsubGallery();
    };
  }, []);

  const stats = [
    { title: 'Events', count: counts.events, icon: Calendar, color: 'amber' },
    { title: 'Photos', count: counts.photos, icon: ImageIcon, color: 'rose' },
    { title: 'Letters', count: counts.letters, icon: FileText, color: 'purple' },
    { title: 'Videos', count: counts.videos, icon: Video, color: 'blue' },
    { title: 'Voice Notes', count: counts.voiceNotes, icon: Mic, color: 'emerald' },
    { title: 'Music', count: counts.music, icon: MusicIcon, color: 'pink' },
  ] as const;

  const activities = [
    {
      id: '1',
      title: 'Birthday Event Management Active',
      description: 'Dynamic event creation, edit, delete, and real-time sync enabled.',
      time: 'Just now',
      icon: Sparkles,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    {
      id: '2',
      title: 'Admin Logged In',
      description: 'Authenticated session active for Admin',
      time: '5 minutes ago',
      icon: Lock,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    },
    {
      id: '3',
      title: 'Realtime Storage Active',
      description: 'IndexedDB persistent cache active for media and event archives',
      time: '1 hour ago',
      icon: CheckCircle2,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950/80 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-rose-500/10 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Admin Overview
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Manage events, memories, letters, voice notes, and media settings for the upcoming surprise experience.
          </p>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div>
        <SectionTitle title="Statistics Overview" description="Current metrics across all media categories" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              count={stat.count}
              icon={stat.icon}
              accentColor={stat.color}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <SectionTitle title="Quick Actions" description="Fast access to core administration workflows" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors">
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-200 text-sm pt-2">Create Event</h4>
              <p className="text-xs text-slate-400">Set up new birthday celebration timelines.</p>
            </div>
            <ActionButton label="Create Event" icon={Plus} variant="primary" onClick={() => onNavigate('events')} />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors">
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-200 text-sm pt-2">Add Letter</h4>
              <p className="text-xs text-slate-400">Draft heartfelt notes and personal letters.</p>
            </div>
            <ActionButton label="Add Letter" icon={Plus} variant="secondary" onClick={() => onNavigate('letters')} />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors">
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-200 text-sm pt-2">Open Gallery</h4>
              <p className="text-xs text-slate-400">Organize photo albums and memory grids.</p>
            </div>
            <ActionButton label="Open Gallery" icon={ImageIcon} variant="secondary" onClick={() => onNavigate('gallery')} />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors">
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center">
                <MusicIcon className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-200 text-sm pt-2">Manage Music</h4>
              <p className="text-xs text-slate-400">Configure background songs and playlists.</p>
            </div>
            <ActionButton label="Manage Music" icon={MusicIcon} variant="secondary" onClick={() => onNavigate('music')} />
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div>
        <SectionTitle title="Recent Activity" description="Audit log of recent system events" />
        <div className="backdrop-blur-md bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
          <div className="space-y-6">
            {activities.map((act, index) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="relative flex items-start gap-4 group">
                  {index !== activities.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-slate-800 -mb-6"></div>
                  )}

                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${act.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-200">{act.title}</h4>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {act.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{act.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
