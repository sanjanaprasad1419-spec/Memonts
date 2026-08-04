import { StorageService, type UploadProgressCallback } from './storage.service';
import { getSystemManifest, saveSystemManifest } from './supabaseSync.service';

export interface VideoItem {
  id: string;
  videoUrl: string;
  title: string;
  eventName?: string;
  eventId?: string;
  videoDate: string;
  description?: string;
  favorite?: boolean;
  createdAt?: string;
}

const STORAGE_FOLDER = 'gallery' as const;
const subscribers = new Set<(videos: VideoItem[]) => void>();

const notifySubscribers = (videos: VideoItem[]) => {
  subscribers.forEach((cb) => {
    try {
      cb(videos);
    } catch (e) {
      console.error('[DEBUG Video Refresh Error]', e);
    }
  });
};

export const fetchVideosFromSupabase = async (): Promise<VideoItem[]> => {
  const manifest = await getSystemManifest();
  const manifestMap = new Map<string, VideoItem>();
  manifest.videos.forEach((item) => {
    if (item && item.id) manifestMap.set(item.id, item);
    if (item && item.videoUrl) manifestMap.set(item.videoUrl, item);
  });

  const res = await StorageService.listFiles(STORAGE_FOLDER);

  if (!res.success || !res.data) {
    return manifest.videos;
  }

  const videoFiles = res.data.filter((f) => f.name.match(/\.(mp4|webm|ogg|mov)$/i));

  const videos: VideoItem[] = videoFiles.map((file) => {
    const existing = (file.id ? manifestMap.get(file.id) : undefined) ||
                     (file.path ? manifestMap.get(file.path) : undefined) ||
                     (file.publicUrl ? manifestMap.get(file.publicUrl) : undefined);
    return {
      id: file.id || file.path,
      videoUrl: file.publicUrl,
      title: existing?.title || file.name.replace(/^\d+_/, '').replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
      eventName: existing?.eventName || 'Special Event',
      eventId: existing?.eventId || 'uncategorized',
      videoDate: existing?.videoDate || (file.created_at ? new Date(file.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
      description: existing?.description || '',
      favorite: existing?.favorite || false,
      createdAt: file.created_at || new Date().toISOString(),
    };
  });

  if (JSON.stringify(videos) !== JSON.stringify(manifest.videos)) {
    saveSystemManifest({ ...manifest, videos });
  }

  return videos;
};

export const subscribeVideos = (
  onData: (videos: VideoItem[]) => void
): (() => void) => {
  subscribers.add(onData);

  fetchVideosFromSupabase().then((items) => {
    notifySubscribers(items);
  });

  return () => {
    subscribers.delete(onData);
  };
};

export const addVideo = async (
  file: File,
  metadata: {
    title: string;
    eventName?: string;
    eventId?: string;
    videoDate?: string;
    description?: string;
    favorite?: boolean;
  },
  onProgress?: UploadProgressCallback
): Promise<string> => {
  console.log(`[DEBUG Video Upload Started] File: "${file.name}" to Supabase Storage memories/gallery`);

  if (onProgress) onProgress(30);

  const uploadRes = await StorageService.uploadFile({
    folder: STORAGE_FOLDER,
    file,
  });

  if (!uploadRes.success || !uploadRes.data) {
    throw new Error(uploadRes.error || 'Failed to upload video to Supabase Storage');
  }

  if (onProgress) onProgress(90);

  const publicUrl = uploadRes.data.publicUrl;
  const storagePath = uploadRes.data.path;

  console.log(`[DEBUG Video Upload Completed] Supabase Public URL: "${publicUrl}"`);

  const manifest = await getSystemManifest();

  const newItem: VideoItem = {
    id: storagePath,
    videoUrl: publicUrl,
    title: metadata.title || file.name,
    eventName: metadata.eventName || 'Special Event',
    eventId: metadata.eventId || 'uncategorized',
    videoDate: metadata.videoDate || new Date().toISOString().split('T')[0],
    description: metadata.description || '',
    favorite: !!metadata.favorite,
    createdAt: new Date().toISOString(),
  };

  const updatedVideos = [newItem, ...manifest.videos.filter((v) => v.id !== storagePath && v.videoUrl !== publicUrl)];
  await saveSystemManifest({ ...manifest, videos: updatedVideos });

  if (onProgress) onProgress(100);

  notifySubscribers(updatedVideos);
  return newItem.id;
};

export const updateVideo = async (
  videoId: string,
  updates: Partial<Omit<VideoItem, 'id' | 'videoUrl'>>
): Promise<void> => {
  const manifest = await getSystemManifest();
  const updatedVideos = manifest.videos.map((v) => (v.id === videoId ? { ...v, ...updates } : v));
  await saveSystemManifest({ ...manifest, videos: updatedVideos });
  notifySubscribers(updatedVideos);
};

export const toggleVideoFavorite = async (
  videoId: string,
  currentFavoriteState: boolean
): Promise<void> => {
  await updateVideo(videoId, { favorite: !currentFavoriteState });
};

export const deleteVideo = async (videoId: string, _title?: string, videoUrl?: string): Promise<void> => {
  const manifest = await getSystemManifest();
  const target = manifest.videos.find((v) => v.id === videoId || v.videoUrl === videoUrl);
  const path = target?.id || videoId;

  if (path && path.startsWith('gallery/')) {
    await StorageService.deleteFile(path);
  }

  const updatedVideos = manifest.videos.filter((v) => v.id !== videoId && v.videoUrl !== videoUrl);
  await saveSystemManifest({ ...manifest, videos: updatedVideos });
  notifySubscribers(updatedVideos);
};
