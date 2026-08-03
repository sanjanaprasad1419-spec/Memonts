import { StorageService, type UploadProgressCallback } from './storage.service';
import { getSystemManifest, saveSystemManifest } from './supabaseSync.service';

export interface SongItem {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  eventName?: string;
  isActiveBackground?: boolean;
  favorite?: boolean;
  createdAt?: string;
}

const STORAGE_FOLDER = 'music' as const;
const subscribers = new Set<(songs: SongItem[]) => void>();

const notifySubscribers = (songs: SongItem[]) => {
  subscribers.forEach((cb) => {
    try {
      cb(songs);
    } catch (e) {
      console.error('[DEBUG Music Refresh Error]', e);
    }
  });
};

export const fetchMusicFromSupabase = async (): Promise<SongItem[]> => {
  const manifest = await getSystemManifest();
  const manifestMap = new Map<string, SongItem>();
  manifest.music.forEach((item) => {
    if (item && item.id) manifestMap.set(item.id, item);
    if (item && item.audioUrl) manifestMap.set(item.audioUrl, item);
  });

  const res = await StorageService.listFiles(STORAGE_FOLDER);

  if (!res.success || !res.data) {
    return manifest.music;
  }

  const songs: SongItem[] = res.data.map((file, idx) => {
    const existing = (file.id ? manifestMap.get(file.id) : undefined) ||
                     (file.path ? manifestMap.get(file.path) : undefined) ||
                     (file.publicUrl ? manifestMap.get(file.publicUrl) : undefined);
    return {
      id: file.id || file.path,
      audioUrl: file.publicUrl,
      title: existing?.title || file.name.replace(/^\d+_/, '').replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
      artist: existing?.artist || "Sanjana's Choice",
      eventName: existing?.eventName || 'Theme Music',
      isActiveBackground: existing?.isActiveBackground ?? idx === 0,
      favorite: existing?.favorite || false,
      createdAt: file.created_at || new Date().toISOString(),
    };
  });

  if (JSON.stringify(songs) !== JSON.stringify(manifest.music)) {
    saveSystemManifest({ ...manifest, music: songs });
  }

  return songs;
};

export const subscribeMusic = (
  onData: (songs: SongItem[]) => void
): (() => void) => {
  subscribers.add(onData);

  fetchMusicFromSupabase().then((items) => {
    notifySubscribers(items);
  });

  return () => {
    subscribers.delete(onData);
  };
};

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
  console.log(`[DEBUG Music Upload Started] File: "${file.name}" to Supabase Storage memories/music`);

  if (onProgress) onProgress(30);

  const uploadRes = await StorageService.uploadFile({
    folder: STORAGE_FOLDER,
    file,
  });

  if (!uploadRes.success || !uploadRes.data) {
    throw new Error(uploadRes.error || 'Failed to upload song to Supabase Storage');
  }

  if (onProgress) onProgress(90);

  const publicUrl = uploadRes.data.publicUrl;
  const storagePath = uploadRes.data.path;

  console.log(`[DEBUG Music Upload Completed] Supabase Public URL: "${publicUrl}"`);

  const manifest = await getSystemManifest();
  const shouldBeActive = metadata.isActiveBackground || manifest.music.length === 0;

  const newItem: SongItem = {
    id: storagePath,
    audioUrl: publicUrl,
    title: metadata.title || file.name,
    artist: metadata.artist || "Sanjana's Choice",
    eventName: metadata.eventName || 'Theme Music',
    isActiveBackground: shouldBeActive,
    favorite: !!metadata.favorite,
    createdAt: new Date().toISOString(),
  };

  let updatedMusic = manifest.music.map((s) => (shouldBeActive ? { ...s, isActiveBackground: false } : s));
  updatedMusic = [newItem, ...updatedMusic.filter((s) => s.id !== storagePath && s.audioUrl !== publicUrl)];
  await saveSystemManifest({ ...manifest, music: updatedMusic });

  if (onProgress) onProgress(100);

  notifySubscribers(updatedMusic);
  return newItem.id;
};

export const updateSong = async (
  songId: string,
  updates: Partial<Omit<SongItem, 'id' | 'audioUrl'>>,
  newFile?: File | null
): Promise<void> => {
  let newAudioUrl: string | undefined = undefined;
  let newPath: string | undefined = undefined;

  if (newFile) {
    const uploadRes = await StorageService.uploadFile({ folder: STORAGE_FOLDER, file: newFile });
    if (uploadRes.success && uploadRes.data?.publicUrl) {
      newAudioUrl = uploadRes.data.publicUrl;
      newPath = uploadRes.data.path;
    }
  }

  const manifest = await getSystemManifest();
  const updatedMusic = manifest.music.map((s) => {
    if (s.id === songId || s.audioUrl === songId) {
      return {
        ...s,
        ...updates,
        ...(newAudioUrl ? { audioUrl: newAudioUrl, id: newPath || s.id } : {}),
      };
    }
    return s;
  });

  await saveSystemManifest({ ...manifest, music: updatedMusic });
  notifySubscribers(updatedMusic);
};

export const toggleSongFavorite = async (
  songId: string,
  currentFavoriteState: boolean
): Promise<void> => {
  await updateSong(songId, { favorite: !currentFavoriteState });
};

export const setActiveBackgroundSong = async (songId: string | null): Promise<void> => {
  const manifest = await getSystemManifest();
  const updatedMusic = manifest.music.map((s) => ({
    ...s,
    isActiveBackground: songId !== null && (s.id === songId || s.audioUrl === songId),
  }));
  await saveSystemManifest({ ...manifest, music: updatedMusic });
  notifySubscribers(updatedMusic);
};

export const deleteSong = async (songId: string, _title?: string, audioUrl?: string): Promise<void> => {
  const manifest = await getSystemManifest();
  const target = manifest.music.find((s) => s.id === songId || s.audioUrl === audioUrl);
  const path = target?.id || songId;

  if (path && path.startsWith('music/')) {
    await StorageService.deleteFile(path);
  }

  const updatedMusic = manifest.music.filter((s) => s.id !== songId && s.audioUrl !== audioUrl);
  await saveSystemManifest({ ...manifest, music: updatedMusic });
  notifySubscribers(updatedMusic);
};
