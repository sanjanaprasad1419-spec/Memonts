import {
  subscribeToCollection,
  addDocument,
  updateDocument,
  deleteDocument,
  type BaseDoc,
} from '../firebase/firestore';
import { uploadImageToStorage, deleteImageFromStorage, type UploadProgressCallback } from '../firebase/storage';
import { saveMediaToIndexedDB, getMediaFromIndexedDB } from '../utils/mediaStore';

export interface BackgroundPhoto extends BaseDoc {
  imageUrl: string;
  caption: string;
  memoryDate: string;
  favorite: boolean;
}

export type WelcomeBackgroundPhoto = BackgroundPhoto;

const COLLECTION_NAME = 'welcomeBackground';
const STORAGE_FOLDER = 'backgrounds';
const BG_CACHE_KEY = 'fb_welcomeBackground';

const inMemoryBgStore = new Map<string, BackgroundPhoto>();

/**
 * Reads persistent welcome background photos safely
 */
const getBackgroundPhotosFromCache = async (): Promise<BackgroundPhoto[]> => {
  const idbItems = await getMediaFromIndexedDB<BackgroundPhoto[]>(BG_CACHE_KEY);
  if (idbItems && Array.isArray(idbItems) && idbItems.length > 0) {
    idbItems.forEach((p) => {
      if (p.imageUrl && p.imageUrl.trim().length > 0) {
        inMemoryBgStore.set(p.imageUrl, p);
      }
    });
    return Array.from(inMemoryBgStore.values());
  }

  const raw = localStorage.getItem(BG_CACHE_KEY);
  if (!raw) return Array.from(inMemoryBgStore.values());
  try {
    const parsed = JSON.parse(raw);
    const valid = Array.isArray(parsed) ? parsed.filter((p) => p && p.imageUrl && p.imageUrl.trim().length > 0) : [];
    valid.forEach((p) => inMemoryBgStore.set(p.imageUrl, p));
    return Array.from(inMemoryBgStore.values());
  } catch {
    return Array.from(inMemoryBgStore.values());
  }
};

const saveBackgroundPhotosToCache = (photos: BackgroundPhoto[]) => {
  const map = new Map<string, BackgroundPhoto>();
  photos.forEach((p) => {
    if (p && p.imageUrl && p.imageUrl.trim().length > 0) {
      map.set(p.imageUrl, p); // Deduplicate by imageUrl
    }
  });

  const unique = Array.from(map.values());
  inMemoryBgStore.clear();
  unique.forEach((p) => inMemoryBgStore.set(p.imageUrl, p));

  saveMediaToIndexedDB(BG_CACHE_KEY, unique);
  try {
    localStorage.setItem(BG_CACHE_KEY, JSON.stringify(unique));
  } catch {}
};

/**
 * Realtime listener for Welcome Background photos with zero duplicates
 */
export const subscribeBackgroundPhotos = (
  onData: (photos: BackgroundPhoto[]) => void
): (() => void) => {
  getBackgroundPhotosFromCache().then((cached) => {
    if (cached.length > 0) onData(cached);
  });

  return subscribeToCollection<BackgroundPhoto>(
    COLLECTION_NAME,
    (items) => {
      const map = new Map<string, BackgroundPhoto>();

      inMemoryBgStore.forEach((p, url) => map.set(url, p));

      items.forEach((p) => {
        if (p && p.imageUrl && p.imageUrl.trim().length > 0) {
          map.set(p.imageUrl, p);
        }
      });

      const uniquePhotos = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      saveBackgroundPhotosToCache(uniquePhotos);
      onData(uniquePhotos);
    },
    'createdAt',
    'desc'
  );
};

export const subscribeWelcomeBackgrounds = subscribeBackgroundPhotos;

/**
 * Uploads a new Welcome Background photo without duplicate entries
 */
export const addBackgroundPhoto = async (
  file: File,
  metadata: { caption?: string; memoryDate?: string; favorite?: boolean },
  onProgress?: UploadProgressCallback
): Promise<string> => {
  const imageUrl = await uploadImageToStorage(file, STORAGE_FOLDER, onProgress);

  const docId = await addDocument(COLLECTION_NAME, {
    imageUrl,
    caption: metadata.caption || 'Background Memory',
    memoryDate: metadata.memoryDate || new Date().toISOString().split('T')[0],
    favorite: !!metadata.favorite,
  });

  const newItem: BackgroundPhoto = {
    id: docId,
    imageUrl,
    caption: metadata.caption || 'Background Memory',
    memoryDate: metadata.memoryDate || new Date().toISOString().split('T')[0],
    favorite: !!metadata.favorite,
    createdAt: new Date().toISOString(),
  };

  const cached = await getBackgroundPhotosFromCache();
  const filtered = cached.filter((p) => p.id !== docId && p.imageUrl !== imageUrl);
  saveBackgroundPhotosToCache([newItem, ...filtered]);

  return docId;
};

export const addWelcomeBackground = async (
  file: File,
  _displayOrder: number = 0
): Promise<string> => {
  return addBackgroundPhoto(file, { caption: 'Welcome Background' });
};

export const replaceWelcomeBackground = async (
  oldId: string,
  oldImageUrl: string,
  newFile: File
): Promise<string> => {
  await deleteBackgroundPhoto(oldId, oldImageUrl);
  return addWelcomeBackground(newFile);
};

/**
 * Updates a Welcome Background photo's metadata
 */
export const updateBackgroundPhoto = async (
  photoId: string,
  updates: Partial<Omit<BackgroundPhoto, 'id' | 'imageUrl'>>
): Promise<void> => {
  const cached = await getBackgroundPhotosFromCache();
  const updated = cached.map((p) => (p.id === photoId ? { ...p, ...updates } : p));
  saveBackgroundPhotosToCache(updated);

  await updateDocument(COLLECTION_NAME, photoId, updates);
};

/**
 * Toggles favorite status of a Welcome Background photo
 */
export const toggleBackgroundFavorite = async (
  photoId: string,
  currentFavoriteState: boolean
): Promise<void> => {
  await updateBackgroundPhoto(photoId, { favorite: !currentFavoriteState });
};

/**
 * Deletes a Welcome Background photo permanently (removes from Firestore, IndexedDB, & local cache)
 */
export const deleteBackgroundPhoto = async (photoId: string, imageUrl: string): Promise<void> => {
  if (imageUrl) inMemoryBgStore.delete(imageUrl);

  const cached = await getBackgroundPhotosFromCache();
  const filtered = cached.filter((p) => p.id !== photoId && p.imageUrl !== imageUrl);
  saveBackgroundPhotosToCache(filtered);

  ['fb_welcomeBackground', 'welcomeBackground'].forEach((k) => {
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const list = JSON.parse(raw).filter((p: any) => p.id !== photoId && p.imageUrl !== imageUrl);
        localStorage.setItem(k, JSON.stringify(list));
      }
    } catch {}
  });

  await deleteDocument(COLLECTION_NAME, photoId);
  await deleteImageFromStorage(imageUrl);
};

export const deleteWelcomeBackground = deleteBackgroundPhoto;
