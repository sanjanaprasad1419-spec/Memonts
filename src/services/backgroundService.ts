import { StorageService, type UploadProgressCallback } from './storage.service';
import { getSystemManifest, saveSystemManifest } from './supabaseSync.service';

export interface BackgroundPhoto {
  id: string;
  imageUrl: string;
  caption: string;
  memoryDate: string;
  favorite: boolean;
  createdAt?: string;
  path?: string;
}

export type WelcomeBackgroundPhoto = BackgroundPhoto;

const STORAGE_FOLDER = 'welcome-background' as const;
const subscribers = new Set<(photos: BackgroundPhoto[]) => void>();

const notifySubscribers = (photos: BackgroundPhoto[]) => {
  console.log(`[DEBUG Background Refresh] Distributing ${photos.length} background photos. Provider: Supabase Storage CDN.`);
  subscribers.forEach((cb) => {
    try {
      cb(photos);
    } catch (e) {
      console.error('[DEBUG Background Refresh Error]', e);
    }
  });
};

export const fetchBackgroundPhotosFromSupabase = async (): Promise<BackgroundPhoto[]> => {
  console.log('[DEBUG Fetch Request Started] Querying Supabase Storage bucket "memories" folder "welcome-background"...');

  const manifest = await getSystemManifest();
  const manifestMap = new Map<string, BackgroundPhoto>();
  manifest.welcomeBackgrounds.forEach((item) => {
    if (item.path) manifestMap.set(item.path, item);
    if (item.imageUrl) manifestMap.set(item.imageUrl, item);
  });

  const res = await StorageService.listFiles(STORAGE_FOLDER);

  if (!res.success || !res.data) {
    return manifest.welcomeBackgrounds;
  }

  console.log(`[DEBUG Fetch Completed] Found ${res.data.length} storage object(s) in memories/welcome-background.`);

  const photos: BackgroundPhoto[] = res.data.map((file) => {
    const existing = manifestMap.get(file.path) || manifestMap.get(file.publicUrl);
    const dateStr = file.created_at
      ? new Date(file.created_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    return {
      id: file.id || file.path,
      path: file.path,
      imageUrl: file.publicUrl,
      caption: existing?.caption || 'Welcome Background',
      memoryDate: existing?.memoryDate || dateStr,
      favorite: existing?.favorite || false,
      createdAt: file.created_at || new Date().toISOString(),
    };
  });

  photos.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  if (JSON.stringify(photos) !== JSON.stringify(manifest.welcomeBackgrounds)) {
    saveSystemManifest({ ...manifest, welcomeBackgrounds: photos });
  }

  return photos;
};

export const subscribeBackgroundPhotos = (
  onData: (photos: BackgroundPhoto[]) => void
): (() => void) => {
  subscribers.add(onData);

  fetchBackgroundPhotosFromSupabase().then((items) => {
    notifySubscribers(items);
  });

  return () => {
    subscribers.delete(onData);
  };
};

export const subscribeWelcomeBackgrounds = subscribeBackgroundPhotos;

export const addBackgroundPhoto = async (
  file: File,
  metadata: { caption?: string; memoryDate?: string; favorite?: boolean },
  onProgress?: UploadProgressCallback
): Promise<string> => {
  console.log(`[DEBUG Upload Started] File: "${file.name}" (${file.size} bytes), Folder: "welcome-background", Provider: Supabase Storage`);

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

  const newItem: BackgroundPhoto = {
    id: storagePath,
    path: storagePath,
    imageUrl: publicUrl,
    caption: metadata.caption || 'Welcome Background',
    memoryDate: metadata.memoryDate || new Date().toISOString().split('T')[0],
    favorite: !!metadata.favorite,
    createdAt: new Date().toISOString(),
  };

  const manifest = await getSystemManifest();
  const updatedPhotos = [newItem, ...manifest.welcomeBackgrounds.filter((p) => p.path !== storagePath && p.imageUrl !== publicUrl)];
  await saveSystemManifest({ ...manifest, welcomeBackgrounds: updatedPhotos });

  if (onProgress) onProgress(100);

  notifySubscribers(updatedPhotos);
  return newItem.id;
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

export const updateBackgroundPhoto = async (
  photoId: string,
  updates: Partial<Omit<BackgroundPhoto, 'id' | 'imageUrl'>>
): Promise<void> => {
  const manifest = await getSystemManifest();
  const updatedPhotos = manifest.welcomeBackgrounds.map((p) => (p.id === photoId || p.path === photoId ? { ...p, ...updates } : p));
  await saveSystemManifest({ ...manifest, welcomeBackgrounds: updatedPhotos });
  notifySubscribers(updatedPhotos);
};

export const toggleBackgroundFavorite = async (
  photoId: string,
  currentFavoriteState: boolean
): Promise<void> => {
  await updateBackgroundPhoto(photoId, { favorite: !currentFavoriteState });
};

export const deleteBackgroundPhoto = async (photoId: string, imageUrl: string): Promise<void> => {
  console.log(`[DEBUG Delete Request Started] Background Photo ID: "${photoId}", Image URL: "${imageUrl}"`);

  const manifest = await getSystemManifest();
  const target = manifest.welcomeBackgrounds.find((p) => p.id === photoId || p.imageUrl === imageUrl);
  const storagePath = target?.path || photoId;

  if (storagePath && storagePath.startsWith('welcome-background/')) {
    console.log(`[DEBUG Storage Delete Started] Provider: Supabase Storage, Path: "${storagePath}"`);
    const delRes = await StorageService.deleteFile(storagePath);
    if (delRes.success) {
      console.log(`[DEBUG Storage Delete Completed] Successfully removed "${storagePath}" from Supabase Storage memories bucket.`);
    } else {
      console.warn(`[DEBUG Storage Delete Warning] ${delRes.error}`);
    }
  }

  const updatedPhotos = manifest.welcomeBackgrounds.filter((p) => p.id !== photoId && p.imageUrl !== imageUrl && p.path !== storagePath);
  await saveSystemManifest({ ...manifest, welcomeBackgrounds: updatedPhotos });
  notifySubscribers(updatedPhotos);
};

export const deleteWelcomeBackground = deleteBackgroundPhoto;
