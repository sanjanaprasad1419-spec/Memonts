import {
  subscribeToCollection,
  addDocument,
  updateDocument,
  deleteDocument,
  type BaseDoc,
} from '../firebase/firestore';
import { deleteImageFromStorage, type UploadProgressCallback } from '../firebase/storage';
import { saveMediaToIndexedDB, getMediaFromIndexedDB } from '../utils/mediaStore';

export interface VideoItem extends BaseDoc {
  videoUrl: string;
  title: string;
  eventName: string;
  videoDate: string;
  description?: string;
  favorite?: boolean;
}

const COLLECTION_NAME = 'videos';
const VIDEOS_CACHE_KEY = 'fb_videos';

const inMemoryVideoStore = new Map<string, VideoItem>();

/**
 * Reads video file as DataURL for persistent IndexedDB storage
 */
const readVideoFileAsDataUrl = (file: File, onProgress?: UploadProgressCallback): Promise<string> => {
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
      console.error('Error reading video file:', err);
      reject(err);
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Deduplicates video items strictly by title and valid videoUrl
 */
const deduplicateVideos = (items: VideoItem[]): VideoItem[] => {
  const map = new Map<string, VideoItem>();

  items.forEach((item) => {
    if (!item) return;
    const titleKey = (item.title || 'untitled').toLowerCase().trim();
    const existing = map.get(titleKey);

    if (!existing) {
      if (item.videoUrl && item.videoUrl.trim().length > 10) {
        map.set(titleKey, item);
      }
    } else {
      if ((!existing.videoUrl || existing.videoUrl.length < 20) && item.videoUrl && item.videoUrl.length >= 20) {
        map.set(titleKey, item);
      }
    }
  });

  return Array.from(map.values());
};

/**
 * Reads persistent video items safely from IndexedDB
 */
export const getVideosFromCache = async (): Promise<VideoItem[]> => {
  const idbItems = await getMediaFromIndexedDB<VideoItem[]>(VIDEOS_CACHE_KEY);
  if (idbItems && Array.isArray(idbItems) && idbItems.length > 0) {
    const deduped = deduplicateVideos(idbItems);
    deduped.forEach((v) => inMemoryVideoStore.set((v.title || v.id).toLowerCase().trim(), v));
    return deduped;
  }

  const raw = localStorage.getItem(VIDEOS_CACHE_KEY);
  if (!raw) return Array.from(inMemoryVideoStore.values());
  try {
    const parsed = JSON.parse(raw);
    const valid = Array.isArray(parsed) ? parsed.filter((v) => v && v.videoUrl && v.videoUrl.length > 10) : [];
    const deduped = deduplicateVideos(valid);
    deduped.forEach((v) => inMemoryVideoStore.set((v.title || v.id).toLowerCase().trim(), v));
    return deduped;
  } catch {
    return Array.from(inMemoryVideoStore.values());
  }
};

const saveVideosToCache = (items: VideoItem[]) => {
  const deduped = deduplicateVideos(items);
  inMemoryVideoStore.clear();
  deduped.forEach((v) => inMemoryVideoStore.set((v.title || v.id).toLowerCase().trim(), v));

  // Save FULL DataURLs to IndexedDB
  saveMediaToIndexedDB(VIDEOS_CACHE_KEY, deduped);

  try {
    // LocalStorage backup metadata
    const metaOnly = deduped.map((v) => ({
      ...v,
      videoUrl: v.videoUrl && v.videoUrl.length > 200000 ? '' : v.videoUrl,
    }));
    localStorage.setItem(VIDEOS_CACHE_KEY, JSON.stringify(metaOnly));
  } catch {}
};

/**
 * Realtime listener for Videos with zero duplicates
 */
export const subscribeVideos = (
  onData: (videos: VideoItem[]) => void
): (() => void) => {
  getVideosFromCache().then((cached) => {
    if (cached.length > 0) onData(cached);
  });

  return subscribeToCollection<VideoItem>(
    COLLECTION_NAME,
    async (items) => {
      const cached = await getVideosFromCache();
      const combined = deduplicateVideos([...cached, ...items]).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

      saveVideosToCache(combined);
      onData(combined);
    },
    'createdAt',
    'desc'
  );
};

/**
 * Uploads a new video file as a persistent DataURL in IndexedDB
 */
export const addVideo = async (
  file: File,
  metadata: {
    title: string;
    eventName: string;
    videoDate?: string;
    description?: string;
    favorite?: boolean;
  },
  onProgress?: UploadProgressCallback
): Promise<string> => {
  const videoUrl = await readVideoFileAsDataUrl(file, onProgress);
  const title = metadata.title || file.name || 'Moments in Motion Video';

  const docId = await addDocument(COLLECTION_NAME, {
    videoUrl: videoUrl.length > 200000 ? '' : videoUrl, // Firestore safe payload
    title,
    eventName: metadata.eventName || 'Special Event',
    videoDate: metadata.videoDate || new Date().toISOString().split('T')[0],
    description: metadata.description || '',
    favorite: !!metadata.favorite,
  });

  const newItem: VideoItem = {
    id: docId,
    videoUrl,
    title,
    eventName: metadata.eventName || 'Special Event',
    videoDate: metadata.videoDate || new Date().toISOString().split('T')[0],
    description: metadata.description || '',
    favorite: !!metadata.favorite,
    createdAt: new Date().toISOString(),
  };

  const cached = await getVideosFromCache();
  const filtered = cached.filter((v) => v.title.toLowerCase().trim() !== title.toLowerCase().trim());
  const updated = [newItem, ...filtered];
  saveVideosToCache(updated);

  return docId;
};

/**
 * Updates video metadata
 */
export const updateVideo = async (
  videoId: string,
  updates: Partial<Omit<VideoItem, 'id' | 'videoUrl'>>
): Promise<void> => {
  const cached = await getVideosFromCache();
  const updated = cached.map((v) => (v.id === videoId ? { ...v, ...updates } : v));
  saveVideosToCache(updated);

  await updateDocument(COLLECTION_NAME, videoId, updates);
};

/**
 * Toggles favorite badge of a video
 */
export const toggleVideoFavorite = async (
  videoId: string,
  currentFavoriteState: boolean
): Promise<void> => {
  await updateVideo(videoId, { favorite: !currentFavoriteState });
};

/**
 * Deletes a video permanently
 */
export const deleteVideo = async (videoId: string, title?: string, videoUrl?: string): Promise<void> => {
  const titleKey = title ? title.toLowerCase().trim() : '';

  if (titleKey) inMemoryVideoStore.delete(titleKey);

  const cached = await getVideosFromCache();
  const filtered = cached.filter((v) => {
    const matchesId = v.id === videoId;
    const matchesTitle = titleKey && v.title.toLowerCase().trim() === titleKey;
    const matchesUrl = videoUrl && v.videoUrl === videoUrl;
    return !matchesId && !matchesTitle && !matchesUrl;
  });

  saveVideosToCache(filtered);

  ['fb_videos', 'ourverse_videos_cache'].forEach((k) => {
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const list = JSON.parse(raw).filter((v: any) => v.id !== videoId && (!titleKey || v.title?.toLowerCase()?.trim() !== titleKey));
        localStorage.setItem(k, JSON.stringify(list));
      }
    } catch {}
  });

  await deleteDocument(COLLECTION_NAME, videoId);
  if (videoUrl && !videoUrl.startsWith('data:') && !videoUrl.startsWith('blob:')) {
    await deleteImageFromStorage(videoUrl).catch(() => {});
  }
};
