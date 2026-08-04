import { getSystemManifest, saveSystemManifest } from './supabaseSync.service';

export interface BirthdayEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  status: 'Published' | 'Draft';
  coverImage?: string;
  createdAt?: string;
}

const subscribers = new Set<(events: BirthdayEvent[]) => void>();

const notifySubscribers = (events: BirthdayEvent[]) => {
  subscribers.forEach((cb) => {
    try {
      cb(events);
    } catch (e) {
      console.error('[DEBUG Events Refresh Error]', e);
    }
  });
};

export async function getEvents(): Promise<BirthdayEvent[]> {
  const manifest = await getSystemManifest();
  return manifest.events || [];
}

export function subscribeToEvents(callback: (events: BirthdayEvent[]) => void): () => void {
  subscribers.add(callback);

  getEvents().then((items) => {
    notifySubscribers(items);
  });

  return () => {
    subscribers.delete(callback);
  };
}

export async function createEvent(
  eventData: Omit<BirthdayEvent, 'id' | 'createdAt'>
): Promise<BirthdayEvent> {
  const id = `event_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newEvent: BirthdayEvent = {
    ...eventData,
    id,
    createdAt: new Date().toISOString(),
  };

  const manifest = await getSystemManifest();
  const updatedEvents = [newEvent, ...manifest.events.filter((e) => e.id !== id)];
  await saveSystemManifest({ ...manifest, events: updatedEvents });

  notifySubscribers(updatedEvents);
  return newEvent;
}

export async function updateEvent(
  eventId: string,
  updatedFields: Partial<Omit<BirthdayEvent, 'id'>>
): Promise<BirthdayEvent[]> {
  const manifest = await getSystemManifest();
  const updatedEvents = manifest.events.map((evt) =>
    evt.id === eventId ? { ...evt, ...updatedFields } : evt
  );
  await saveSystemManifest({ ...manifest, events: updatedEvents });
  notifySubscribers(updatedEvents);
  return updatedEvents;
}

export async function deleteEvent(eventId: string): Promise<BirthdayEvent[]> {
  const manifest = await getSystemManifest();
  const updatedEvents = manifest.events.filter((evt) => evt.id !== eventId);
  await saveSystemManifest({ ...manifest, events: updatedEvents });
  notifySubscribers(updatedEvents);
  return updatedEvents;
}

/**
 * 3-Tier Event Cover Image Priority Resolution:
 * 1. Custom Event Cover uploaded during event creation/editing
 * 2. First Photo belonging to that Event
 * 3. Fallback null (triggers beautiful cosmic placeholder theme component)
 */
export function getEventCover(event: BirthdayEvent, eventPhotos: Array<{ imageUrl: string }>): string | null {
  if (event.coverImage && event.coverImage.trim()) {
    return event.coverImage;
  }
  if (eventPhotos && eventPhotos.length > 0 && eventPhotos[0].imageUrl) {
    return eventPhotos[0].imageUrl;
  }
  return null;
}

export interface EventStats {
  photoCount: number;
  videoCount: number;
  letterCount: number;
  voiceNoteCount: number;
  totalMemories: number;
}

export function getEventStats(
  eventId: string,
  photos: Array<{ eventId?: string; eventName?: string }>,
  videos: Array<{ eventId?: string; eventName?: string }>,
  letters: Array<{ eventId?: string; eventName?: string }>,
  voiceNotes: Array<{ eventId?: string; eventName?: string }>,
  eventName?: string
): EventStats {
  const isMatch = (item: { eventId?: string; eventName?: string }) => {
    if (item.eventId && item.eventId === eventId) return true;
    if (eventName && item.eventName && item.eventName.toLowerCase() === eventName.toLowerCase()) return true;
    return false;
  };

  const photoCount = photos.filter(isMatch).length;
  const videoCount = videos.filter(isMatch).length;
  const letterCount = letters.filter(isMatch).length;
  const voiceNoteCount = voiceNotes.filter(isMatch).length;
  const totalMemories = photoCount + videoCount + letterCount + voiceNoteCount;

  return {
    photoCount,
    videoCount,
    letterCount,
    voiceNoteCount,
    totalMemories,
  };
}

