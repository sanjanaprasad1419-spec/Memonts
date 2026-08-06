import { isSupabaseConfigured } from '../lib/supabase';
import { StorageService, BUCKET_NAME } from './storage.service';
import type { StorageFolder } from '../types/supabase';
import type { GalleryPhoto } from './galleryService';
import type { BackgroundPhoto } from './backgroundService';
import type { FeaturedMemory } from './featuredService';
import type { Letter } from './letterService';
import type { BirthdayEvent } from './eventService';
import type { SongItem } from './musicService';
import type { VideoItem } from './videoService';
import type { VoiceNoteItem } from './voiceNoteService';

export interface SystemManifest {
  galleryPhotos: GalleryPhoto[];
  welcomeBackgrounds: BackgroundPhoto[];
  featuredMemories: FeaturedMemory[];
  letters: Letter[];
  events: BirthdayEvent[];
  music: SongItem[];
  videos: VideoItem[];
  voiceNotes: VoiceNoteItem[];
  updatedAt: string;
}

const MANIFEST_PATH = 'metadata_manifest.json';
const MANIFEST_URL = `https://cyvqrxlibeexqieehaos.supabase.co/storage/v1/object/public/${BUCKET_NAME}/${MANIFEST_PATH}`;

export const UNCATEGORIZED_EVENT_ID = 'uncategorized';
export const UNCATEGORIZED_EVENT: BirthdayEvent = {
  id: UNCATEGORIZED_EVENT_ID,
  name: 'Uncategorized Memories',
  description: 'Cherished memories waiting to be organized into specific celebration events.',
  date: 'Various Dates',
  status: 'Published',
  coverImage: '',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const defaultManifest: SystemManifest = {
  galleryPhotos: [],
  welcomeBackgrounds: [],
  featuredMemories: [],
  letters: [],
  events: [
    {
      id: 'default-bday-1',
      name: "Shubham's Birthday",
      description: 'A special milestone birthday celebration timeline filled with love, memories, and surprises.',
      date: 'June 19, 2026',
      status: 'Published',
      coverImage: '',
      createdAt: new Date().toISOString(),
    },
  ],
  music: [],
  videos: [],
  voiceNotes: [],
  updatedAt: new Date().toISOString(),
};

let inMemoryManifest: SystemManifest = { ...defaultManifest };

/**
 * Ensures all media items without an eventId are migrated to 'uncategorized'
 */
const migrateManifestEvents = (data: SystemManifest): SystemManifest => {
  let needsSave = false;
  const eventsList = data.events || defaultManifest.events;

  const resolveEventId = (item: { eventId?: string; eventName?: string }): string => {
    if (item.eventId && item.eventId.trim()) {
      return item.eventId.trim();
    }
    if (item.eventName && item.eventName.trim()) {
      const match = eventsList.find((e) => e.name.toLowerCase() === item.eventName!.trim().toLowerCase());
      if (match) return match.id;
    }
    return UNCATEGORIZED_EVENT_ID;
  };

  const galleryPhotos = (data.galleryPhotos || []).map((photo) => {
    const validId = resolveEventId(photo);
    if (photo.eventId !== validId) {
      needsSave = true;
      return { ...photo, eventId: validId };
    }
    return photo;
  });

  const videos = (data.videos || []).map((video) => {
    const validId = resolveEventId(video);
    if (video.eventId !== validId) {
      needsSave = true;
      return { ...video, eventId: validId };
    }
    return video;
  });

  const letters = (data.letters || []).map((letter) => {
    const validId = resolveEventId(letter);
    if (letter.eventId !== validId) {
      needsSave = true;
      return { ...letter, eventId: validId };
    }
    return letter;
  });

  const voiceNotes = (data.voiceNotes || []).map((note) => {
    const validId = resolveEventId(note);
    if (note.eventId !== validId) {
      needsSave = true;
      return { ...note, eventId: validId };
    }
    return note;
  });

  const migrated: SystemManifest = {
    ...data,
    events: eventsList,
    galleryPhotos,
    videos,
    letters,
    voiceNotes,
  };

  if (needsSave) {
    console.log('[SupabaseSync Migration] Migrated existing media event bindings.');
  }

  return migrated;
};

/**
 * Downloads the global system manifest from Supabase Storage ('memories/metadata_manifest.json')
 */
export const getSystemManifest = async (): Promise<SystemManifest> => {
  if (!isSupabaseConfigured()) {
    console.warn('[SupabaseSync] Supabase is not configured in .env. Using fallback memory manifest.');
    return inMemoryManifest;
  }

  try {
    console.log(`[DEBUG SupabaseSync] Downloading system manifest from ${MANIFEST_URL}...`);
    const response = await fetch(`${MANIFEST_URL}?t=${Date.now()}`, { cache: 'no-store' });

    if (response.ok) {
      const data: SystemManifest = await response.json();
      if (data && typeof data === 'object') {
        const rawManifest: SystemManifest = {
          ...defaultManifest,
          ...data,
          galleryPhotos: data.galleryPhotos || [],
          welcomeBackgrounds: data.welcomeBackgrounds || [],
          featuredMemories: data.featuredMemories || [],
          letters: data.letters || [],
          events: data.events || defaultManifest.events,
          music: data.music || [],
          videos: data.videos || [],
          voiceNotes: data.voiceNotes || [],
        };
        inMemoryManifest = migrateManifestEvents(rawManifest);
        console.log(`[DEBUG SupabaseSync] Manifest downloaded! Gallery: ${inMemoryManifest.galleryPhotos.length}, Videos: ${inMemoryManifest.videos.length}, Letters: ${inMemoryManifest.letters.length}, Voice Notes: ${inMemoryManifest.voiceNotes.length}, Events: ${inMemoryManifest.events.length}`);
        return inMemoryManifest;
      }
    } else {
      console.info(`[DEBUG SupabaseSync] Manifest file not found in Supabase Storage (${response.status}). Initializing manifest.`);
    }
  } catch (err) {
    console.warn('[DEBUG SupabaseSync] Error fetching manifest from Supabase Storage:', err);
  }

  return inMemoryManifest;
};

/**
 * Uploads the updated system manifest to Supabase Storage ('memories/metadata_manifest.json')
 */
export const saveSystemManifest = async (manifest: SystemManifest): Promise<boolean> => {
  inMemoryManifest = { ...manifest, updatedAt: new Date().toISOString() };

  if (!isSupabaseConfigured()) {
    console.warn('[SupabaseSync] Cannot save to Supabase Storage: missing environment credentials.');
    return false;
  }

  try {
    console.log('[DEBUG SupabaseSync] Uploading updated manifest to Supabase Storage memories/metadata_manifest.json...');
    const manifestJson = JSON.stringify(inMemoryManifest, null, 2);
    const blob = new Blob([manifestJson], { type: 'application/json' });
    const file = new File([blob], MANIFEST_PATH, { type: 'application/json' });

    const uploadRes = await StorageService.uploadFile({
      folder: '' as StorageFolder,
      file,
      customFileName: MANIFEST_PATH,
      upsert: true,
      contentType: 'application/json',
    });

    if (uploadRes.success) {
      console.log('[DEBUG SupabaseSync Upload Success] Manifest saved permanently to Supabase Storage!');
      return true;
    } else {
      console.error('[DEBUG SupabaseSync Upload Error]', uploadRes.error);
      return false;
    }
  } catch (err) {
    console.error('[DEBUG SupabaseSync Exception]', err);
    return false;
  }
};

/**
 * Reassigns all media items linked to fromEventId to toEventId
 */
export const reassignEventMedia = async (fromEventId: string, toEventId: string): Promise<void> => {
  const manifest = await getSystemManifest();
  const galleryPhotos = (manifest.galleryPhotos || []).map((p) =>
    p.eventId === fromEventId ? { ...p, eventId: toEventId } : p
  );
  const videos = (manifest.videos || []).map((v) =>
    v.eventId === fromEventId ? { ...v, eventId: toEventId } : v
  );
  const letters = (manifest.letters || []).map((l) =>
    l.eventId === fromEventId ? { ...l, eventId: toEventId } : l
  );
  const voiceNotes = (manifest.voiceNotes || []).map((v) =>
    v.eventId === fromEventId ? { ...v, eventId: toEventId } : v
  );

  await saveSystemManifest({
    ...manifest,
    galleryPhotos,
    videos,
    letters,
    voiceNotes,
  });
  console.log(`[SupabaseSync Reassign] Reassigned linked media from "${fromEventId}" to "${toEventId}".`);
};
