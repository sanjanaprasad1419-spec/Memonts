import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { PageHeader } from '../../../components/Admin/PageHeader';
import { ActionButton } from '../../../components/Admin/ActionButton';
import {
  subscribeMusic,
  addSong,
  updateSong,
  setActiveBackgroundSong,
  toggleSongFavorite,
  deleteSong,
  type SongItem,
} from '../../../services/musicService';
import {
  Music as MusicIcon,
  Plus,
  Edit3,
  Trash2,
  X,
  Star,
  Search,
  CheckCircle,
  AlertCircle,
  Upload,
  Tag,
  Loader2,
  Sparkles,
  User,
  Radio,
} from 'lucide-react';

export const MusicTab: React.FC = () => {
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState<boolean>(false);

  // Modals & Feedback
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [editingSong, setEditingSong] = useState<SongItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [artist, setArtist] = useState<string>("Sanjana's Choice");
  const [eventName, setEventName] = useState<string>('Theme Music');
  const [isActiveBackground, setIsActiveBackground] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  useEffect(() => {
    const unsub = subscribeMusic((items) => setSongs(items));
    return () => unsub();
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
    setArtist("Sanjana's Choice");
    setEventName('Theme Music');
    setIsActiveBackground(false);
    setIsFavorite(false);
    setShowUploadModal(false);
    setEditingSong(null);
  };

  const handleUploadSong = async (e: FormEvent) => {
    e.preventDefault();
    if (!file && !editingSong) return showToast('Please select an audio file to upload', 'error');
    if (!title.trim()) return showToast('Please enter a song title', 'error');

    setIsUploading(true);

    try {
      if (editingSong) {
        await updateSong(
          editingSong.id,
          {
            title: title.trim(),
            artist: artist.trim() || "Sanjana's Choice",
            eventName: eventName.trim() || 'Theme Music',
            favorite: isFavorite,
          },
          file
        );
        showToast('Song updated successfully!');
      } else {
        await addSong(file!, {
          title: title.trim(),
          artist: artist.trim() || "Sanjana's Choice",
          eventName: eventName.trim() || 'Theme Music',
          isActiveBackground,
          favorite: isFavorite,
        });
        showToast('Song uploaded to playlist successfully!');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save song', 'error');
    } finally {
      setIsUploading(false);
      resetForm();
    }
  };

  const openEditModal = (song: SongItem) => {
    setEditingSong(song);
    setTitle(song.title);
    setArtist(song.artist || "Sanjana's Choice");
    setEventName(song.eventName || 'Theme Music');
    setIsFavorite(!!song.favorite);
    setPreviewUrl(song.audioUrl || '');
    setShowUploadModal(true);
  };

  const handleMakeActiveBackground = async (song: SongItem) => {
    try {
      await setActiveBackgroundSong(song.id);
      showToast(`"${song.title}" set as active background theme music!`);
    } catch (err: any) {
      showToast('Failed to activate theme song', 'error');
    }
  };

  const handleTurnOffBackgroundMusic = async () => {
    try {
      await setActiveBackgroundSong(null);
      showToast('Background theme music turned off');
    } catch (err: any) {
      showToast('Failed to turn off theme music', 'error');
    }
  };

  const handleDeleteSong = async (song: SongItem) => {
    if (!window.confirm(`Delete song "${song.title}"?`)) return;
    setSongs((prev) => prev.filter((s) => s.id !== song.id && s.title.toLowerCase().trim() !== song.title.toLowerCase().trim()));
    try {
      await deleteSong(song.id, song.title, song.audioUrl);
      showToast('Song deleted successfully');
    } catch (err: any) {
      showToast('Failed to delete song', 'error');
    }
  };

  const activeSong = songs.find((s) => s.isActiveBackground);

  // Filtered List
  const uniqueEvents = Array.from(new Set(songs.map((s) => s.eventName))).filter(Boolean);

  const filteredSongs = songs.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.eventName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEvent = selectedEventFilter === 'all' || s.eventName === selectedEventFilter;
    const matchesFav = filterFavoritesOnly ? s.favorite : true;

    return matchesSearch && matchesEvent && matchesFav;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Background Music & Theme Songs"
        subtitle="Upload multiple songs and explicitly choose which song plays as active background theme music"
      >
        <div className="flex items-center gap-3">
          {activeSong && (
            <button
              onClick={handleTurnOffBackgroundMusic}
              className="px-4 py-2 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              Turn Off Background Music
            </button>
          )}

          <ActionButton
            label="Upload New Song"
            icon={Plus}
            variant="primary"
            onClick={() => {
              resetForm();
              setShowUploadModal(true);
            }}
          />
        </div>
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

      {/* Active Theme Song Card Banner */}
      {activeSong && (
        <div className="bg-gradient-to-r from-rose-950/40 via-purple-950/40 to-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <Radio className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Active Background Theme
              </span>
              <h3 className="text-lg font-bold text-white">{activeSong.title}</h3>
              <p className="text-xs text-slate-400">By {activeSong.artist} • Plays continuously on dashboard</p>
            </div>
          </div>

          {activeSong.audioUrl && (
            <div className="w-full sm:w-auto">
              <audio src={activeSong.audioUrl} controls className="h-9 max-w-[260px]" />
            </div>
          )}
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search songs & artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {uniqueEvents.length > 0 && (
            <select
              value={selectedEventFilter}
              onChange={(e) => setSelectedEventFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-rose-500/50 cursor-pointer"
            >
              <option value="all">All Events ({songs.length})</option>
              {uniqueEvents.map((evt) => (
                <option key={evt} value={evt}>
                  {evt}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setFilterFavoritesOnly(!filterFavoritesOnly)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              filterFavoritesOnly
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filterFavoritesOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Favorites Only</span>
          </button>
        </div>
      </div>

      {/* Songs Grid */}
      {filteredSongs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <MusicIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-100">No Theme Songs Found</h3>
            <p className="text-sm text-slate-400 max-w-md">
              Upload multiple songs so Shubham can choose his favorite background theme music.
            </p>
          </div>
          <ActionButton
            label="Upload New Song"
            icon={Plus}
            variant="primary"
            onClick={() => {
              resetForm();
              setShowUploadModal(true);
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSongs.map((song) => (
            <div
              key={song.id}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all ${
                song.isActiveBackground
                  ? 'border-rose-500/60 bg-gradient-to-b from-rose-950/20 to-slate-900'
                  : 'border-slate-800'
              }`}
            >
              <div className="space-y-4">
                {/* Header Badge & Active Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-bold flex items-center gap-1">
                      <Tag className="w-3 h-3 text-rose-400" />
                      <span>{song.eventName}</span>
                    </span>

                    {song.isActiveBackground && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/80 text-emerald-300 text-[11px] font-extrabold flex items-center gap-1 animate-pulse">
                        <Radio className="w-3 h-3 text-emerald-400" />
                        <span>Active Theme Song</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleSongFavorite(song.id, !!song.favorite)}
                    className={`p-1.5 rounded-full border transition-all ${
                      song.favorite
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-200'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${song.favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                </div>

                {/* Song Info */}
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MusicIcon className="w-4 h-4 text-rose-400" />
                    <span>{song.title}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-amber-400" />
                    <span>{song.artist}</span>
                  </p>
                </div>

                {/* Audio Player Controls */}
                {song.audioUrl && song.audioUrl.trim().length > 10 ? (
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <audio src={song.audioUrl} controls className="w-full h-8" />
                  </div>
                ) : (
                  <div className="bg-rose-950/30 p-3 rounded-xl border border-rose-500/40 flex items-center justify-between">
                    <span className="text-xs text-rose-300 font-semibold">No audio file attached yet</span>
                    <button
                      onClick={() => openEditModal(song)}
                      className="px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs font-bold hover:bg-rose-500/40"
                    >
                      Attach MP3
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between">
                {!song.isActiveBackground ? (
                  <button
                    onClick={() => handleMakeActiveBackground(song)}
                    className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Set as Active Theme</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Currently Active</span>
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(song)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteSong(song)}
                    className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 hover:text-rose-100 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload & Edit Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingSong ? 'Edit Song & Audio' : 'Upload New Theme Song'}
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSong} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Select Audio MP3 File {!editingSong && '*'}
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="music-file-upload"
                />
                <label
                  htmlFor="music-file-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-rose-500/50 rounded-2xl p-4 bg-slate-950/60 text-center cursor-pointer transition-all"
                >
                  <Upload className="w-8 h-8 text-rose-400 mb-1" />
                  <span className="text-xs font-bold text-slate-200">
                    {file ? file.name : editingSong ? 'Choose new MP3 file to replace audio' : 'Click to browse MP3 files'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">Supports MP3, WAV, M4A, AAC</span>
                </label>

                {previewUrl && (
                  <div className="mt-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <audio src={previewUrl} controls className="w-full h-8" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Song Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hawayein, Tera Mera Pyar Amar..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Artist / Credit</label>
                  <input
                    type="text"
                    placeholder="e.g. Arijit Singh, Sanjana's Choice"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Event Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Theme Music, Romantic Hits"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold shadow-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Audio...</span>
                    </>
                  ) : (
                    <span>{editingSong ? 'Update Song' : 'Upload Song'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
