import React from 'react';
import { PageContainer } from '../../../components/User/PageContainer';
import { SectionHeader } from '../../../components/User/SectionHeader';
import { BackButton } from '../../../components/User/BackButton';
import { Mic, Play, Clock } from 'lucide-react';

interface UserVoiceNotesViewProps {
  onBack: () => void;
}

export const UserVoiceNotesView: React.FC<UserVoiceNotesViewProps> = ({ onBack }) => {
  const voiceNotes = [
    {
      id: '1',
      title: 'Midnight Birthday Wish Recording',
      duration: '1:15',
      date: 'June 19, 2026',
    },
    {
      id: '2',
      title: 'Heartfelt Memory Voice Message',
      duration: '2:04',
      date: 'June 19, 2026',
    },
  ];

  return (
    <PageContainer maxWidth="4xl">
      <BackButton onClick={onBack} label="Back to Hub" />

      <SectionHeader
        badge="Audio Messages"
        title="Voice Notes"
        subtitle="Listen to personal audio wishes and recorded memories."
      />

      <div className="space-y-4 animate-fadeIn">
        {voiceNotes.map((note) => (
          <div
            key={note.id}
            className="backdrop-blur-md bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              {/* Audio Artwork Placeholder */}
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
                <Mic className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">{note.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    {note.duration}
                  </span>
                  <span>•</span>
                  <span>{note.date}</span>
                </div>
              </div>
            </div>

            {/* Audio Waveform Placeholder & Disabled Play Button */}
            <div className="flex items-center gap-4 self-end sm:self-center">
              <div className="hidden md:flex items-center gap-1 h-6">
                <div className="w-1 h-3 bg-slate-800 rounded-full"></div>
                <div className="w-1 h-5 bg-slate-700 rounded-full"></div>
                <div className="w-1 h-2 bg-slate-800 rounded-full"></div>
                <div className="w-1 h-6 bg-emerald-500/40 rounded-full"></div>
                <div className="w-1 h-4 bg-slate-700 rounded-full"></div>
                <div className="w-1 h-2 bg-slate-800 rounded-full"></div>
              </div>

              <button
                disabled={true}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-500 bg-slate-950 border border-slate-800 flex items-center gap-2 cursor-not-allowed opacity-60"
                title="Playback disabled"
              >
                <Play className="w-4 h-4" />
                <span>Play</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
};
