import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../../components/User/PageContainer';
import { SectionHeader } from '../../../components/User/SectionHeader';
import { BackButton } from '../../../components/User/BackButton';
import { Calendar, Sparkles, Image as ImageIcon } from 'lucide-react';
import { getEvents, type BirthdayEvent } from '../../../services/eventService';

interface UserFutureMemoriesViewProps {
  onBack: () => void;
}

export const UserFutureMemoriesView: React.FC<UserFutureMemoriesViewProps> = ({ onBack }) => {
  const [events, setEvents] = useState<BirthdayEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadPublishedEvents();
  }, []);

  const loadPublishedEvents = async () => {
    try {
      const allEvents = await getEvents();
      // Sync only published events to user view
      const published = allEvents.filter((evt) => evt.status === 'Published');
      setEvents(published);
    } catch (err) {
      console.error('Failed to load published events:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="5xl">
      <BackButton onClick={onBack} label="Back to Hub" />

      <div className="space-y-8 animate-fadeIn">
        <SectionHeader
          badge="Time Capsule & Milestones"
          title="Birthday Event Timeline"
          subtitle="Celebration milestones, special surprises, and memory archives."
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-900/40 border border-slate-800 animate-pulse"></div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-800/80 rounded-3xl p-10 text-center space-y-4">
            <Calendar className="w-12 h-12 text-slate-500 mx-auto" />
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-slate-200">No Events Scheduled</h3>
              <p className="text-xs text-slate-400">
                Check back soon! New celebration events and timeline milestones will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="backdrop-blur-2xl bg-slate-950/70 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl hover:border-rose-500/50 transition-all duration-300 group flex flex-col hover:-translate-y-1"
              >
                {/* Event Cover Image */}
                <div className="relative h-48 bg-gradient-to-tr from-slate-950 via-slate-900 to-rose-950/40 border-b border-slate-800/80 flex items-center justify-center overflow-hidden">
                  {evt.coverImage ? (
                    <img
                      src={evt.coverImage}
                      alt={evt.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <ImageIcon className="w-10 h-10 text-rose-500/40" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Celebration Event
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 opacity-90"></div>

                  <div className="absolute top-3 right-3 z-20">
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-md shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Event</span>
                    </span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-rose-400 font-bold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{evt.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                      {evt.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {evt.description || 'No description provided.'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};
