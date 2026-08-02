import React, { useEffect, useState } from 'react';
import { PageContainer } from '../../../components/User/PageContainer';
import { SectionHeader } from '../../../components/User/SectionHeader';
import { BackButton } from '../../../components/User/BackButton';
import { subscribeVideos, type VideoItem } from '../../../services/videoService';
import {
  Video as VideoIcon,
  Tag,
  Calendar,
  Star,
  Play,
} from 'lucide-react';

interface UserVideosViewProps {
  onBack: () => void;
}

export const UserVideosView: React.FC<UserVideosViewProps> = ({ onBack }) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    // Subscribe to Firestore videos collection in real time
    const unsubscribe = subscribeVideos((items) => {
      const valid = items.filter((v) => v && v.videoUrl && v.videoUrl.trim().length > 0);
      setVideos(valid);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenVideo = (vid: VideoItem) => {
    if (!vid.videoUrl || vid.videoUrl.trim().length === 0) return;
    window.dispatchEvent(new Event('pause-bg-music'));
    setActiveVideo(vid);
  };

  const handleCloseVideo = () => {
    setActiveVideo(null);
    window.dispatchEvent(new Event('resume-bg-music'));
  };

  const uniqueEvents = Array.from(new Set(videos.map((v) => v.eventName))).filter(Boolean);

  const filteredVideos = videos.filter((v) =>
    selectedEventFilter === 'all' ? true : v.eventName === selectedEventFilter
  );

  return (
    <PageContainer maxWidth="6xl">
      <BackButton onClick={onBack} label="Back to Universe" />

      <SectionHeader
        badge="Moments in Motion"
        title="Video Highlights"
        subtitle="Special video compilations, memories, and wishes captured on camera for you."
      />

      {/* Event Category Filter Pills */}
      {uniqueEvents.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar animate-fadeIn">
          <button
            onClick={() => setSelectedEventFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedEventFilter === 'all'
                ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300 shadow-md'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Events ({videos.length})
          </button>
          {uniqueEvents.map((evt) => (
            <button
              key={evt}
              onClick={() => setSelectedEventFilter(evt)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedEventFilter === evt
                  ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300 shadow-md'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {evt}
            </button>
          ))}
        </div>
      )}

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <VideoIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-100">Moments In Motion</h3>
            <p className="text-sm text-slate-400 max-w-md">
              When Sanjana uploads video memories in Admin Panel, your video highlights will automatically appear here in real time.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {filteredVideos.map((vid) => (
            <div
              key={vid.id}
              onClick={() => handleOpenVideo(vid)}
              className="interactive group backdrop-blur-xl bg-slate-900/60 border border-slate-800/80 hover:border-rose-500/50 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Video Thumbnail Player Container */}
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                {vid.videoUrl && vid.videoUrl.trim().length > 0 && (
                  <video src={vid.videoUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" muted />
                )}

                {/* Play Button Overlay */}
                <div className="absolute w-14 h-14 rounded-full bg-rose-600/90 border border-rose-400 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-white translate-x-0.5" />
                </div>

                {/* Favorite Badge */}
                {vid.favorite && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500/30 backdrop-blur-md border border-amber-400/80 text-amber-200 text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Favorite</span>
                  </div>
                )}
              </div>

              {/* Video Details */}
              <div className="p-4 space-y-2 bg-gradient-to-b from-slate-900/40 to-slate-950/80">
                <div className="flex items-center justify-between">
                  <div className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-bold flex items-center gap-1">
                    <Tag className="w-3 h-3 text-rose-400" />
                    <span>{vid.eventName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    <span>{vid.videoDate}</span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-100 group-hover:text-rose-300 transition-colors line-clamp-1">
                  {vid.title}
                </h4>

                {vid.description && (
                  <p className="text-xs text-slate-400 line-clamp-2">{vid.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Lightbox Player Modal */}
      {activeVideo && activeVideo.videoUrl && (
        <div
          onClick={handleCloseVideo}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              <video
                src={activeVideo.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">
                    {activeVideo.eventName}
                  </span>
                  <h3 className="text-base font-bold text-white">{activeVideo.title}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">{activeVideo.videoDate}</p>
              </div>
              <button
                onClick={handleCloseVideo}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold"
              >
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
