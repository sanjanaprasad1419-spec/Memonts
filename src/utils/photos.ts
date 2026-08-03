import { StorageService } from '../services/storage.service';

export interface PhotoMemory {
  id: string;
  imageUrl: string;
  caption: string;
  memoryDate: string;
  createdAt?: number | null;
  updatedAt?: number | null;
}

const LOCAL_PHOTOS_KEY = 'sb_photos_cache';

const getLocalPhotos = (): PhotoMemory[] => {
  try {
    const stored = localStorage.getItem(LOCAL_PHOTOS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLocalPhotos = (photos: PhotoMemory[]) => {
  try {
    localStorage.setItem(LOCAL_PHOTOS_KEY, JSON.stringify(photos));
  } catch (err) {
    console.warn('LocalStorage save warning:', err);
  }
};

/**
 * Fetch photos from Supabase Storage 'memories/gallery'
 */
export const fetchPhotos = async (): Promise<PhotoMemory[]> => {
  const res = await StorageService.listFiles('gallery');

  if (res.success && res.data) {
    const local = getLocalPhotos();
    const localMap = new Map<string, PhotoMemory>();
    local.forEach((p) => localMap.set(p.id, p));

    const photos: PhotoMemory[] = res.data.map((file) => {
      const existing = localMap.get(file.path) || localMap.get(file.publicUrl);
      return {
        id: file.path,
        imageUrl: file.publicUrl,
        caption: existing?.caption || file.name.replace(/^\d+_/, '').replace(/\.[^/.]+$/, ''),
        memoryDate: existing?.memoryDate || new Date().toISOString().split('T')[0],
        createdAt: file.created_at ? new Date(file.created_at).getTime() : Date.now(),
        updatedAt: Date.now(),
      };
    });

    saveLocalPhotos(photos);
    return photos;
  }

  return getLocalPhotos();
};

/**
 * Upload photo memory exclusively via Supabase Storage
 */
export const uploadPhoto = async (
  file: File,
  caption: string,
  memoryDate: string
): Promise<PhotoMemory> => {
  const uploadRes = await StorageService.uploadFile({
    folder: 'gallery',
    file,
  });

  if (!uploadRes.success || !uploadRes.data) {
    throw new Error(uploadRes.error || 'Failed to upload photo to Supabase Storage');
  }

  const publicUrl = uploadRes.data.publicUrl;
  const storagePath = uploadRes.data.path;

  console.log(`[DEBUG photos.ts Upload Completed] Supabase Storage Public CDN URL: "${publicUrl}"`);

  const newPhoto: PhotoMemory = {
    id: storagePath,
    imageUrl: publicUrl,
    caption,
    memoryDate,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const existingLocal = getLocalPhotos();
  const updatedLocal = [newPhoto, ...existingLocal.filter((p) => p.id !== storagePath)];
  saveLocalPhotos(updatedLocal);

  return newPhoto;
};

export const updatePhoto = async (
  id: string,
  caption: string,
  memoryDate: string
): Promise<void> => {
  const localPhotos = getLocalPhotos();
  const updated = localPhotos.map((p) =>
    p.id === id ? { ...p, caption, memoryDate, updatedAt: Date.now() } : p
  );
  saveLocalPhotos(updated);
};

export const deletePhoto = async (id: string, imageUrl: string): Promise<void> => {
  const localPhotos = getLocalPhotos();
  const filtered = localPhotos.filter((p) => p.id !== id && p.imageUrl !== imageUrl);
  saveLocalPhotos(filtered);

  if (id.startsWith('gallery/')) {
    await StorageService.deleteFile(id);
  }
};
