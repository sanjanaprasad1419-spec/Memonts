import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { PageHeader } from '../../../components/Admin/PageHeader';
import { ActionButton } from '../../../components/Admin/ActionButton';
import {
  subscribeLetters,
  addLetter,
  updateLetter,
  toggleLetterFavorite,
  deleteLetter,
  type Letter,
} from '../../../services/letterService';
import { subscribeToEvents, type BirthdayEvent } from '../../../services/eventService';
import {
  FileText,
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
  User,
  Heart,
  Eye,
  FileCode,
  Tag,
} from 'lucide-react';

type InputMode = 'manual' | 'file';

export const LettersTab: React.FC = () => {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [events, setEvents] = useState<BirthdayEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState<boolean>(false);

  // Modals & Feedback
  const [showModal, setShowModal] = useState<boolean>(false);
  const [readingLetter, setReadingLetter] = useState<Letter | null>(null);
  const [editingLetter, setEditingLetter] = useState<Letter | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form State
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [title, setTitle] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [letterDate, setLetterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [author, setAuthor] = useState<string>('Sanjana');
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const unsubLetters = subscribeLetters((items) => setLetters(items));
    const unsubEvents = subscribeToEvents((evts) => {
      setEvents(evts);
      if (evts.length > 0 && !selectedEventId) {
        setSelectedEventId(evts[0].id);
      }
    });
    return () => {
      unsubLetters();
      unsubEvents();
    };
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const resetForm = () => {
    setTitle('');
    setSelectedEventId(events.length > 0 ? events[0].id : '');
    setContent('');
    setLetterDate(new Date().toISOString().split('T')[0]);
    setAuthor('Sanjana');
    setIsFavorite(false);
    setInputMode('manual');
    setFileName('');
    setSelectedFile(null);
    setShowModal(false);
    setEditingLetter(null);
  };

  // Read uploaded text file (.txt or .md)
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setContent(text);
          if (!title) {
            // Auto fill title from filename
            const cleanTitle = file.name.replace(/\.(txt|md)$/i, '').replace(/[-_]/g, ' ');
            setTitle(cleanTitle);
          }
          showToast(`File "${file.name}" loaded successfully!`);
        }
      };
      reader.onerror = () => {
        showToast('Failed to read text file', 'error');
      };
      reader.readAsText(file);
    }
  };

  const handleSaveLetter = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return showToast('Please enter a title for the letter', 'error');
    if (!selectedEventId) return showToast('Please select an event before saving letter', 'error');
    if (!content.trim()) return showToast('Please write or upload letter content', 'error');

    setIsSaving(true);

    try {
      if (editingLetter) {
        await updateLetter(editingLetter.id, {
          title: title.trim(),
          eventId: selectedEventId,
          content: content.trim(),
          letterDate,
          author: author.trim() || 'Sanjana',
          favorite: isFavorite,
        });
        showToast('Letter updated successfully!');
      } else {
        await addLetter(
          {
            title: title.trim(),
            eventId: selectedEventId,
            content: content.trim(),
            letterDate,
            author: author.trim() || 'Sanjana',
            favorite: isFavorite,
          },
          inputMode === 'file' ? selectedFile : null
        );
        showToast('Letter posted and saved to Supabase Storage!');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save letter', 'error');
    } finally {
      setIsSaving(false);
      resetForm();
    }
  };

  const handleOpenEdit = (letter: Letter) => {
    setEditingLetter(letter);
    setTitle(letter.title);
    setSelectedEventId(letter.eventId || '');
    setContent(letter.content);
    setLetterDate(letter.letterDate);
    setAuthor(letter.author);
    setIsFavorite(!!letter.favorite);
    setInputMode('manual');
    setShowModal(true);
  };

  const handleDelete = async (letter: Letter) => {
    if (!window.confirm(`Delete letter "${letter.title}"?`)) return;
    try {
      await deleteLetter(letter.id);
      showToast('Letter deleted successfully');
    } catch (err: any) {
      showToast('Failed to delete letter', 'error');
    }
  };

  // Distinct Event Names for Filter Dropdown
  const uniqueEvents = Array.from(new Set(letters.map((l) => l.eventName))).filter(Boolean);

  // Filtered Letters
  const filteredLetters = letters.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.eventName && l.eventName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      l.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEvent = selectedEventFilter === 'all' || l.eventName === selectedEventFilter;
    const matchesFav = filterFavoritesOnly ? l.favorite : true;

    return matchesSearch && matchesEvent && matchesFav;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Personal Letters & Event Memories"
        subtitle="Write manually or upload text files linked to specific events for Shubham to read in Letters Between Stars"
      >
        <ActionButton
          label="Write / Upload Letter"
          icon={Plus}
          variant="primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
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
              placeholder="Search letters & events..."
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
            <option value="all">All Events ({letters.length})</option>
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

      {/* Letters Grid */}
      {filteredLetters.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4">
          <FileText className="w-12 h-12 text-rose-400/60" />
          <div>
            <h4 className="text-base font-bold text-white">No Personal Letters Found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Write manually or upload a text file to post a letter linked to a specific event.
            </p>
          </div>
          <ActionButton
            label="Write First Letter"
            icon={Plus}
            variant="primary"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLetters.map((letter) => (
            <div
              key={letter.id}
              className="bg-slate-900 border border-slate-800 hover:border-rose-500/40 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all duration-300 group"
            >
              <div className="space-y-3">
                {/* Event Name Badge & Favorite */}
                <div className="flex items-center justify-between">
                  <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-bold flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-rose-400" />
                    <span>{letter.eventName}</span>
                  </div>

                  <button
                    onClick={() => toggleLetterFavorite(letter.id, !!letter.favorite)}
                    className={`p-1.5 rounded-full border transition-all ${
                      letter.favorite
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-200'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${letter.favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                </div>

                {/* Letter Title */}
                <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                  {letter.title}
                </h3>

                {/* Date & Author */}
                <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    <span>{letter.letterDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>By {letter.author}</span>
                  </div>
                </div>

                {/* Snippet Preview */}
                <p className="text-xs text-slate-300/80 line-clamp-3 leading-relaxed font-serif bg-slate-950/50 p-3 rounded-xl border border-slate-800/60 italic">
                  "{letter.content}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setReadingLetter(letter)}
                  className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Read Full Letter</span>
                </button>

                <div className="flex items-center gap-2">
                  <ActionButton
                    label="Edit"
                    icon={Edit3}
                    variant="secondary"
                    onClick={() => handleOpenEdit(letter)}
                  />
                  <ActionButton
                    label="Delete"
                    icon={Trash2}
                    variant="danger"
                    onClick={() => handleDelete(letter)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write / Upload Letter Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative backdrop-blur-2xl bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400 fill-rose-500/20" />
                <span>{editingLetter ? 'Edit Personal Letter' : 'Post New Event Letter'}</span>
              </h3>
              <button
                onClick={resetForm}
                className="p-1.5 rounded-full bg-slate-950 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input Mode Selector (Write Manually vs Upload Text File) */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setInputMode('manual')}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  inputMode === 'manual'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>Write Manually</span>
              </button>
              <button
                type="button"
                onClick={() => setInputMode('file')}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  inputMode === 'file'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-4 h-4" />
                <span>Upload Text File (.txt / .md)</span>
              </button>
            </div>

            <form onSubmit={handleSaveLetter} className="space-y-4">
              {/* Event Name & Title Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      disabled={isSaving}
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
                    Letter Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. A Star In My Sky"
                    required
                    className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl px-4 py-2.5 border border-slate-800 focus:border-rose-500/80 outline-none"
                  />
                </div>
              </div>

              {/* Date & Author Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase text-slate-400">
                    Letter Date
                  </label>
                  <input
                    type="date"
                    value={letterDate}
                    onChange={(e) => setLetterDate(e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl px-4 py-2.5 border border-slate-800 focus:border-rose-500/80 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase text-slate-400">
                    Author Signoff
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Sanjana"
                    className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl px-4 py-2.5 border border-slate-800 focus:border-rose-500/80 outline-none"
                  />
                </div>
              </div>

              {/* Upload Text File Component (Mode 2) */}
              {inputMode === 'file' && (
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                  <label className="block text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                    <Upload className="w-4 h-4" />
                    <span>Select Text File (.txt or .md)</span>
                  </label>
                  <input
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-500/10 file:text-rose-400 hover:file:bg-rose-500/20 cursor-pointer"
                  />
                  {fileName && (
                    <p className="text-xs text-emerald-400 font-medium pt-1">
                      Loaded content from: <span className="underline">{fileName}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Letter Content Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase text-slate-400">
                    Letter Body Content *
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {content.length} chars | {content.trim() ? content.trim().split(/\s+/).length : 0} words
                  </span>
                </div>

                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your heart out to Shubham here..."
                  required
                  className="w-full bg-slate-950 text-slate-100 text-sm font-serif leading-relaxed rounded-xl p-4 border border-slate-800 focus:border-rose-500/80 outline-none resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="rounded accent-rose-500"
                />
                <span className="text-xs font-semibold text-slate-300">Mark as Favorite Letter</span>
              </label>

              {/* Action Submit */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <ActionButton label="Cancel" variant="secondary" onClick={resetForm} />
                <button
                  type="submit"
                  disabled={isSaving || events.length === 0 || !selectedEventId}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 border border-rose-500/30 shadow-lg cursor-pointer disabled:opacity-50"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>{editingLetter ? 'Save Changes' : 'Post Letter to Shubham'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Letter Full Reader Modal */}
      {readingLetter && (
        <div
          onClick={() => setReadingLetter(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar"
          >
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">
                  {readingLetter.eventName}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
                  {readingLetter.title}
                </h2>
              </div>
              <button
                onClick={() => setReadingLetter(null)}
                className="p-2 rounded-full bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="text-sm sm:text-base font-serif text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80 italic">
              {readingLetter.content}
            </div>

            {/* Footer Signoff */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800 font-medium">
              <span>Date: {readingLetter.letterDate}</span>
              <span className="text-rose-300 font-bold">With Love, {readingLetter.author} ❤️</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
