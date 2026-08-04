import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { PageHeader } from '../../../components/Admin/PageHeader';
import { ActionButton } from '../../../components/Admin/ActionButton';
import {
  subscribeVoiceNotes,
  addVoiceNote,
  updateVoiceNote,
  toggleVoiceNoteFavorite,
  deleteVoiceNote,
  type VoiceNoteItem,
} from '../../../services/voiceNoteService';
import { subscribeToEvents, type BirthdayEvent } from '../../../services/eventService';
import {
  Mic,
  Plus,
  Trash2,
  Edit3,
  X,
  Star,
  Search,
  CheckCircle,
  AlertCircle,
  Upload,
  Calendar,
  Loader2,
} from 'lucide-react';

export const VoiceNotesTab: React.FC = () => {
  const [voiceNotes, setVoiceNotes] = useState<VoiceNoteItem[]>([]);
  const [events, setEvents] = useState<BirthdayEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState<boolean>(false);

  // Modal & Upload State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [editingVoiceNote, setEditingVoiceNote] = useState<VoiceNoteItem | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  useEffect(() => {
    const unsubNotes = subscribeVoiceNotes((items) => setVoiceNotes(items));
    const unsubEvents = subscribeToEvents((evts) => {
      setEvents(evts);
      if (evts.length > 0 && !selectedEventId) {
        setSelectedEventId(evts[0].id);
      }
    });
    return () => {
      unsubNotes();
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
      if (!title) {
        const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName);
      }
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setSelectedEventId(events.length > 0 ? events[0].id : '');
    setDate(new Date().toISOString().split('T')[0]);
    setIsFavorite(false);
    setUploadProgress(0);
    setShowUploadModal(false);
  };

  const handleUploadVoiceNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return showToast('Please select an audio file to upload', 'error');
    if (!title.trim()) return showToast('Please enter a title for the voice note', 'error');
    if (!selectedEventId) return showToast('Please select an event before uploading', 'error');

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await addVoiceNote(
        file,
        {
          title: title.trim(),
          eventId: selectedEventId,
          date,
          favorite: isFavorite,
        },
        (progress) => setUploadProgress(progress)
      );
      showToast('Voice note uploaded successfully!');
      resetForm();
    } catch (err: any) {
      showToast(err.message || 'Failed to upload voice note', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateVoiceNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingVoiceNote) return;

    try {
      await updateVoiceNote(editingVoiceNote.id, {
        title: editingVoiceNote.title,
        eventId: editingVoiceNote.eventId,
        date: editingVoiceNote.date,
        favorite: editingVoiceNote.favorite,
      });
      showToast('Voice note updated successfully!');
      setEditingVoiceNote(null);
    } catch (err: any) {
      showToast('Failed to update voice note', 'error');
    }
  };

  const handleDeleteVoiceNote = async (note: VoiceNoteItem) => {
    if (!window.confirm(`Delete voice note "${note.title}"?`)) return;
    try {
      await deleteVoiceNote(note.id, note.audioUrl);
      showToast('Voice note deleted');
    } catch (err: any) {
      showToast('Failed to delete voice note', 'error');
    }
  };

  const filteredVoiceNotes = voiceNotes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.date && note.date.includes(searchQuery));
    const matchesFav = filterFavoritesOnly ? note.favorite : true;
    return matchesSearch && matchesFav;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Voice Notes"
        subtitle="Manage audio messages and recorded birthday wishes linked to events"
      >
        <ActionButton
          label="Upload Voice Note"
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
            placeholder="Search voice notes..."
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

      {/* Voice Notes List */}
      {filteredVoiceNotes.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
          <Mic className="w-10 h-10 text-emerald-400/60 mx-auto" />
          <p className="text-xs text-slate-400">No voice notes uploaded yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVoiceNotes.map((note) => {
            const linkedEvent = events.find((e) => e.id === note.eventId);
            return (
              <div
                key={note.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{note.title}</h4>
                      {linkedEvent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                          {linkedEvent.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-rose-400" />
                        {note.date || 'No Date'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <audio src={note.audioUrl} controls className="h-9 max-w-[220px] sm:max-w-[280px]" />

                  <button
                    onClick={() => toggleVoiceNoteFavorite(note.id, !!note.favorite)}
                    className={`p-2 rounded-xl border transition-all ${
                      note.favorite
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-200'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${note.favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>

                  <ActionButton
                    label="Edit"
                    icon={Edit3}
                    variant="secondary"
                    onClick={() => setEditingVoiceNote(note)}
                  />

                  <ActionButton
                    label="Delete"
                    icon={Trash2}
                    variant="danger"
                    onClick={() => handleDeleteVoiceNote(note)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Voice Note Modal */}
      {editingVoiceNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative backdrop-blur-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Edit Voice Note</h3>
              <button
                onClick={() => setEditingVoiceNote(null)}
                className="p-1.5 rounded-full bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateVoiceNote} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-400">Title</label>
                <input
                  type="text"
                  value={editingVoiceNote.title}
                  onChange={(e) => setEditingVoiceNote({ ...editingVoiceNote, title: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl px-4 py-2 border border-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-400">Associated Event</label>
                <select
                  value={editingVoiceNote.eventId || 'uncategorized'}
                  onChange={(e) => setEditingVoiceNote({ ...editingVoiceNote, eventId: e.target.value })}
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
                <label className="block text-xs font-semibold uppercase text-slate-400">Recording Date</label>
                <input
                  type="date"
                  value={editingVoiceNote.date || ''}
                  onChange={(e) => setEditingVoiceNote({ ...editingVoiceNote, date: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl px-4 py-2 border border-slate-800 outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={!!editingVoiceNote.favorite}
                  onChange={(e) => setEditingVoiceNote({ ...editingVoiceNote, favorite: e.target.checked })}
                  className="rounded accent-emerald-500"
                />
                <span className="text-xs font-semibold text-slate-300">Mark as Favorite</span>
              </label>

              <div className="pt-3 flex items-center justify-end gap-3">
                <ActionButton label="Cancel" variant="secondary" onClick={() => setEditingVoiceNote(null)} />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-500/30 shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative backdrop-blur-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-400" />
                <span>Upload Voice Note</span>
              </h3>
              <button
                onClick={resetForm}
                className="p-1.5 rounded-full bg-slate-950 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadVoiceNote} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-400">
                  Select Audio File (MP3, WAV, M4A, OGG, AAC) *
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  required
                  className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-400">
                  Voice Note Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midnight Birthday Wishes"
                  required
                  disabled={isUploading}
                  className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl px-4 py-2.5 border border-slate-800 focus:border-emerald-500/80 outline-none"
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
                    className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl px-4 py-2.5 border border-slate-800 focus:border-emerald-500/80 outline-none cursor-pointer"
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
                  Recording Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={isUploading}
                  className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl px-4 py-2.5 border border-slate-800 focus:border-emerald-500/80 outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="rounded accent-emerald-500"
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
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-200"
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-500/30 shadow-md cursor-pointer disabled:opacity-50"
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
    </div>
  );
};
