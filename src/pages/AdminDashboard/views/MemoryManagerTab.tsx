import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { PageHeader } from '../../../components/Admin/PageHeader';
import { SectionTitle } from '../../../components/Admin/SectionTitle';
import { ActionButton } from '../../../components/Admin/ActionButton';
import {
  subscribeWelcomeBackgrounds,
  addWelcomeBackground,
  replaceWelcomeBackground,
  deleteWelcomeBackground,
  type WelcomeBackgroundPhoto,
} from '../../../services/backgroundService';
import {
  subscribeGalleryPhotos,
  addGalleryPhoto,
  updateGalleryPhoto,
  toggleGalleryFavorite,
  deleteGalleryPhoto,
  type GalleryPhoto,
} from '../../../services/galleryService';
import {
  subscribeFeaturedMemories,
  addFeaturedMemory,
  toggleFeaturedMemoryEnabled,
  deleteFeaturedMemory,
  type FeaturedMemory,
} from '../../../services/featuredService';
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
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Layers,
} from 'lucide-react';

type MemorySectionTab = 'welcome' | 'gallery' | 'featured';

export const MemoryManagerTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MemorySectionTab>('welcome');

  // Realtime Data State
  const [welcomePhotos, setWelcomePhotos] = useState<WelcomeBackgroundPhoto[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [featuredMemories, setFeaturedMemories] = useState<FeaturedMemory[]>([]);

  // Feedback State
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Gallery Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState<boolean>(false);

  // Modals State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [editingGalleryPhoto, setEditingGalleryPhoto] = useState<GalleryPhoto | null>(null);
  const [replacingWelcomePhoto, setReplacingWelcomePhoto] = useState<WelcomeBackgroundPhoto | null>(null);

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [memoryDate, setMemoryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // Subscribe to Realtime Firestore Listeners
  useEffect(() => {
    const unsubWelcome = subscribeWelcomeBackgrounds((items) => setWelcomePhotos(items));
    const unsubGallery = subscribeGalleryPhotos((items) => setGalleryPhotos(items));
    const unsubFeatured = subscribeFeaturedMemories((items) => setFeaturedMemories(items));

    return () => {
      unsubWelcome();
      unsubGallery();
      unsubFeatured();
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
    setMemoryDate(new Date().toISOString().split('T')[0]);
    setIsFavorite(false);
    setShowUploadModal(false);
    setReplacingWelcomePhoto(null);
  };

  // Section 1: Welcome Background Handlers
  const handleUploadWelcome = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return showToast('Please select an image file to upload', 'error');

    setIsUploading(true);

    try {
      if (replacingWelcomePhoto) {
        await replaceWelcomeBackground(
          replacingWelcomePhoto.id,
          replacingWelcomePhoto.imageUrl,
          file
        );
        showToast('Welcome background photo replaced successfully!');
      } else {
        await addWelcomeBackground(file, welcomePhotos.length);
        showToast('Welcome background photo uploaded successfully!');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to upload photo', 'error');
    } finally {
      setIsUploading(false);
      resetForm();
    }
  };

  const handleDeleteWelcome = async (photo: WelcomeBackgroundPhoto) => {
    if (!window.confirm('Delete this welcome background photo?')) return;
    setWelcomePhotos((prev) => prev.filter((p) => p.id !== photo.id && p.imageUrl !== photo.imageUrl));
    try {
      await deleteWelcomeBackground(photo.id, photo.imageUrl);
      showToast('Welcome background photo deleted');
    } catch (err: any) {
      showToast('Failed to delete photo', 'error');
    }
  };

  // Section 2: Constellation Gallery Handlers
  const handleUploadGallery = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return showToast('Please select an image file to upload', 'error');
    if (!caption.trim()) return showToast('Please enter a caption for the memory', 'error');

    setIsUploading(true);

    try {
      await addGalleryPhoto(
        file,
        { caption: caption.trim(), memoryDate, favorite: isFavorite }
      );
      showToast('Gallery memory uploaded to Constellation!');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload memory', 'error');
    } finally {
      setIsUploading(false);
      resetForm();
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
      });
      showToast('Gallery memory updated');
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
      showToast('Gallery memory deleted');
    } catch (err: any) {
      showToast('Failed to delete memory', 'error');
    }
  };

  // Section 3: Featured Memories Handlers
  const handleUploadFeatured = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return showToast('Please select an image file', 'error');

    setIsUploading(true);

    try {
      await addFeaturedMemory(file, featuredMemories.length);
      showToast('Featured memory uploaded');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload featured memory', 'error');
    } finally {
      setIsUploading(false);
      resetForm();
    }
  };

  const handleDeleteFeatured = async (mem: FeaturedMemory) => {
    if (!window.confirm('Delete this featured memory?')) return;
    try {
      await deleteFeaturedMemory(mem.id, mem.imageUrl);
      showToast('Featured memory deleted');
    } catch (err: any) {
      showToast('Failed to delete featured memory', 'error');
    }
  };

  // Filtered Gallery Photos
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
        title="Photo Management System"
        subtitle="Manage welcome backgrounds, constellation gallery, and featured memories synced with Firebase Storage & Firestore"
      >
        <ActionButton
          label="Upload Photo"
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

      {/* 3 Independent Section Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto custom-scrollbar">
        {[
          {
            id: 'welcome',
            label: '1. Welcome Background',
            icon: Layers,
            count: welcomePhotos.length,
            desc: 'Collage behind Welcome intro',
          },
          {
            id: 'gallery',
            label: '2. Constellation Gallery',
            icon: ImageIcon,
            count: galleryPhotos.length,
            desc: 'Photos inside Constellation hub',
          },
          {
            id: 'featured',
            label: '3. Featured Memories',
            icon: Sparkles,
            count: featuredMemories.length,
            desc: 'Cinematic scenes reserved',
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as MemorySectionTab)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-rose-500/20 to-amber-500/20 border border-rose-500/40 text-white shadow-lg'
                  : 'bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-800 text-slate-300 font-extrabold">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: Welcome Background Management */}
      {activeTab === 'welcome' && (
        <div className="space-y-6">
          <SectionTitle
            title="Section 1: Welcome Background Photos"
            description="These photos appear ONLY behind 'Welcome... Shubham ❤️' during the intro scene and nowhere else."
          />

          {welcomePhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4">
              <Layers className="w-12 h-12 text-rose-400/60" />
              <div>
                <h4 className="text-base font-bold text-white">No Welcome Background Photos</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Upload images to create the animated background collage behind Shubham's welcome scene.
                </p>
              </div>
              <ActionButton
                label="Upload Welcome Photo"
                icon={Plus}
                variant="primary"
                onClick={() => setShowUploadModal(true)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {welcomePhotos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="relative group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
                >
                  <div className="aspect-video bg-slate-950 overflow-hidden">
                    <img
                      src={photo.imageUrl}
                      alt={`Welcome ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 flex items-center justify-between border-t border-slate-800 bg-slate-950/80">
                    <span className="text-[11px] font-bold text-slate-400">Order #{idx + 1}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setReplacingWelcomePhoto(photo);
                          setShowUploadModal(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                        title="Replace Image"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteWelcome(photo)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                        title="Delete Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: Constellation Gallery Management */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <SectionTitle
            title="Section 2: Constellation Gallery"
            description="These memory photos appear ONLY after clicking Constellation in the Memory Hub."
          />

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

          {filteredGalleryPhotos.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
              <ImageIcon className="w-10 h-10 text-rose-400/60 mx-auto" />
              <p className="text-xs text-slate-400">No gallery photos match your filter.</p>
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
        </div>
      )}

      {/* SECTION 3: Featured Memories Management */}
      {activeTab === 'featured' && (
        <div className="space-y-6">
          <SectionTitle
            title="Section 3: Featured Memories"
            description="Reserved for future cinematic scenes. Complete admin management."
          />

          {featuredMemories.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
              <Sparkles className="w-10 h-10 text-amber-400/60 mx-auto" />
              <p className="text-xs text-slate-400">No featured memories uploaded yet.</p>
              <ActionButton
                label="Upload Featured Memory"
                icon={Plus}
                variant="primary"
                onClick={() => setShowUploadModal(true)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredMemories.map((mem, idx) => (
                <div
                  key={mem.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
                >
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    <img src={mem.imageUrl} alt={`Featured ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => toggleFeaturedMemoryEnabled(mem.id, mem.enabled)}
                      className={`absolute top-2 right-2 p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 backdrop-blur-md ${
                        mem.enabled
                          ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300'
                          : 'bg-slate-950/80 border border-slate-700 text-slate-400'
                      }`}
                    >
                      {mem.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="p-3 flex items-center justify-between border-t border-slate-800 bg-slate-950">
                    <span className="text-[11px] font-bold text-slate-400">Order #{idx + 1}</span>
                    <button
                      onClick={() => handleDeleteFeatured(mem)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Modal for Active Section */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative backdrop-blur-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-rose-400" />
                <span>
                  Upload to {activeTab === 'welcome' ? 'Welcome Background' : activeTab === 'gallery' ? 'Constellation Gallery' : 'Featured Memories'}
                </span>
              </h3>
              <button
                onClick={resetForm}
                className="p-1.5 rounded-full bg-slate-950 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={
                activeTab === 'welcome'
                  ? handleUploadWelcome
                  : activeTab === 'gallery'
                  ? handleUploadGallery
                  : handleUploadFeatured
              }
              className="space-y-4"
            >
              {/* File Input & Preview */}
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

              {/* Gallery Specific Inputs */}
              {activeTab === 'gallery' && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase text-slate-400">
                      Caption / Title
                    </label>
                    <input
                      type="text"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="e.g. Memory at Sunset"
                      disabled={isUploading}
                      className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl px-4 py-2.5 border border-slate-800 focus:border-rose-500/80 outline-none"
                    />
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
                </>
              )}

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Saving image...</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-200 w-full"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-3">
                <ActionButton label="Cancel" variant="secondary" onClick={resetForm} />
                <button
                  type="submit"
                  disabled={isUploading}
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

      {/* Edit Modal for Gallery Photo */}
      {editingGalleryPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative backdrop-blur-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Edit Gallery Memory</h3>
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
