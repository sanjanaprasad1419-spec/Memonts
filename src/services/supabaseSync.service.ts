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

export interface SystemManifest {
  galleryPhotos: GalleryPhoto[];
  welcomeBackgrounds: BackgroundPhoto[];
  featuredMemories: FeaturedMemory[];
  letters: Letter[];
  events: BirthdayEvent[];
  music: SongItem[];
  videos: VideoItem[];
  updatedAt: string;
}

const MANIFEST_PATH = 'metadata_manifest.json';
const MANIFEST_URL = `https://cyvqrxlibeexqieehaos.supabase.co/storage/v1/object/public/${BUCKET_NAME}/${MANIFEST_PATH}`;

const defaultManifest: SystemManifest = {
  galleryPhotos: [],
  welcomeBackgrounds: [],
  featuredMemories: [],
  letters: [],
  events: [
    {
      id: 'default-bday-1',
      name: "Shubham's 30th Birthday",
      description: 'A special milestone birthday celebration timeline filled with love, memories, and surprises.',
      date: 'June 19, 2026',
      status: 'Published',
      coverImage: '',
      createdAt: new Date().toISOString(),
    },
  ],
  music: [],
  videos: [],
  updatedAt: new Date().toISOString(),
};

let inMemoryManifest: SystemManifest = { ...defaultManifest };

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
        inMemoryManifest = {
          ...defaultManifest,
          ...data,
          galleryPhotos: data.galleryPhotos || [],
          welcomeBackgrounds: data.welcomeBackgrounds || [],
          featuredMemories: data.featuredMemories || [],
          letters: data.letters || [],
          events: data.events || defaultManifest.events,
          music: data.music || [],
          videos: data.videos || [],
        };
        console.log(`[DEBUG SupabaseSync] Manifest successfully downloaded! Total items -> Gallery: ${inMemoryManifest.galleryPhotos.length}, Backgrounds: ${inMemoryManifest.welcomeBackgrounds.length}, Letters: ${inMemoryManifest.letters.length}, Music: ${inMemoryManifest.music.length}, Videos: ${inMemoryManifest.videos.length}, Events: ${inMemoryManifest.events.length}`);
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
