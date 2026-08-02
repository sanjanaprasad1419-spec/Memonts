import {
  addDocument,
  updateDocument,
  deleteDocument,
  subscribeToCollection,
  type BaseDoc,
} from '../firebase/firestore';
import { saveMediaToIndexedDB, getMediaFromIndexedDB } from '../utils/mediaStore';

export interface BirthdayEvent extends BaseDoc {
  name: string;
  description: string;
  date: string; // e.g. "June 19, 2026"
  status: 'Published' | 'Draft';
  coverImage?: string; // DataURL or image URL
}

const COLLECTION_NAME = 'events';
const STORAGE_KEY = `fb_${COLLECTION_NAME}`;

// Default initial birthday event if no events exist yet
const defaultEvent: BirthdayEvent = {
  id: 'default-bday-1',
  name: "Shubham's 30th Birthday",
  description: 'A special milestone birthday celebration timeline filled with love, memories, and surprises.',
  date: 'June 19, 2026',
  status: 'Published',
  coverImage: '',
  createdAt: new Date().toISOString(),
};

/**
 * Fetch all events (from IndexedDB / LocalStorage cache)
 */
export async function getEvents(): Promise<BirthdayEvent[]> {
  try {
    const cached = await getMediaFromIndexedDB<BirthdayEvent[]>(STORAGE_KEY);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }

    const lsStored = localStorage.getItem(STORAGE_KEY);
    if (lsStored) {
      const parsed = JSON.parse(lsStored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        saveMediaToIndexedDB(STORAGE_KEY, parsed);
        return parsed;
      }
    }

    // Default initial seed
    saveMediaToIndexedDB(STORAGE_KEY, [defaultEvent]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultEvent]));
    return [defaultEvent];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [defaultEvent];
  }
}

/**
 * Subscribe to realtime event changes
 */
export function subscribeToEvents(callback: (events: BirthdayEvent[]) => void): () => void {
  return subscribeToCollection<BirthdayEvent>(
    COLLECTION_NAME,
    (items) => {
      if (!items || items.length === 0) {
        callback([defaultEvent]);
      } else {
        callback(items);
      }
    },
    'createdAt',
    'desc'
  );
}

/**
 * Create a new event
 */
export async function createEvent(
  eventData: Omit<BirthdayEvent, 'id' | 'createdAt'>
): Promise<BirthdayEvent> {
  const currentEvents = await getEvents();

  const id = await addDocument(COLLECTION_NAME, {
    ...eventData,
    createdAt: new Date().toISOString(),
  });

  const newEvent: BirthdayEvent = {
    ...eventData,
    id,
    createdAt: new Date().toISOString(),
  };

  const updatedList = [newEvent, ...currentEvents.filter((e) => e.id !== id)];
  saveMediaToIndexedDB(STORAGE_KEY, updatedList);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

  return newEvent;
}

/**
 * Update an existing event
 */
export async function updateEvent(
  eventId: string,
  updatedFields: Partial<Omit<BirthdayEvent, 'id'>>
): Promise<BirthdayEvent[]> {
  const currentEvents = await getEvents();

  await updateDocument(COLLECTION_NAME, eventId, updatedFields);

  const updatedList = currentEvents.map((evt) =>
    evt.id === eventId ? { ...evt, ...updatedFields } : evt
  );

  saveMediaToIndexedDB(STORAGE_KEY, updatedList);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

  return updatedList;
}

/**
 * Delete an event permanently
 */
export async function deleteEvent(eventId: string): Promise<BirthdayEvent[]> {
  const currentEvents = await getEvents();

  // Optimistic deletion
  const updatedList = currentEvents.filter((evt) => evt.id !== eventId);
  saveMediaToIndexedDB(STORAGE_KEY, updatedList);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

  // Delete from Firestore
  deleteDocument(COLLECTION_NAME, eventId).catch((err) =>
    console.warn('Non-critical Firestore deletion error:', err)
  );

  return updatedList;
}
