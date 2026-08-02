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

export const EventsTab: React.FC = () => {
  const [events, setEvents] = useState<BirthdayEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<BirthdayEvent | null>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'Image size should be under 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCoverImage(dataUrl);
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const updated = await deleteEvent(id);
      setEvents(updated);
      showToast('success', 'Event deleted successfully');
    } catch (err) {
      console.error('Failed to delete event:', err);
      showToast('error', 'Failed to delete event.');
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
                    onClick={() => handleDelete(evt.id)}
                  />
                </div>
              </div>
            </div>
          ))}
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
