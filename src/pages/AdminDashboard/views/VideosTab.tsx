import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { PageHeader } from '../../../components/Admin/PageHeader';
import { ActionButton } from '../../../components/Admin/ActionButton';
import {
  subscribeVideos,
  addVideo,
  updateVideo,
  toggleVideoFavorite,
  deleteVideo,
  type VideoItem,
} from '../../../services/videoService';
import { subscribeToEvents, type BirthdayEvent } from '../../../services/eventService';
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Star,
  Search,
  CheckCircle,
  AlertCircle,
  Upload,
  Calendar,
  Tag,
  Play,
  Loader2,
  Film,
} from 'lucide-react';

export const VideosTab: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [events, setEvents] = useState<BirthdayEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState<boolean>(false);

  // Modals & Player State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [videoDate, setVideoDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  useEffect(() => {
    const unsubVideos = subscribeVideos((items) => setVideos(items));
    const unsubEvents = subscribeToEvents((evts) => {
      setEvents(evts);
      if (evts.length > 0 && !selectedEventId) {
        setSelectedEventId(evts[0].id);
      }
    });
    return () => {
      unsubVideos();
      unsubEvents();
    };
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      if (!title) {
        const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName);
      }
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewUrl('');
    setTitle('');
    setSelectedEventId(events.length > 0 ? events[0].id : '');
    setVideoDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setIsFavorite(false);
    setShowUploadModal(false);
    setEditingVideo(null);
  };

  const handleUploadVideo = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return showToast('Please select a video file to upload', 'error');
    if (!title.trim()) return showToast('Please enter a video title', 'error');
    if (!selectedEventId) return showToast('Please select an event before uploading video', 'error');

    setIsUploading(true);

    try {
      await addVideo(file, {
        title: title.trim(),
        eventId: selectedEventId,
        videoDate,
        description: description.trim(),
        favorite: isFavorite,
      });
      showToast('Video uploaded to Moments in Motion successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload video', 'error');
    } finally {
      setIsUploading(false);
      resetForm();
    }
  };

  const handleUpdateVideoMeta = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    try {
      await updateVideo(editingVideo.id, {
        title: editingVideo.title,
        eventId: editingVideo.eventId,
        videoDate: editingVideo.videoDate,
        description: editingVideo.description,
        favorite: editingVideo.favorite,
      });
      showToast('Video details updated');
      setEditingVideo(null);
    } catch (err: any) {
      showToast('Failed to update video details', 'error');
    }
  };

  const handleDeleteVideo = async (vid: VideoItem) => {
    if (!window.confirm(`Delete video "${vid.title}"?`)) return;
    setVideos((prev) => prev.filter((v) => v.id !== vid.id && v.title.toLowerCase().trim() !== vid.title.toLowerCase().trim()));
    try {
      await deleteVideo(vid.id, vid.title, vid.videoUrl);
      showToast('Video deleted successfully');
    } catch (err: any) {
      showToast('Failed to delete video', 'error');
    }
  };

  // Filtered List
  const uniqueEvents = Array.from(new Set(videos.map((v) => v.eventName))).filter(Boolean);

  const filteredVideos = videos.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.eventName && v.eventName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesEvent = selectedEventFilter === 'all' || v.eventName === selectedEventFilter;
    const matchesFav = filterFavoritesOnly ? v.favorite : true;

    return matchesSearch && matchesEvent && matchesFav;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Video Vault & Moments in Motion"
        subtitle="Upload and manage memory videos linked to specific events for Shubham to watch"
      >
        <ActionButton
          label="Upload New Video"
          icon={Plus}
          variant="primary"
          onClick={() => {
            resetForm();
            setShowUploadModal(true);
          }}
        />
      </PageHeader>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xl transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/90 border border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Event Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search videos & events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500/60"
            />
          </div>

          {/* Event Filter Dropdown */}
          <select
            value={selectedEventFilter}
            onChange={(e) => setSelectedEventFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none cursor-pointer"
          >
            <option value="all">All Events ({videos.length})</option>
            {uniqueEvents.map((evt) => (
              <option key={evt} value={evt}>
                {evt}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setFilterFavoritesOnly(!filterFavoritesOnly)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterFavoritesOnly
              ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
              : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${filterFavoritesOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
          <span>Favorites Only</span>
        </button>
      </div>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4">
          <Film className="w-12 h-12 text-rose-400/60" />
          <div>
            <h4 className="text-base font-bold text-white">No Videos Uploaded Yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Upload video memories linked to specific events for Shubham to watch in Moments in Motion.
            </p>
          </div>
          <ActionButton
            label="Upload First Video"
            icon={Plus}
            variant="primary"
            onClick={() => {
              resetForm();
              setShowUploadModal(true);
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((vid) => (
            <div
              key={vid.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between group"
            >
              {/* Video Player Thumbnail Container */}
              <div
                onClick={() => setPlayingVideo(vid)}
                className="relative aspect-video bg-black overflow-hidden cursor-pointer flex items-center justify-center group-hover:opacity-90 transition-opacity"
              >
                <video src={vid.videoUrl} className="w-full h-full object-cover" muted />

                {/* Play Icon Overlay */}
                <div className="absolute w-12 h-12 rounded-full bg-rose-600/90 border border-rose-400 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-white translate-x-0.5" />
                </div>

                {/* Favorite Badge */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVideoFavorite(vid.id, !!vid.favorite);
                  }}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border transition-all ${
                    vid.favorite
                      ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Star className={`w-4 h-4 ${vid.favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              </div>

              {/* Video Meta Body */}
              <div className="p-4 space-y-3">
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

                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                    {vid.title}
                  </h4>
                  {vid.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{vid.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <ActionButton
                    label="Edit"
                    icon={Edit3}
                    variant="secondary"
                    onClick={() => setEditingVideo(vid)}
                  />
                  <ActionButton
                    label="Delete"
                    icon={Trash2}
                    variant="danger"
                    onClick={() => handleDeleteVideo(vid)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Video Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative backdrop-blur-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-rose-400" />
                <span>Upload Video to Moments in Motion</span>
              </h3>
              <button
                onClick={resetForm}
                className="p-1.5 rounded-full bg-slate-950 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadVideo} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-400">
                  Select Video File (MP4, WEBM, MOV)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-500/10 file:text-rose-400 hover:file:bg-rose-500/20 cursor-pointer"
                />

                {previewUrl && (
                  <div className="mt-3 relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black">
                    <video src={previewUrl} controls className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-400">
                  Event <span className="text-rose-400">*</span>
                </label>
                {events.length === 0 ? (
                  <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/30">
                    No events available. Please create an event first.
                  </p>
                ) : (
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    required
                    disabled={isUploading}
                    className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl px-4 py-2.5 border border-slate-800 focus:border-rose-500/80 outline-none cursor-pointer"
                  >
                    {events.map((evt) => (
                      <option key={evt.id} value={evt.id}>
                        {evt.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-400">
                  Video Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Our Road Trip Adventure"
                  required
                  className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl px-4 py-2.5 border border-slate-800 focus:border-rose-500/80 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-400">
                  Memory Date
                </label>
                <input
                  type="date"
                  value={videoDate}
                  onChange={(e) => setVideoDate(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl px-4 py-2.5 border border-slate-800 focus:border-rose-500/80 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-400">
                  Description / Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details or special notes about this video moment..."
                  className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl p-3 border border-slate-800 focus:border-rose-500/80 outline-none resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="rounded accent-rose-500"
                />
                <span className="text-xs font-semibold text-slate-300">Mark as Favorite Video</span>
              </label>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <ActionButton label="Cancel" variant="secondary" onClick={resetForm} />
                <button
                  type="submit"
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 border border-rose-500/30 shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Video...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload & Save Video</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Video Modal */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative backdrop-blur-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Edit Video Details</h3>
              <button
                onClick={() => setEditingVideo(null)}
                className="p-1.5 rounded-full bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateVideoMeta} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-400">Associated Event</label>
                <select
                  value={editingVideo.eventId || 'uncategorized'}
                  onChange={(e) =>
                    setEditingVideo({ ...editingVideo, eventId: e.target.value })
                  }
                  className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl px-4 py-2 border border-slate-800 outline-none cursor-pointer"
                >
                  <option value="uncategorized">Uncategorized Memories</option>
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-400">Title</label>
                <input
                  type="text"
                  value={editingVideo.title}
                  onChange={(e) =>
                    setEditingVideo({ ...editingVideo, title: e.target.value })
                  }
                  className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl px-4 py-2 border border-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-400">Video Date</label>
                <input
                  type="date"
                  value={editingVideo.videoDate}
                  onChange={(e) =>
                    setEditingVideo({ ...editingVideo, videoDate: e.target.value })
                  }
                  className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl px-4 py-2 border border-slate-800 outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={editingVideo.favorite}
                  onChange={(e) =>
                    setEditingVideo({ ...editingVideo, favorite: e.target.checked })
                  }
                  className="rounded accent-rose-500"
                />
                <span className="text-xs font-semibold text-slate-300">Favorite Video</span>
              </label>

              <div className="pt-2 flex items-center justify-end gap-2">
                <ActionButton label="Cancel" variant="secondary" onClick={() => setEditingVideo(null)} />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Lightbox Player Modal */}
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
              <video
                src={playingVideo.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">
                    {playingVideo.eventName}
                  </span>
                  <h3 className="text-base font-bold text-white">{playingVideo.title}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">{playingVideo.videoDate}</p>
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
    </div>
  );
};
