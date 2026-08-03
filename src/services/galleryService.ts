import { StorageService, type UploadProgressCallback } from './storage.service';
import { getSystemManifest, saveSystemManifest } from './supabaseSync.service';

export interface GalleryPhoto {
  id: string;
  imageUrl: string;
  caption: string;
  memoryDate: string;
  favorite: boolean;
  createdAt?: string;
  path?: string;
}

const STORAGE_FOLDER = 'gallery' as const;
const subscribers = new Set<(photos: GalleryPhoto[]) => void>();

const notifySubscribers = (photos: GalleryPhoto[]) => {
  console.log(`[DEBUG Gallery Refresh] Distributing ${photos.length} photos. Provider: Supabase Storage CDN.`);
  subscribers.forEach((cb) => {
    try {
      cb(photos);
    } catch (e) {
      console.error('[DEBUG Gallery Refresh Error]', e);
    }
  });
};

export const fetchGalleryPhotosFromSupabase = async (): Promise<GalleryPhoto[]> => {
  console.log('[DEBUG Fetch Request Started] Querying Supabase Storage bucket "memories" folder "gallery"...');
  
  const manifest = await getSystemManifest();
  const manifestMap = new Map<string, GalleryPhoto>();
  manifest.galleryPhotos.forEach((item) => {
    if (item.path) manifestMap.set(item.path, item);
    if (item.imageUrl) manifestMap.set(item.imageUrl, item);
  });

  const res = await StorageService.listFiles(STORAGE_FOLDER);

  if (!res.success || !res.data) {
    console.warn('[DEBUG Fetch Notice] Could not list storage objects, returning manifest gallery photos.');
    return manifest.galleryPhotos.filter((p) => !p.imageUrl?.match(/\.(mp4|webm|ogg|mov|m4v|avi|mkv)(\?.*)?$/i));
  }

  const imageFiles = res.data.filter((f) => !f.name.match(/\.(mp4|webm|ogg|mov|m4v|avi|mkv)$/i));

  const photos: GalleryPhoto[] = imageFiles.map((file) => {
    const existing = manifestMap.get(file.path) || manifestMap.get(file.publicUrl);
    const dateStr = file.created_at
      ? new Date(file.created_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    return {
      id: file.id || file.path,
      path: file.path,
      imageUrl: file.publicUrl,
      caption: existing?.caption || file.name.replace(/^\d+_/, '').replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
      memoryDate: existing?.memoryDate || dateStr,
      favorite: existing?.favorite || false,
      createdAt: file.created_at || new Date().toISOString(),
    };
  });

  photos.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  
  if (JSON.stringify(photos) !== JSON.stringify(manifest.galleryPhotos)) {
    saveSystemManifest({ ...manifest, galleryPhotos: photos });
  }

  return photos;
};

export const subscribeGalleryPhotos = (
  onData: (photos: GalleryPhoto[]) => void
): (() => void) => {
  subscribers.add(onData);

  fetchGalleryPhotosFromSupabase().then((items) => {
    notifySubscribers(items);
  });

  return () => {
    subscribers.delete(onData);
  };
};

export const addGalleryPhoto = async (
  file: File,
  metadata: { caption: string; memoryDate: string; favorite?: boolean },
  onProgress?: UploadProgressCallback
): Promise<string> => {
  console.log(`[DEBUG Upload Started] File: "${file.name}" (${file.size} bytes), Folder: "gallery", Provider: Supabase Storage`);

  if (onProgress) onProgress(30);

  const uploadResult = await StorageService.uploadFile({
    folder: STORAGE_FOLDER,
    file,
  });

  if (!uploadResult.success || !uploadResult.data) {
    const errMsg = uploadResult.error || 'Upload to Supabase Storage failed';
    console.error('[DEBUG Upload Failed]', errMsg);
    throw new Error(errMsg);
  }

  if (onProgress) onProgress(90);

  const storagePath = uploadResult.data.path;
  const publicUrl = uploadResult.data.publicUrl;

  console.log(`[DEBUG Upload Completed] Provider: Supabase Storage, Storage Path: "${storagePath}", Generated CDN Public URL: "${publicUrl}"`);

  const newItem: GalleryPhoto = {
    id: storagePath,
    path: storagePath,
    imageUrl: publicUrl,
    caption: metadata.caption || 'Cherished Memory',
    memoryDate: metadata.memoryDate || new Date().toISOString().split('T')[0],
    favorite: !!metadata.favorite,
    createdAt: new Date().toISOString(),
  };

  const manifest = await getSystemManifest();
  const updatedPhotos = [newItem, ...manifest.galleryPhotos.filter((p) => p.path !== storagePath && p.imageUrl !== publicUrl)];
  await saveSystemManifest({ ...manifest, galleryPhotos: updatedPhotos });

  if (onProgress) onProgress(100);

  notifySubscribers(updatedPhotos);
  return newItem.id;
};

export const updateGalleryPhoto = async (
  photoId: string,
  updates: Partial<Omit<GalleryPhoto, 'id' | 'imageUrl'>>
): Promise<void> => {
  const manifest = await getSystemManifest();
  const updatedPhotos = manifest.galleryPhotos.map((p) => (p.id === photoId || p.path === photoId ? { ...p, ...updates } : p));
  await saveSystemManifest({ ...manifest, galleryPhotos: updatedPhotos });
  notifySubscribers(updatedPhotos);
};

export const toggleGalleryFavorite = async (
  photoId: string,
  currentFavoriteState: boolean
): Promise<void> => {
  await updateGalleryPhoto(photoId, { favorite: !currentFavoriteState });
};

export const deleteGalleryPhoto = async (photoId: string, imageUrl: string): Promise<void> => {
  console.log(`[DEBUG Delete Request Started] Photo ID: "${photoId}", Image URL: "${imageUrl}"`);

  const manifest = await getSystemManifest();
  const target = manifest.galleryPhotos.find((p) => p.id === photoId || p.imageUrl === imageUrl);
  const storagePath = target?.path || photoId;

  if (storagePath && storagePath.startsWith('gallery/')) {
    console.log(`[DEBUG Storage Delete Started] Provider: Supabase Storage, Path: "${storagePath}"`);
    const delRes = await StorageService.deleteFile(storagePath);
    if (delRes.success) {
      console.log(`[DEBUG Storage Delete Completed] Successfully removed "${storagePath}" from Supabase Storage memories bucket.`);
    } else {
      console.warn(`[DEBUG Storage Delete Warning] ${delRes.error}`);
    }
  }

  const updatedPhotos = manifest.galleryPhotos.filter((p) => p.id !== photoId && p.imageUrl !== imageUrl && p.path !== storagePath);
  await saveSystemManifest({ ...manifest, galleryPhotos: updatedPhotos });
  notifySubscribers(updatedPhotos);
};
