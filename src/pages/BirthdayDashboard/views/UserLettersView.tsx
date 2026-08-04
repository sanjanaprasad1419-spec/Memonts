import React, { useEffect, useState } from 'react';
import { PageContainer } from '../../../components/User/PageContainer';
import { SectionHeader } from '../../../components/User/SectionHeader';
import { BackButton } from '../../../components/User/BackButton';
import { subscribeLetters, type Letter } from '../../../services/letterService';
import {
  FileText,
  Tag,
  Calendar,
  User,
  Heart,
  X,
  Star,
  Sparkles,
} from 'lucide-react';

interface UserLettersViewProps {
  onBack: () => void;
  onSelectLetter?: (id: string) => void;
}

export const UserLettersView: React.FC<UserLettersViewProps> = ({ onBack }) => {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');
  const [activeLetter, setActiveLetter] = useState<Letter | null>(null);

  useEffect(() => {
    // Subscribe to Firestore letters collection in real time
    const unsubscribe = subscribeLetters((items) => {
      setLetters(items);
    });

    return () => unsubscribe();
  }, []);

  const uniqueEvents = Array.from(new Set(letters.map((l) => l.eventName))).filter((e): e is string => Boolean(e));

  const filteredLetters = letters.filter((l) =>
    selectedEventFilter === 'all' ? true : l.eventName === selectedEventFilter
  );

  return (
    <PageContainer maxWidth="5xl">
      <BackButton onClick={onBack} label="Back to Universe" />

      <SectionHeader
        badge="Letters Between Stars"
        title="Letters From The Heart"
        subtitle="Handwritten letters and special messages dedicated to you across every memory and event."
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
            All Events ({letters.length})
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

      {/* Letters List */}
      {letters.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-100">Letters Are Being Written</h3>
            <p className="text-sm text-slate-400 max-w-md">
              When Sanjana posts letters in the Admin Panel for your specific events, they will automatically appear here in real time.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {filteredLetters.map((letter) => (
            <div
              key={letter.id}
              onClick={() => setActiveLetter(letter)}
              className="interactive group backdrop-blur-xl bg-slate-900/60 border border-slate-800/80 hover:border-rose-500/50 rounded-2xl p-6 shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Event Name Badge & Favorite */}
                <div className="flex items-center justify-between">
                  <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <Tag className="w-3.5 h-3.5 text-rose-400" />
                    <span>{letter.eventName}</span>
                  </div>

                  {letter.favorite && (
                    <div className="flex items-center gap-1 text-amber-300 text-xs font-bold bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>Favorite</span>
                    </div>
                  )}
                </div>

                {/* Letter Title */}
                <h3 className="text-lg font-bold text-slate-100 group-hover:text-rose-300 transition-colors">
                  {letter.title}
                </h3>

                {/* Date & Author */}
                <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    <span>{letter.letterDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>By {letter.author}</span>
                  </div>
                </div>

                {/* Snippet Preview */}
                <p className="text-xs text-slate-300/80 line-clamp-3 leading-relaxed font-serif bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 italic">
                  "{letter.content}"
                </p>
              </div>

              {/* Click to Read Button */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 group-hover:text-rose-300 transition-colors flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Click to open star letter</span>
                </span>
                <Heart className="w-4 h-4 text-rose-500/60 group-hover:text-rose-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Letter Envelope Reader Modal */}
      {activeLetter && (
        <div
          onClick={() => setActiveLetter(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-slate-900/95 border border-rose-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Event Badge & Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold inline-flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-rose-400" />
                    <span>{activeLetter.eventName}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
                    {activeLetter.title}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveLetter(null)}
                  className="p-2 rounded-full bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Full Letter Content Body */}
              <div className="text-sm sm:text-base font-serif text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-950/80 p-6 rounded-2xl border border-slate-800/80 italic shadow-inner">
                {activeLetter.content}
              </div>
            </div>

            {/* Footer Signoff */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                <span>Date: {activeLetter.letterDate}</span>
              </div>
              <div className="text-rose-300 font-bold text-sm flex items-center gap-1">
                <span>With Love, {activeLetter.author}</span>
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
