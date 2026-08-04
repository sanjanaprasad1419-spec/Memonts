import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../../components/User/PageContainer';
import { SectionHeader } from '../../../components/User/SectionHeader';
import { BackButton } from '../../../components/User/BackButton';
import { Mic, Clock } from 'lucide-react';
import { subscribeVoiceNotes, type VoiceNoteItem } from '../../../services/voiceNoteService';

interface UserVoiceNotesViewProps {
  onBack: () => void;
}

export const UserVoiceNotesView: React.FC<UserVoiceNotesViewProps> = ({ onBack }) => {
  const [voiceNotes, setVoiceNotes] = useState<VoiceNoteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsub = subscribeVoiceNotes((items) => {
      setVoiceNotes(items);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <PageContainer maxWidth="4xl">
      <BackButton onClick={onBack} label="Back to Hub" />

      <SectionHeader
        badge="Audio Messages"
        title="Voice Notes"
        subtitle="Listen to personal audio wishes and recorded memories."
      />

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-900/60 border border-slate-800"></div>
          ))}
        </div>
      ) : voiceNotes.length === 0 ? (
        <div className="backdrop-blur-md bg-slate-900/60 border border-slate-800/80 rounded-2xl p-10 text-center space-y-3">
          <Mic className="w-10 h-10 text-emerald-400/60 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Voice Notes Yet</h3>
          <p className="text-xs text-slate-400">
            Check back soon! Audio messages and recorded wishes will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4 animate-fadeIn">
          {voiceNotes.map((note) => (
            <div
              key={note.id}
              className="backdrop-blur-md bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
                  <Mic className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">{note.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    {note.date && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        {note.date}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Audio Controls */}
              <div className="flex items-center gap-4 self-end sm:self-center">
                <audio src={note.audioUrl} controls className="h-10 max-w-[240px] sm:max-w-[300px]" />
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
};
