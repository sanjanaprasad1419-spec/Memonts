import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/Admin/PageHeader';
import { ActionButton } from '../../../components/Admin/ActionButton';
import {
  Plus,
  Calendar,
  Edit3,
  Trash2,
  Image as ImageIcon,
  X,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  type BirthdayEvent,
} from '../../../services/eventService';
import { StorageService } from '../../../services/storage.service';
import {
  getSystemManifest,
  reassignEventMedia,
  UNCATEGORIZED_EVENT_ID,
} from '../../../services/supabaseSync.service';
import { Camera, Video as VideoIcon, FileText, Mic } from 'lucide-react';

export const EventsTab: React.FC = () => {
  const [events, setEvents] = useState<BirthdayEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<BirthdayEvent | null>(null);

  // Delete Protection Modal State
  const [deleteTargetEvent, setDeleteTargetEvent] = useState<BirthdayEvent | null>(null);
  const [deleteLinkedStats, setDeleteLinkedStats] = useState<{
    photos: number;
    videos: number;
    letters: number;
    voiceNotes: number;
    total: number;
  } | null>(null);
  const [reassignDestinationId, setReassignDestinationId] = useState<string>(UNCATEGORIZED_EVENT_ID);

  // Form Fields State
  const [name, setName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<'Published' | 'Draft'>('Published');
  const [coverImage, setCoverImage] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setName('');
    setDate(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    setDescription('');
    setStatus('Published');
    setCoverImage('');
    setImagePreview('');
    setIsModalOpen(true);
  };

  const openEditModal = (evt: BirthdayEvent) => {
    setEditingEvent(evt);
    setName(evt.name);
    setDate(evt.date);
    setDescription(evt.description);
    setStatus(evt.status);
    setCoverImage(evt.coverImage || '');
    setImagePreview(evt.coverImage || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showToast('error', 'Image size should be under 15MB');
      return;
    }

    try {
      showToast('success', 'Uploading cover image to Supabase Storage...');
      const uploadRes = await StorageService.uploadFile({
        folder: 'gallery',
        file,
      });

      if (uploadRes.success && uploadRes.data?.publicUrl) {
        const publicUrl = uploadRes.data.publicUrl;
        console.log('[DEBUG EventsTab] Uploaded event cover image to Supabase Storage:', publicUrl);
        setCoverImage(publicUrl);
        setImagePreview(publicUrl);
        showToast('success', 'Cover image uploaded to Supabase Storage!');
      } else {
        showToast('error', uploadRes.error || 'Failed to upload image to Supabase');
      }
    } catch (err: any) {
      console.error('[DEBUG EventsTab Upload Error]', err);
      showToast('error', 'Upload failed. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Please enter an event name');
      return;
    }

    setSubmitting(true);
    try {
      if (editingEvent) {
        // Update existing event
        const updated = await updateEvent(editingEvent.id, {
          name: name.trim(),
          date: date.trim(),
          description: description.trim(),
          status,
          coverImage,
        });
        setEvents(updated);
        showToast('success', 'Event updated successfully!');
      } else {
        // Create new event
        const newEvt = await createEvent({
          name: name.trim(),
          date: date.trim(),
          description: description.trim(),
          status,
          coverImage,
        });
        setEvents((prev) => [newEvt, ...prev]);
        showToast('success', 'New event created successfully!');
      }
      closeModal();
    } catch (err) {
      console.error('Error saving event:', err);
      showToast('error', 'Failed to save event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePrompt = async (evt: BirthdayEvent) => {
    try {
      const manifest = await getSystemManifest();
      const isMatch = (item: { eventId?: string; eventName?: string }) =>
        item.eventId === evt.id || (item.eventName && item.eventName.toLowerCase() === evt.name.toLowerCase());

      const photos = (manifest.galleryPhotos || []).filter(isMatch).length;
      const videos = (manifest.videos || []).filter(isMatch).length;
      const letters = (manifest.letters || []).filter(isMatch).length;
      const voiceNotes = (manifest.voiceNotes || []).filter(isMatch).length;
      const total = photos + videos + letters + voiceNotes;

      if (total > 0) {
        setDeleteTargetEvent(evt);
        setDeleteLinkedStats({ photos, videos, letters, voiceNotes, total });
        setReassignDestinationId(UNCATEGORIZED_EVENT_ID);
      } else {
        if (window.confirm(`Delete empty event "${evt.name}"?`)) {
          const updated = await deleteEvent(evt.id);
          setEvents(updated);
          showToast('success', 'Event deleted successfully');
        }
      }
    } catch (err) {
      console.error('Error preparing event deletion:', err);
    }
  };

  const handleConfirmProtectedDelete = async () => {
    if (!deleteTargetEvent) return;

    setSubmitting(true);
    try {
      // 1. Reassign linked media to destination event or uncategorized
      await reassignEventMedia(deleteTargetEvent.id, reassignDestinationId);

      // 2. Safely delete the event
      const updated = await deleteEvent(deleteTargetEvent.id);
      setEvents(updated);

      showToast('success', `Media reassigned and event "${deleteTargetEvent.name}" deleted.`);
      setDeleteTargetEvent(null);
      setDeleteLinkedStats(null);
    } catch (err) {
      console.error('Failed protected delete:', err);
      showToast('error', 'Failed to reassign media and delete event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          <span className="text-xs font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Event Management"
        subtitle="Organize, schedule, and sync birthday celebration timeline events"
      >
        <ActionButton label="Create Event" icon={Plus} variant="primary" onClick={openCreateModal} />
      </PageHeader>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse"></div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="backdrop-blur-md bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center space-y-4">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-200">No Events Created Yet</h3>
            <p className="text-xs text-slate-400">Click "Create Event" above to schedule your first birthday celebration event.</p>
          </div>
          <ActionButton label="Create Event" icon={Plus} variant="primary" onClick={openCreateModal} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="backdrop-blur-md bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700/80 transition-all duration-200 group flex flex-col"
            >
              {/* Cover Image / Placeholder */}
              <div className="relative h-48 bg-gradient-to-tr from-slate-950 via-slate-900 to-rose-950/40 border-b border-slate-800 flex items-center justify-center overflow-hidden">
                {evt.coverImage ? (
                  <img
                    src={evt.coverImage}
                    alt={evt.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:scale-105 transition-transform duration-300">
                    <ImageIcon className="w-10 h-10 text-rose-500/40" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      No Cover Image
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 opacity-80"></div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-20">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-md border ${
                      evt.status === 'Published'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {evt.status}
                  </span>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{evt.date}</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-1">
                    {evt.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {evt.description || 'No description provided.'}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-2">
                  <ActionButton
                    label="Edit"
                    icon={Edit3}
                    variant="secondary"
                    onClick={() => openEditModal(evt)}
                  />
                  <ActionButton
                    label="Delete"
                    icon={Trash2}
                    variant="danger"
                    onClick={() => handleDeletePrompt(evt)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Delete Protection Modal */}
      {deleteTargetEvent && deleteLinkedStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Event Delete Protection</h3>
                  <p className="text-xs text-rose-400 font-semibold">{deleteTargetEvent.name}</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteTargetEvent(null)}
                className="p-1.5 rounded-full bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                This event contains <strong className="text-white">{deleteLinkedStats.total} linked memory items</strong>. Media files will <strong className="text-emerald-400">NEVER be deleted or lost</strong>.
              </p>

              {/* Linked Items Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-300 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>{deleteLinkedStats.photos} Photos</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <VideoIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>{deleteLinkedStats.videos} Videos</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-rose-400" />
                  <span>{deleteLinkedStats.letters} Letters</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{deleteLinkedStats.voiceNotes} Voice Notes</span>
                </span>
              </div>

              {/* Destination Dropdown */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-300">
                  Select Destination for Linked Media:
                </label>
                <select
                  value={reassignDestinationId}
                  onChange={(e) => setReassignDestinationId(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl px-4 py-2.5 border border-slate-800 focus:border-rose-500/80 outline-none cursor-pointer"
                >
                  <option value={UNCATEGORIZED_EVENT_ID}>📂 Move to "Uncategorized Memories"</option>
                  {events
                    .filter((e) => e.id !== deleteTargetEvent.id)
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        🎂 Move to "{e.name}"
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTargetEvent(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmProtectedDelete}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 border border-rose-500/30 shadow-lg cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Reassigning...' : 'Reassign Media & Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Event Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shubham's 30th Birthday Party"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500/50 transition-colors"
                />
              </div>

              {/* Event Date & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Date / Milestone</label>
                  <input
                    type="text"
                    placeholder="e.g. June 19, 2026"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Publish Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Published' | 'Draft')}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500/50 transition-colors"
                  >
                    <option value="Published">Published (Visible to User)</option>
                    <option value="Draft">Draft (Admin Only)</option>
                  </select>
                </div>
              </div>

              {/* Event Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={3}
                  placeholder="Add details about this special celebration event..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500/50 transition-colors resize-none"
                />
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Cover Image</label>
                {imagePreview ? (
                  <div className="relative h-36 rounded-xl overflow-hidden border border-slate-800 group">
                    <img src={imagePreview} alt="Cover preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImage('');
                        setImagePreview('');
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/80 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-800 hover:border-rose-500/50 rounded-xl cursor-pointer bg-slate-950/60 transition-colors group">
                    <Upload className="w-6 h-6 text-slate-500 group-hover:text-rose-400 transition-colors" />
                    <span className="text-xs text-slate-400 mt-1">Upload Event Cover Photo</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <ActionButton
                  label={submitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                  icon={Plus}
                  variant="primary"
                  type="submit"
                  disabled={submitting}
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
