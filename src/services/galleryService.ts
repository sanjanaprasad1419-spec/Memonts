import {
  subscribeToCollection,
  addDocument,
  updateDocument,
  deleteDocument,
  type BaseDoc,
} from '../firebase/firestore';
import { uploadImageToStorage, deleteImageFromStorage, type UploadProgressCallback } from '../firebase/storage';
import { saveMediaToIndexedDB, getMediaFromIndexedDB } from '../utils/mediaStore';

export interface GalleryPhoto extends BaseDoc {
  imageUrl: string;
  caption: string;
  memoryDate: string;
  favorite: boolean;
}

const COLLECTION_NAME = 'galleryPhotos';
const STORAGE_FOLDER = 'gallery';
const GALLERY_CACHE_KEY = 'fb_galleryPhotos';

const inMemoryGalleryStore = new Map<string, GalleryPhoto>();

/**
 * Reads persistent photos specifically for Constellation Gallery
 */
const getGalleryPhotosFromCache = async (): Promise<GalleryPhoto[]> => {
  const idbItems = await getMediaFromIndexedDB<GalleryPhoto[]>(GALLERY_CACHE_KEY);
  if (idbItems && Array.isArray(idbItems) && idbItems.length > 0) {
    idbItems.forEach((p) => {
      if (p.imageUrl && p.imageUrl.trim().length > 0) {
        inMemoryGalleryStore.set(p.imageUrl, p);
      }
    });
    return Array.from(inMemoryGalleryStore.values());
  }

  const raw = localStorage.getItem(GALLERY_CACHE_KEY);
  if (!raw) return Array.from(inMemoryGalleryStore.values());
  try {
    const parsed = JSON.parse(raw);
    const valid = Array.isArray(parsed) ? parsed.filter((p) => p && p.imageUrl && p.imageUrl.trim().length > 0) : [];
    valid.forEach((p) => inMemoryGalleryStore.set(p.imageUrl, p));
    return Array.from(inMemoryGalleryStore.values());
  } catch {
    return Array.from(inMemoryGalleryStore.values());
  }
};

const saveGalleryPhotosToCache = (photos: GalleryPhoto[]) => {
  const map = new Map<string, GalleryPhoto>();
  photos.forEach((p) => {
    if (p && p.imageUrl && p.imageUrl.trim().length > 0) {
      map.set(p.imageUrl, p); // Deduplicate strictly by imageUrl
    }
  });

  const unique = Array.from(map.values());
  inMemoryGalleryStore.clear();
  unique.forEach((p) => inMemoryGalleryStore.set(p.imageUrl, p));

  saveMediaToIndexedDB(GALLERY_CACHE_KEY, unique);
  try {
    localStorage.setItem(GALLERY_CACHE_KEY, JSON.stringify(unique));
  } catch {}
};

/**
 * Realtime listener for Constellation Gallery photos with zero duplicates
 */
export const subscribeGalleryPhotos = (
  onData: (photos: GalleryPhoto[]) => void
): (() => void) => {
  getGalleryPhotosFromCache().then((cached) => {
    if (cached.length > 0) onData(cached);
  });

  return subscribeToCollection<GalleryPhoto>(
    COLLECTION_NAME,
    (items) => {
      const map = new Map<string, GalleryPhoto>();

      // Add cached items first
      inMemoryGalleryStore.forEach((p, url) => map.set(url, p));

      // Override with incoming Firestore items
      items.forEach((p) => {
        if (p && p.imageUrl && p.imageUrl.trim().length > 0) {
          map.set(p.imageUrl, p);
        }
      });

      const uniquePhotos = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      saveGalleryPhotosToCache(uniquePhotos);
      onData(uniquePhotos);
    },
    'createdAt',
    'desc'
  );
};

/**
 * Uploads a new Constellation Gallery photo without duplicate entries
 */
export const addGalleryPhoto = async (
  file: File,
  metadata: { caption: string; memoryDate: string; favorite?: boolean },
  onProgress?: UploadProgressCallback
): Promise<string> => {
  const imageUrl = await uploadImageToStorage(file, STORAGE_FOLDER, onProgress);
  const docId = await addDocument(COLLECTION_NAME, {
    imageUrl,
    caption: metadata.caption || 'Cherished Memory',
    memoryDate: metadata.memoryDate || new Date().toISOString().split('T')[0],
    favorite: !!metadata.favorite,
  });

  const newItem: GalleryPhoto = {
    id: docId,
    imageUrl,
    caption: metadata.caption || 'Cherished Memory',
    memoryDate: metadata.memoryDate || new Date().toISOString().split('T')[0],
    favorite: !!metadata.favorite,
    createdAt: new Date().toISOString(),
  };

  const cached = await getGalleryPhotosFromCache();
  const filtered = cached.filter((p) => p.id !== docId && p.imageUrl !== imageUrl);
  saveGalleryPhotosToCache([newItem, ...filtered]);

  return docId;
};

/**
 * Updates a Constellation Gallery photo's metadata
 */
export const updateGalleryPhoto = async (
  photoId: string,
  updates: Partial<Omit<GalleryPhoto, 'id' | 'imageUrl'>>
): Promise<void> => {
  const cached = await getGalleryPhotosFromCache();
  const updated = cached.map((p) => (p.id === photoId ? { ...p, ...updates } : p));
  saveGalleryPhotosToCache(updated);

  await updateDocument(COLLECTION_NAME, photoId, updates);
};

/**
 * Toggles favorite status of a Constellation Gallery photo
 */
export const toggleGalleryFavorite = async (
  photoId: string,
  currentFavoriteState: boolean
): Promise<void> => {
  await updateGalleryPhoto(photoId, { favorite: !currentFavoriteState });
};

/**
 * Deletes a Constellation Gallery photo permanently (removes from Firestore, IndexedDB, & local cache)
 */
export const deleteGalleryPhoto = async (photoId: string, imageUrl: string): Promise<void> => {
  // Purge from in-memory store
  if (imageUrl) inMemoryGalleryStore.delete(imageUrl);

  const cached = await getGalleryPhotosFromCache();
  const filtered = cached.filter((p) => p.id !== photoId && p.imageUrl !== imageUrl);
  saveGalleryPhotosToCache(filtered);

  // Clean legacy keys
  ['ourverse_photos_cache', 'fb_photos', 'fb_galleryPhotos'].forEach((k) => {
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
