import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { PageHeader } from '../../../components/Admin/PageHeader';
import { ActionButton } from '../../../components/Admin/ActionButton';
import {
  subscribeGalleryPhotos,
  addGalleryPhoto,
  updateGalleryPhoto,
  toggleGalleryFavorite,
  deleteGalleryPhoto,
  type GalleryPhoto,
} from '../../../services/galleryService';
import { subscribeToEvents, type BirthdayEvent } from '../../../services/eventService';
import {
  Image as ImageIcon,
  Upload,
  Calendar,
  Edit3,
  Trash2,
  Plus,
  Loader2,
  X,
  Star,
  Search,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export const GalleryTab: React.FC = () => {
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [events, setEvents] = useState<BirthdayEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState<boolean>(false);

  // Modals & Upload State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [editingGalleryPhoto, setEditingGalleryPhoto] = useState<GalleryPhoto | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [memoryDate, setMemoryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  useEffect(() => {
    const unsubPhotos = subscribeGalleryPhotos((items) => setGalleryPhotos(items));
    const unsubEvents = subscribeToEvents((evts) => {
      setEvents(evts);
      if (evts.length > 0 && !selectedEventId) {
        setSelectedEventId(evts[0].id);
      }
    });
    return () => {
      unsubPhotos();
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
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewUrl('');
    setCaption('');
    setSelectedEventId(events.length > 0 ? events[0].id : '');
    setMemoryDate(new Date().toISOString().split('T')[0]);
    setIsFavorite(false);
    setUploadProgress(0);
    setShowUploadModal(false);
  };

  const handleUploadGallery = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return showToast('Please select an image file to upload', 'error');
    if (!caption.trim()) return showToast('Please enter a caption for the memory', 'error');
    if (!selectedEventId) return showToast('Please select an event before uploading media', 'error');

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await addGalleryPhoto(
        file,
        { caption: caption.trim(), memoryDate, favorite: isFavorite, eventId: selectedEventId },
        (progress) => setUploadProgress(progress)
      );
      showToast('Gallery photo uploaded to Constellation!');
      resetForm();
    } catch (err: any) {
      showToast(err.message || 'Failed to upload memory', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateGalleryMeta = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingGalleryPhoto) return;

    try {
      await updateGalleryPhoto(editingGalleryPhoto.id, {
        caption: editingGalleryPhoto.caption,
        memoryDate: editingGalleryPhoto.memoryDate,
        favorite: editingGalleryPhoto.favorite,
        eventId: editingGalleryPhoto.eventId,
      });
      showToast('Constellation memory updated');
      setEditingGalleryPhoto(null);
    } catch (err: any) {
      showToast('Failed to update memory', 'error');
    }
  };

  const handleDeleteGallery = async (photo: GalleryPhoto) => {
    if (!window.confirm(`Delete photo "${photo.caption}"?`)) return;
    setGalleryPhotos((prev) => prev.filter((p) => p.id !== photo.id && p.imageUrl !== photo.imageUrl));
    try {
      await deleteGalleryPhoto(photo.id, photo.imageUrl);
      showToast('Constellation photo deleted');
    } catch (err: any) {
      showToast('Failed to delete photo', 'error');
    }
  };

  const filteredGalleryPhotos = galleryPhotos.filter((photo) => {
    const matchesSearch =
      photo.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.memoryDate.includes(searchQuery);
    const matchesFav = filterFavoritesOnly ? photo.favorite : true;
    return matchesSearch && matchesFav;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Constellation Gallery"
        subtitle="Manage memory photos displayed exclusively inside the Constellation section"
      >
        <ActionButton
          label="Add Constellation Photo"
          icon={Plus}
          variant="primary"
          onClick={() => setShowUploadModal(true)}
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

      {/* Search & Favorites Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500/60"
          />
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

      {/* Photos Grid */}
      {filteredGalleryPhotos.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
          <ImageIcon className="w-10 h-10 text-rose-400/60 mx-auto" />
          <p className="text-xs text-slate-400">No Constellation photos found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGalleryPhotos.map((photo) => (
            <div
              key={photo.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between"
            >
              <div className="relative aspect-video bg-slate-950 overflow-hidden">
                <img
                  src={photo.imageUrl}
                  alt={photo.caption}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => toggleGalleryFavorite(photo.id, photo.favorite)}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border transition-all ${
                    photo.favorite
                      ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Star className={`w-4 h-4 ${photo.favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-white">{photo.caption || 'Untitled Memory'}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    <span>{photo.memoryDate}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <ActionButton
                    label="Edit"
                    icon={Edit3}
                    variant="secondary"
                    onClick={() => setEditingGalleryPhoto(photo)}
                  />
                  <ActionButton
                    label="Delete"
                    icon={Trash2}
                    variant="danger"
                    onClick={() => handleDeleteGallery(photo)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative backdrop-blur-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-rose-400" />
                <span>Upload Constellation Photo</span>
              </h3>
              <button
                onClick={resetForm}
                className="p-1.5 rounded-full bg-slate-950 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadGallery} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-400">
                  Select Image File (Max 15MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-500/10 file:text-rose-400 hover:file:bg-rose-500/20 cursor-pointer"
                />

                {previewUrl && (
                  <div className="mt-3 relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-400">
                  Caption / Title
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Italian Garden Memory"
                  disabled={isUploading}
                  className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl px-4 py-2.5 border border-slate-800 focus:border-rose-500/80 outline-none"
                />
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
                  Memory Date
                </label>
                <input
                  type="date"
                  value={memoryDate}
                  onChange={(e) => setMemoryDate(e.target.value)}
                  disabled={isUploading}
                  className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl px-4 py-2.5 border border-slate-800 focus:border-rose-500/80 outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="rounded accent-rose-500"
                />
                <span className="text-xs font-semibold text-slate-300">Mark as Favorite</span>
              </label>

              {isUploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-3">
                <ActionButton label="Cancel" variant="secondary" onClick={resetForm} />
                <button
                  type="submit"
                  disabled={isUploading || events.length === 0 || !selectedEventId}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 border border-rose-500/30 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload & Save</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingGalleryPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative backdrop-blur-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Edit Constellation Memory</h3>
              <button
                onClick={() => setEditingGalleryPhoto(null)}
                className="p-1.5 rounded-full bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateGalleryMeta} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-400">Caption</label>
                <input
                  type="text"
                  value={editingGalleryPhoto.caption}
                  onChange={(e) =>
                    setEditingGalleryPhoto({ ...editingGalleryPhoto, caption: e.target.value })
                  }
                  className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl px-4 py-2 border border-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-400">Associated Event</label>
                <select
                  value={editingGalleryPhoto.eventId || 'uncategorized'}
                  onChange={(e) =>
                    setEditingGalleryPhoto({ ...editingGalleryPhoto, eventId: e.target.value })
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
                <label className="block text-xs font-semibold uppercase text-slate-400">Memory Date</label>
                <input
                  type="date"
                  value={editingGalleryPhoto.memoryDate}
                  onChange={(e) =>
                    setEditingGalleryPhoto({ ...editingGalleryPhoto, memoryDate: e.target.value })
                  }
                  className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl px-4 py-2 border border-slate-800 outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={editingGalleryPhoto.favorite}
                  onChange={(e) =>
                    setEditingGalleryPhoto({ ...editingGalleryPhoto, favorite: e.target.checked })
                  }
                  className="rounded accent-rose-500"
                />
                <span className="text-xs font-semibold text-slate-300">Favorite</span>
              </label>

              <div className="pt-2 flex items-center justify-end gap-2">
                <ActionButton label="Cancel" variant="secondary" onClick={() => setEditingGalleryPhoto(null)} />
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
    </div>
  );
};
