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
