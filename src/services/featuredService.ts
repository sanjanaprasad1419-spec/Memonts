import { StorageService, type UploadProgressCallback } from './storage.service';
import { getSystemManifest, saveSystemManifest } from './supabaseSync.service';

export interface FeaturedMemory {
  id: string;
  imageUrl: string;
  displayOrder: number;
  enabled: boolean;
  createdAt?: string;
  path?: string;
}

const STORAGE_FOLDER = 'featured' as const;
const subscribers = new Set<(memories: FeaturedMemory[]) => void>();

const notifySubscribers = (memories: FeaturedMemory[]) => {
  console.log(`[DEBUG Featured Refresh] Distributing ${memories.length} featured memories. Provider: Supabase Storage CDN.`);
  subscribers.forEach((cb) => {
    try {
      cb(memories);
    } catch (e) {
      console.error('[DEBUG Featured Refresh Error]', e);
    }
  });
};

export const fetchFeaturedFromSupabase = async (): Promise<FeaturedMemory[]> => {
  console.log('[DEBUG Fetch Request Started] Querying Supabase Storage bucket "memories" folder "featured"...');

  const manifest = await getSystemManifest();
  const manifestMap = new Map<string, FeaturedMemory>();
  manifest.featuredMemories.forEach((item) => {
    if (item.path) manifestMap.set(item.path, item);
    if (item.imageUrl) manifestMap.set(item.imageUrl, item);
  });

  const res = await StorageService.listFiles(STORAGE_FOLDER);

  if (!res.success || !res.data) {
    return manifest.featuredMemories;
  }

  console.log(`[DEBUG Fetch Completed] Found ${res.data.length} storage object(s) in memories/featured.`);

  const items: FeaturedMemory[] = res.data.map((file, idx) => {
    const existing = manifestMap.get(file.path) || manifestMap.get(file.publicUrl);

    return {
      id: file.id || file.path,
      path: file.path,
      imageUrl: file.publicUrl,
      displayOrder: existing?.displayOrder ?? idx + 1,
      enabled: existing?.enabled ?? true,
      createdAt: file.created_at || new Date().toISOString(),
    };
  });

  items.sort((a, b) => a.displayOrder - b.displayOrder);

  if (JSON.stringify(items) !== JSON.stringify(manifest.featuredMemories)) {
    saveSystemManifest({ ...manifest, featuredMemories: items });
  }

  return items;
};

export const subscribeFeaturedMemories = (
  onData: (memories: FeaturedMemory[]) => void
): (() => void) => {
  subscribers.add(onData);

  fetchFeaturedFromSupabase().then((items) => {
    notifySubscribers(items);
  });

  return () => {
    subscribers.delete(onData);
  };
};

export const addFeaturedMemory = async (
  file: File,
  currentCount: number,
  onProgress?: UploadProgressCallback
): Promise<string> => {
  console.log(`[DEBUG Upload Started] File: "${file.name}" (${file.size} bytes), Folder: "featured", Provider: Supabase Storage`);

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

  const newItem: FeaturedMemory = {
    id: storagePath,
    path: storagePath,
    imageUrl: publicUrl,
    displayOrder: currentCount + 1,
    enabled: true,
    createdAt: new Date().toISOString(),
  };

  const manifest = await getSystemManifest();
  const updatedMemories = [...manifest.featuredMemories.filter((m) => m.path !== storagePath && m.imageUrl !== publicUrl), newItem];
  await saveSystemManifest({ ...manifest, featuredMemories: updatedMemories });

  if (onProgress) onProgress(100);

  notifySubscribers(updatedMemories);
  return newItem.id;
};

export const toggleFeaturedMemoryEnabled = async (
  memoryId: string,
  currentState: boolean
): Promise<void> => {
  const manifest = await getSystemManifest();
  const updatedMemories = manifest.featuredMemories.map((m) => (m.id === memoryId || m.path === memoryId ? { ...m, enabled: !currentState } : m));
  await saveSystemManifest({ ...manifest, featuredMemories: updatedMemories });
  notifySubscribers(updatedMemories);
};

export const reorderFeaturedMemories = async (
  orderedMemories: FeaturedMemory[]
): Promise<void> => {
  const manifest = await getSystemManifest();
  const updatedMemories = orderedMemories.map((mem, idx) => ({ ...mem, displayOrder: idx + 1 }));
  await saveSystemManifest({ ...manifest, featuredMemories: updatedMemories });
  notifySubscribers(updatedMemories);
};

export const deleteFeaturedMemory = async (
  memoryId: string,
  imageUrl: string
): Promise<void> => {
  console.log(`[DEBUG Delete Request Started] Featured Memory ID: "${memoryId}", Image URL: "${imageUrl}"`);

  const manifest = await getSystemManifest();
  const target = manifest.featuredMemories.find((m) => m.id === memoryId || m.imageUrl === imageUrl);
  const storagePath = target?.path || memoryId;

  if (storagePath && storagePath.startsWith('featured/')) {
    console.log(`[DEBUG Storage Delete Started] Provider: Supabase Storage, Path: "${storagePath}"`);
    const delRes = await StorageService.deleteFile(storagePath);
    if (delRes.success) {
      console.log(`[DEBUG Storage Delete Completed] Successfully removed "${storagePath}" from Supabase Storage memories bucket.`);
    } else {
      console.warn(`[DEBUG Storage Delete Warning] ${delRes.error}`);
    }
  }

  const updatedMemories = manifest.featuredMemories.filter((m) => m.id !== memoryId && m.imageUrl !== imageUrl && m.path !== storagePath);
  await saveSystemManifest({ ...manifest, featuredMemories: updatedMemories });
  notifySubscribers(updatedMemories);
};
