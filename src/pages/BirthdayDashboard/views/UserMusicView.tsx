import React, { useEffect, useState } from 'react';
import { PageContainer } from '../../../components/User/PageContainer';
import { SectionHeader } from '../../../components/User/SectionHeader';
import { BackButton } from '../../../components/User/BackButton';
import { subscribeMusic, setActiveBackgroundSong, type SongItem } from '../../../services/musicService';
import { Music as MusicIcon, Disc, Tag, Star, Sparkles, Radio } from 'lucide-react';

interface UserMusicViewProps {
  onBack: () => void;
}

export const UserMusicView: React.FC<UserMusicViewProps> = ({ onBack }) => {
  const [songs, setSongs] = useState<SongItem[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeMusic((items) => {
      setSongs(items);
    });

    return () => unsubscribe();
  }, []);

  const handleSetActive = async (song: SongItem) => {
    setSongs((prev) =>
      prev.map((s) => ({
        ...s,
        isActiveBackground: s.id === song.id || s.title === song.title,
      }))
    );
    await setActiveBackgroundSong(song.id);
  };

  const handleTurnOffTheme = async () => {
    setSongs((prev) =>
      prev.map((s) => ({
        ...s,
        isActiveBackground: false,
      }))
    );
    await setActiveBackgroundSong(null);
  };

  return (
    <PageContainer maxWidth="4xl">
      <BackButton onClick={onBack} label="Back to Universe" />

      <SectionHeader
        badge="Echoes Playlist"
        title="Background Music & Theme Songs"
        subtitle="Curated songs and background instrumental tracks for your birthday universe."
      />

      <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
        {/* Album Header Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-pink-500/20 via-rose-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-xl shrink-0">
              <Disc className="w-10 h-10 animate-[spin_10s_linear_infinite]" />
            </div>

            <div className="text-center sm:text-left space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1 justify-center sm:justify-start">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Curated Soundtrack</span>
              </span>
              <h3 className="text-xl font-bold text-white">
                Shubham's Theme Music
              </h3>
              <p className="text-xs text-slate-400">
                {songs.length} Tracks uploaded • Plays continuously all around your dashboard
              </p>
            </div>
          </div>

          {songs.some((s) => s.isActiveBackground) && (
            <button
              onClick={handleTurnOffTheme}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 text-xs font-bold text-slate-300 hover:text-rose-300 transition-all cursor-pointer whitespace-nowrap shadow-md"
            >
              Turn Off Theme Music
            </button>
          )}
        </div>

        {/* Tracks List */}
        {songs.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-2">
            <MusicIcon className="w-8 h-8 text-rose-400/60 mx-auto" />
            <p className="text-xs text-slate-400">
              No theme songs uploaded yet. When Sanjana uploads music in Admin Panel, it will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {songs.map((song, idx) => (
              <div
                key={song.id || idx}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  song.isActiveBackground
                    ? 'bg-rose-950/20 border-rose-500/60 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-xs font-bold text-slate-500 w-5 text-center shrink-0">
                    #{idx + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100 truncate">{song.title}</h4>
                      {song.isActiveBackground && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/80 text-emerald-300 text-[10px] font-extrabold flex items-center gap-1">
                          <Radio className="w-2.5 h-2.5 text-emerald-400" />
                          <span>Active Theme</span>
                        </span>
                      )}
                      {song.favorite && (
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>By {song.artist}</span>
                      <span>•</span>
                      <span className="text-rose-400 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {song.eventName}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex items-center gap-3 justify-between sm:justify-end border-t sm:border-t-0 border-slate-800/60 pt-3 sm:pt-0">
                  <audio
                    src={song.audioUrl}
                    controls
                    preload="auto"
                    className="h-8 max-w-[200px]"
                    onPlay={() => window.dispatchEvent(new Event('pause-bg-music'))}
                    onPause={() => window.dispatchEvent(new Event('resume-bg-music'))}
                  />

                  {!song.isActiveBackground && (
                    <button
                      onClick={() => handleSetActive(song)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 text-xs font-bold text-rose-300 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Set Theme
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};
