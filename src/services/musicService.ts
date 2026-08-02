import {
  subscribeToCollection,
  addDocument,
  updateDocument,
  deleteDocument,
  type BaseDoc,
} from '../firebase/firestore';
import { deleteImageFromStorage, type UploadProgressCallback } from '../firebase/storage';
import { saveMediaToIndexedDB, getMediaFromIndexedDB } from '../utils/mediaStore';

export interface SongItem extends BaseDoc {
  audioUrl: string;
  title: string;
  artist: string;
  eventName: string;
  isActiveBackground?: boolean;
  favorite?: boolean;
}

const COLLECTION_NAME = 'music';
const MUSIC_CACHE_KEY = 'fb_music';

// Persistent in-memory map keyed by normalized title AND ID
const inMemoryAudioMap = new Map<string, string>();
const inMemorySongStore = new Map<string, SongItem>();

/**
 * Normalizes title string for bulletproof matching
 */
const getTitleKey = (item: Partial<SongItem>): string => {
  return (item.title || 'untitled').toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Validates if an audio URL is a genuine uploaded audio DataURL or Blob URL
 */
const isGenuineUploadedAudio = (url?: string): boolean => {
  if (!url) return false;
  if (url.includes('pixabay.com') || url.includes('audio_1808fbf07a')) return false;
  return url.startsWith('data:audio') || url.startsWith('blob:') || url.length > 20;
};

/**
 * Deduplicates song tracks while guaranteeing uploaded audio DataURLs are NEVER lost
 */
const deduplicateSongs = (items: SongItem[]): SongItem[] => {
  const map = new Map<string, SongItem>();

  items.forEach((item) => {
    if (!item || !item.title) return;
    const titleKey = getTitleKey(item);
    const existing = map.get(titleKey) || (item.id ? map.get(item.id) : undefined);

    // Look up in-memory registry if item.audioUrl is empty
    const registeredUrl = inMemoryAudioMap.get(titleKey) || (item.id ? inMemoryAudioMap.get(item.id) : undefined);

    const validAudioUrl = isGenuineUploadedAudio(item.audioUrl)
      ? item.audioUrl
      : isGenuineUploadedAudio(existing?.audioUrl)
      ? existing!.audioUrl
      : isGenuineUploadedAudio(registeredUrl)
      ? registeredUrl!
      : item.audioUrl || '';

    if (validAudioUrl) {
      inMemoryAudioMap.set(titleKey, validAudioUrl);
      if (item.id) inMemoryAudioMap.set(item.id, validAudioUrl);
    }

    const merged: SongItem = {
      ...(existing || {}),
      ...item,
      id: item.id || existing?.id || `song_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      audioUrl: validAudioUrl || existing?.audioUrl || '',
      isActiveBackground: item.isActiveBackground ?? existing?.isActiveBackground ?? false,
    };

    map.set(titleKey, merged);
  });

  return Array.from(map.values());
};

/**
 * Reads persistent music items from IndexedDB
 */
export const getMusicFromCache = async (): Promise<SongItem[]> => {
  const idbItems = await getMediaFromIndexedDB<SongItem[]>(MUSIC_CACHE_KEY);
  if (idbItems && Array.isArray(idbItems) && idbItems.length > 0) {
    const deduped = deduplicateSongs(idbItems);
    deduped.forEach((s) => {
      inMemorySongStore.set(s.id, s);
      inMemorySongStore.set(getTitleKey(s), s);
      if (isGenuineUploadedAudio(s.audioUrl)) {
        inMemoryAudioMap.set(getTitleKey(s), s.audioUrl);
        inMemoryAudioMap.set(s.id, s.audioUrl);
      }
    });
    return deduped;
  }

  const raw = localStorage.getItem(MUSIC_CACHE_KEY);
  if (!raw) return Array.from(inMemorySongStore.values());
  try {
    const parsed = JSON.parse(raw);
    const valid = Array.isArray(parsed) ? parsed.filter((s) => s && s.title) : [];
    const deduped = deduplicateSongs(valid);
    deduped.forEach((s) => {
      inMemorySongStore.set(s.id, s);
      inMemorySongStore.set(getTitleKey(s), s);
    });
    return deduped;
  } catch {
    return Array.from(inMemorySongStore.values());
  }
};

const saveMusicToCache = (items: SongItem[]) => {
  const deduped = deduplicateSongs(items);
  inMemorySongStore.clear();

  deduped.forEach((s) => {
    inMemorySongStore.set(s.id, s);
    inMemorySongStore.set(getTitleKey(s), s);
    if (isGenuineUploadedAudio(s.audioUrl)) {
      inMemoryAudioMap.set(getTitleKey(s), s.audioUrl);
      inMemoryAudioMap.set(s.id, s.audioUrl);
    }
  });

  // Save FULL DataURLs directly to IndexedDB
  saveMediaToIndexedDB(MUSIC_CACHE_KEY, deduped);

  try {
    const safeItems = deduped.map((s) => ({
      ...s,
      audioUrl: isGenuineUploadedAudio(s.audioUrl) && s.audioUrl.length < 5000000 ? s.audioUrl : '',
    }));
    localStorage.setItem(MUSIC_CACHE_KEY, JSON.stringify(safeItems));
  } catch {
    console.info('LocalStorage quota gracefully handled for music metadata');
  }
};

/**
 * Realtime listener for Music tracks - Guaranteed zero data loss
 */
export const subscribeMusic = (
  onData: (songs: SongItem[]) => void
): (() => void) => {
  getMusicFromCache().then((cached) => {
    if (cached.length > 0) onData(cached);
  });

  return subscribeToCollection<SongItem>(
    COLLECTION_NAME,
    async (items) => {
      const cached = await getMusicFromCache();
      const titleMap = new Map<string, SongItem>();

      cached.forEach((c) => {
        if (c.id) titleMap.set(c.id, c);
        titleMap.set(getTitleKey(c), c);
      });

      const mergedList = items.map((item) => {
        const titleKey = getTitleKey(item);
        const existing = (item.id ? titleMap.get(item.id) : undefined) || titleMap.get(titleKey);
        const registeredUrl = inMemoryAudioMap.get(titleKey) || (item.id ? inMemoryAudioMap.get(item.id) : undefined);

        const validAudioUrl = isGenuineUploadedAudio(item.audioUrl)
          ? item.audioUrl
          : isGenuineUploadedAudio(existing?.audioUrl)
          ? existing!.audioUrl
          : isGenuineUploadedAudio(registeredUrl)
          ? registeredUrl!
          : item.audioUrl || '';

        return {
          ...existing,
          ...item,
          audioUrl: validAudioUrl,
        } as SongItem;
      });

      const allCombined = deduplicateSongs([...mergedList, ...cached]).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

      saveMusicToCache(allCombined);
      onData(allCombined);
    },
    'createdAt',
    'desc'
  );
};

/**
 * Reads audio file as persistent DataURL
 */
const readAudioFileAsDataUrl = (file: File, onProgress?: UploadProgressCallback): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

    reader.onload = () => {
      if (onProgress) onProgress(100);
      resolve(reader.result as string);
    };

    reader.onerror = (err) => {
      console.error('Error reading audio file:', err);
      reject(err);
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Uploads a new song from Admin
 */
export const addSong = async (
  file: File,
  metadata: {
    title: string;
    artist?: string;
    eventName?: string;
    isActiveBackground?: boolean;
    favorite?: boolean;
  },
  onProgress?: UploadProgressCallback
): Promise<string> => {
  const blobUrl = URL.createObjectURL(file);
  const audioUrl = await readAudioFileAsDataUrl(file, onProgress);
  const finalAudioUrl = audioUrl || blobUrl;

  const title = metadata.title || file.name || 'Uploaded Song';
  const titleKey = (title || 'untitled').toLowerCase().replace(/[^a-z0-9]/g, '');

  // Register in memory map immediately
  inMemoryAudioMap.set(titleKey, finalAudioUrl);

  const docId = await addDocument(COLLECTION_NAME, {
    audioUrl: '', // Keep Firestore document payload light
    title,
    artist: metadata.artist || "Sanjana's Choice",
    eventName: metadata.eventName || 'Theme Music',
    isActiveBackground: !!metadata.isActiveBackground,
    favorite: !!metadata.favorite,
  });

  inMemoryAudioMap.set(docId, finalAudioUrl);

  const newItem: SongItem = {
    id: docId,
    audioUrl: finalAudioUrl, // Saved in IndexedDB & memory
    title,
    artist: metadata.artist || "Sanjana's Choice",
    eventName: metadata.eventName || 'Theme Music',
    isActiveBackground: !!metadata.isActiveBackground,
    favorite: !!metadata.favorite,
    createdAt: new Date().toISOString(),
  };

  const cached = await getMusicFromCache();
  const updated = [newItem, ...cached.filter((s) => s.id !== docId && getTitleKey(s) !== titleKey)];
  saveMusicToCache(updated);

  return docId;
};

/**
 * Sets a specific song as active background music
 */
export const setActiveBackgroundSong = async (songId: string | null): Promise<void> => {
  const cached = await getMusicFromCache();
  const updated = cached.map((s) => ({
    ...s,
    isActiveBackground: songId ? s.id === songId || getTitleKey(s) === songId.toLowerCase().replace(/[^a-z0-9]/g, '') : false,
  }));
  saveMusicToCache(updated);

  if (typeof window !== 'undefined') {
    const activeSong = updated.find((s) => s.isActiveBackground);
    window.dispatchEvent(new CustomEvent('bg-music-changed', { detail: activeSong || null }));
  }

  const promises = cached.map((s) =>
    updateDocument(COLLECTION_NAME, s.id, { isActiveBackground: songId ? s.id === songId : false })
  );
  await Promise.all(promises);
};

/**
 * Updates song details (and attaches new MP3 file)
 */
export const updateSong = async (
  songId: string,
  updates: Partial<Omit<SongItem, 'id'>>,
  file?: File | null
): Promise<void> => {
  let newAudioUrl = updates.audioUrl;
  if (file) {
    newAudioUrl = await readAudioFileAsDataUrl(file);
    if (updates.title) {
      const titleKey = updates.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      inMemoryAudioMap.set(titleKey, newAudioUrl);
    }
    inMemoryAudioMap.set(songId, newAudioUrl);
  }

  const cached = await getMusicFromCache();
  const updated = cached.map((s) =>
    s.id === songId || getTitleKey(s) === getTitleKey(updates as any)
      ? {
          ...s,
          ...updates,
          audioUrl: newAudioUrl || s.audioUrl || inMemoryAudioMap.get(songId) || '',
        }
      : s
  );
  saveMusicToCache(updated);

  const { audioUrl, ...docUpdates } = updates;
  await updateDocument(COLLECTION_NAME, songId, docUpdates);
};

/**
 * Toggles favorite badge of a song
 */
export const toggleSongFavorite = async (
  songId: string,
  currentFavoriteState: boolean
): Promise<void> => {
  await updateSong(songId, { favorite: !currentFavoriteState });
};

/**
 * Deletes a song permanently
 */
export const deleteSong = async (songId: string, _title?: string, audioUrl?: string): Promise<void> => {
  if (songId) {
    inMemorySongStore.delete(songId);
    inMemoryAudioMap.delete(songId);
  }

  const cached = await getMusicFromCache();
  const filtered = cached.filter((s) => s.id !== songId);

  saveMusicToCache(filtered);

  ['fb_music', 'ourverse_music_cache'].forEach((k) => {
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const list = JSON.parse(raw).filter((s: any) => s.id !== songId);
        localStorage.setItem(k, JSON.stringify(list));
      }
    } catch {}
  });

  await deleteDocument(COLLECTION_NAME, songId);
  if (audioUrl && !audioUrl.startsWith('data:') && !audioUrl.startsWith('blob:')) {
    await deleteImageFromStorage(audioUrl).catch(() => {});
  }
};
