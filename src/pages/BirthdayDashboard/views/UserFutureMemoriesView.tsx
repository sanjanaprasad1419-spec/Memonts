import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../../components/User/PageContainer';
import { SectionHeader } from '../../../components/User/SectionHeader';
import { BackButton } from '../../../components/User/BackButton';
import {
  Calendar,
  Sparkles,
  Camera,
  Video as VideoIcon,
  FileText,
  Mic,
  ArrowRight,
  Play,
  Eye,
  X,
} from 'lucide-react';
import {
  getEvents,
  getEventCover,
  getEventStats,
  type BirthdayEvent,
  subscribeToEvents,
} from '../../../services/eventService';
import { subscribeGalleryPhotos, type GalleryPhoto } from '../../../services/galleryService';
import { subscribeVideos, type VideoItem } from '../../../services/videoService';
import { subscribeLetters, type Letter } from '../../../services/letterService';
import { subscribeVoiceNotes, type VoiceNoteItem } from '../../../services/voiceNoteService';
import { UNCATEGORIZED_EVENT } from '../../../services/supabaseSync.service';

interface UserFutureMemoriesViewProps {
  onBack: () => void;
}

export const UserFutureMemoriesView: React.FC<UserFutureMemoriesViewProps> = ({ onBack }) => {
  const [events, setEvents] = useState<BirthdayEvent[]>([]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNoteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Selected event for dedicated Event View
  const [activeEvent, setActiveEvent] = useState<BirthdayEvent | null>(null);

  // Lightboxes / Modals inside Event View
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);
  const [readingLetter, setReadingLetter] = useState<Letter | null>(null);

  useEffect(() => {
    const unsubEvents = subscribeToEvents((evts) => setEvents(evts));
    const unsubPhotos = subscribeGalleryPhotos((pts) => setPhotos(pts));
    const unsubVideos = subscribeVideos((vds) => setVideos(vds));
    const unsubLetters = subscribeLetters((lts) => setLetters(lts));
    const unsubVoiceNotes = subscribeVoiceNotes((vns) => setVoiceNotes(vns));

    getEvents().then(() => setLoading(false));

    return () => {
      unsubEvents();
      unsubPhotos();
      unsubVideos();
      unsubLetters();
      unsubVoiceNotes();
    };
  }, []);

  // Filter helper matching eventId or eventName
  const filterByEvent = <T extends { eventId?: string; eventName?: string }>(items: T[], evt: BirthdayEvent) => {
    return items.filter((item) => {
      if (item.eventId && item.eventId === evt.id) return true;
      if (evt.name && item.eventName && item.eventName.toLowerCase() === evt.name.toLowerCase()) return true;
      return false;
    });
  };

  // Check if uncategorized items exist
  const uncategorizedPhotos = filterByEvent(photos, UNCATEGORIZED_EVENT);
  const uncategorizedVideos = filterByEvent(videos, UNCATEGORIZED_EVENT);
  const uncategorizedLetters = filterByEvent(letters, UNCATEGORIZED_EVENT);
  const uncategorizedVoiceNotes = filterByEvent(voiceNotes, UNCATEGORIZED_EVENT);
  const hasUncategorizedMemories =
    uncategorizedPhotos.length > 0 ||
    uncategorizedVideos.length > 0 ||
    uncategorizedLetters.length > 0 ||
    uncategorizedVoiceNotes.length > 0;

  // Published events list + uncategorized if needed
  const displayEvents: BirthdayEvent[] = [
    ...events.filter((e) => e.status === 'Published'),
    ...(hasUncategorizedMemories && !events.some((e) => e.id === UNCATEGORIZED_EVENT.id)
      ? [UNCATEGORIZED_EVENT]
      : []),
  ];

  // ----------------------------------------------------
  // DEDICATED EVENT VIEW
  // ----------------------------------------------------
  if (activeEvent) {
    const eventPhotos = filterByEvent(photos, activeEvent);
    const eventVideos = filterByEvent(videos, activeEvent);
    const eventLetters = filterByEvent(letters, activeEvent);
    const eventVoiceNotes = filterByEvent(voiceNotes, activeEvent);

    const coverUrl = getEventCover(activeEvent, eventPhotos);

    return (
      <PageContainer maxWidth="5xl">
        <BackButton onClick={() => setActiveEvent(null)} label="Back to Event Timeline" />

        <div className="space-y-10 animate-fadeIn">
          {/* Event Header Banner */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
            <div className="relative h-64 sm:h-80 w-full overflow-hidden">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={activeEvent.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-rose-950/40 to-amber-950/30 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-rose-300/80">
                    <Sparkles className="w-14 h-14 animate-pulse text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Cosmic Memory Archive
                    </span>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

              <div className="absolute bottom-6 left-6 right-6 space-y-2 z-10">
                <div className="flex items-center gap-2 text-xs text-rose-400 font-bold">
                  <Calendar className="w-4 h-4" />
                  <span>{activeEvent.date}</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {activeEvent.name}
                </h1>
                <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {activeEvent.description || 'A special collection of memories recorded for this event.'}
                </p>
              </div>
            </div>
          </div>

          {/* 1. Photos Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-bold text-white border-b border-slate-800 pb-3">
              <Camera className="w-5 h-5 text-amber-400" />
              <span>Photos ({eventPhotos.length})</span>
            </div>

            {eventPhotos.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 bg-slate-900/30 rounded-2xl border border-slate-800/60">
                No photos uploaded for this event yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {eventPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="group bg-slate-900 border border-slate-800 hover:border-rose-500/40 rounded-2xl overflow-hidden shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative aspect-video bg-black overflow-hidden">
                      <img
                        src={photo.imageUrl}
                        alt={photo.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 space-y-1">
                      <h4 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                        {photo.caption}
                      </h4>
                      <p className="text-xs text-slate-400">{photo.memoryDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Videos Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-bold text-white border-b border-slate-800 pb-3">
              <VideoIcon className="w-5 h-5 text-blue-400" />
              <span>Videos ({eventVideos.length})</span>
            </div>

            {eventVideos.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 bg-slate-900/30 rounded-2xl border border-slate-800/60">
                No videos uploaded for this event yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {eventVideos.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => setPlayingVideo(vid)}
                    className="group bg-slate-900 border border-slate-800 hover:border-rose-500/40 rounded-2xl overflow-hidden shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
                      <video src={vid.videoUrl} className="w-full h-full object-cover" muted />
                      <div className="absolute w-12 h-12 rounded-full bg-rose-600/90 border border-rose-400 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-white translate-x-0.5" />
                      </div>
                    </div>
                    <div className="p-4 space-y-1">
                      <h4 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                        {vid.title}
                      </h4>
                      <p className="text-xs text-slate-400">{vid.videoDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Letters Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-bold text-white border-b border-slate-800 pb-3">
              <FileText className="w-5 h-5 text-rose-400" />
              <span>Letters ({eventLetters.length})</span>
            </div>

            {eventLetters.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 bg-slate-900/30 rounded-2xl border border-slate-800/60">
                No letters posted for this event yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {eventLetters.map((letter) => (
                  <div
                    key={letter.id}
                    onClick={() => setReadingLetter(letter)}
                    className="group bg-slate-900 border border-slate-800 hover:border-rose-500/40 rounded-2xl p-5 shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                        {letter.title}
                      </h3>
                      <p className="text-xs text-slate-300/80 line-clamp-3 leading-relaxed font-serif bg-slate-950/50 p-3 rounded-xl border border-slate-800/60 italic">
                        "{letter.content}"
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span>{letter.letterDate}</span>
                      <span className="text-rose-400 font-semibold flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> Read
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Voice Notes Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-bold text-white border-b border-slate-800 pb-3">
              <Mic className="w-5 h-5 text-emerald-400" />
              <span>Voice Notes ({eventVoiceNotes.length})</span>
            </div>

            {eventVoiceNotes.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 bg-slate-900/30 rounded-2xl border border-slate-800/60">
                No voice notes recorded for this event yet.
              </p>
            ) : (
              <div className="space-y-3">
                {eventVoiceNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Mic className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{note.title}</h4>
                        <p className="text-xs text-slate-400">{note.date || 'Recorded'}</p>
                      </div>
                    </div>
                    <audio src={note.audioUrl} controls className="h-9 max-w-[240px] sm:max-w-[300px]" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Photo Lightbox */}
        {selectedPhoto && (
          <div
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                <img src={selectedPhoto.imageUrl} alt={selectedPhoto.caption} className="w-full h-full object-contain" />
              </div>
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedPhoto.caption}</h3>
                  <p className="text-xs text-slate-400">{selectedPhoto.memoryDate}</p>
                </div>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video Player Modal */}
        {playingVideo && (
          <div
            onClick={() => setPlayingVideo(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                <video src={playingVideo.videoUrl} controls autoPlay className="w-full h-full object-contain" />
              </div>
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{playingVideo.title}</h3>
                  <p className="text-xs text-slate-400">{playingVideo.videoDate}</p>
                </div>
                <button
                  onClick={() => setPlayingVideo(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold"
                >
                  Close Player
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Letter Reader Modal */}
        {readingLetter && (
          <div
            onClick={() => setReadingLetter(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">{readingLetter.title}</h2>
                  <p className="text-xs text-rose-400 mt-1">{readingLetter.letterDate}</p>
                </div>
                <button
                  onClick={() => setReadingLetter(null)}
                  className="p-2 rounded-full bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-sm sm:text-base font-serif text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80 italic">
                {readingLetter.content}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800 font-medium">
                <span>Date: {readingLetter.letterDate}</span>
                <span className="text-rose-300 font-bold">With Love, {readingLetter.author} ❤️</span>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    );
  }

  // ----------------------------------------------------
  // TIME CAPSULE EVENT CARDS OVERVIEW
  // ----------------------------------------------------
  return (
    <PageContainer maxWidth="5xl">
      <BackButton onClick={onBack} label="Back to Hub" />

      <div className="space-y-8 animate-fadeIn">
        <SectionHeader
          badge="Time Capsule & Milestones"
          title="Birthday Event Timeline"
          subtitle="Celebration milestones, special surprises, and event memory archives."
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-3xl bg-slate-900/40 border border-slate-800 animate-pulse"></div>
            ))}
          </div>
        ) : displayEvents.length === 0 ? (
          <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-800/80 rounded-3xl p-10 text-center space-y-4">
            <Calendar className="w-12 h-12 text-slate-500 mx-auto" />
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-slate-200">No Events Scheduled</h3>
              <p className="text-xs text-slate-400">
                Check back soon! New celebration events and timeline milestones will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayEvents.map((evt) => {
              const eventPhotos = filterByEvent(photos, evt);
              const coverUrl = getEventCover(evt, eventPhotos);
              const stats = getEventStats(evt.id, photos, videos, letters, voiceNotes, evt.name);

              return (
                <div
                  key={evt.id}
                  onClick={() => setActiveEvent(evt)}
                  className="backdrop-blur-2xl bg-slate-950/70 border border-slate-800/80 hover:border-rose-500/50 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 group flex flex-col justify-between hover:-translate-y-1.5 cursor-pointer"
                >
                  {/* Event Cover Image / Priority Fallback */}
                  <div className="relative h-48 bg-gradient-to-tr from-slate-950 via-rose-950/40 to-amber-950/30 border-b border-slate-800/80 flex items-center justify-center overflow-hidden">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={evt.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-rose-400/60">
                        <Sparkles className="w-10 h-10 text-amber-400/80 animate-pulse" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                          Cosmic Memory Event
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 opacity-90"></div>

                    <div className="absolute top-3 right-3 z-20">
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-md shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Event</span>
                      </span>
                    </div>
                  </div>

                  {/* Event Header Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-rose-400 font-bold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{evt.date}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                        🎂 {evt.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {evt.description || 'Click to explore all photos, videos, letters & voice notes.'}
                      </p>
                    </div>

                    {/* Event Statistics */}
                    <div className="space-y-3 pt-3 border-t border-slate-800/80">
                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-300">
                        <span className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1.5 rounded-xl border border-slate-800/60">
                          <Camera className="w-3.5 h-3.5 text-amber-400" />
                          <span>{stats.photoCount} Photos</span>
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1.5 rounded-xl border border-slate-800/60">
                          <VideoIcon className="w-3.5 h-3.5 text-blue-400" />
                          <span>{stats.videoCount} Videos</span>
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1.5 rounded-xl border border-slate-800/60">
                          <FileText className="w-3.5 h-3.5 text-rose-400" />
                          <span>{stats.letterCount} Letters</span>
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1.5 rounded-xl border border-slate-800/60">
                          <Mic className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{stats.voiceNoteCount} Voice Notes</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="font-extrabold text-amber-300 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Total Memories: {stats.totalMemories}</span>
                        </span>
                      </div>

                      {/* Tap to Relive Button */}
                      <div className="pt-2">
                        <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600/90 to-amber-600/90 group-hover:from-rose-500 group-hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all">
                          <span>Tap to Relive</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
};
