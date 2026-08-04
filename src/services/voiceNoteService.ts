import { StorageService, type UploadProgressCallback } from './storage.service';
import { getSystemManifest, saveSystemManifest } from './supabaseSync.service';

export interface VoiceNoteItem {
  id: string;
  title: string;
  audioUrl: string;
  duration?: string;
  eventId?: string;
  date?: string;
  favorite?: boolean;
  createdAt?: string;
  path?: string;
}

const STORAGE_FOLDER = 'voice-notes' as const;
const subscribers = new Set<(notes: VoiceNoteItem[]) => void>();

const notifySubscribers = (notes: VoiceNoteItem[]) => {
  console.log(`[DEBUG VoiceNotes Refresh] Distributing ${notes.length} voice note(s).`);
  subscribers.forEach((cb) => {
    try {
      cb(notes);
    } catch (e) {
      console.error('[DEBUG VoiceNotes Refresh Error]', e);
    }
  });
};

export const fetchVoiceNotesFromSupabase = async (): Promise<VoiceNoteItem[]> => {
  const manifest = await getSystemManifest();
  const notes = manifest.voiceNotes || [];
  return notes;
};

export const subscribeVoiceNotes = (
  onData: (notes: VoiceNoteItem[]) => void
): (() => void) => {
  subscribers.add(onData);

  fetchVoiceNotesFromSupabase().then((items) => {
    notifySubscribers(items);
  });

  return () => {
    subscribers.delete(onData);
  };
};

export const addVoiceNote = async (
  file: File,
  metadata: {
    title: string;
    eventId: string;
    date?: string;
    duration?: string;
    favorite?: boolean;
  },
  onProgress?: UploadProgressCallback
): Promise<string> => {
  console.log(`[DEBUG VoiceNote Upload Started] File: "${file.name}" to Supabase Storage memories/voice-notes`);

  if (onProgress) onProgress(30);

  const uploadRes = await StorageService.uploadFile({
    folder: STORAGE_FOLDER,
    file,
  });

  if (!uploadRes.success || !uploadRes.data) {
    throw new Error(uploadRes.error || 'Failed to upload voice note to Supabase Storage');
  }

  if (onProgress) onProgress(90);

  const publicUrl = uploadRes.data.publicUrl;
  const storagePath = uploadRes.data.path;

  const newItem: VoiceNoteItem = {
    id: storagePath,
    path: storagePath,
    audioUrl: publicUrl,
    title: metadata.title || file.name,
    eventId: metadata.eventId || 'uncategorized',
    date: metadata.date || new Date().toISOString().split('T')[0],
    duration: metadata.duration || '1:00',
    favorite: !!metadata.favorite,
    createdAt: new Date().toISOString(),
  };

  const manifest = await getSystemManifest();
  const updatedNotes = [newItem, ...(manifest.voiceNotes || []).filter((v) => v.id !== storagePath && v.audioUrl !== publicUrl)];
  await saveSystemManifest({ ...manifest, voiceNotes: updatedNotes });

  if (onProgress) onProgress(100);

  notifySubscribers(updatedNotes);
  return newItem.id;
};

export const updateVoiceNote = async (
  noteId: string,
  updates: Partial<Omit<VoiceNoteItem, 'id' | 'audioUrl'>>
): Promise<void> => {
  const manifest = await getSystemManifest();
  const updatedNotes = (manifest.voiceNotes || []).map((v) => (v.id === noteId || v.path === noteId ? { ...v, ...updates } : v));
  await saveSystemManifest({ ...manifest, voiceNotes: updatedNotes });
  notifySubscribers(updatedNotes);
};

export const toggleVoiceNoteFavorite = async (
  noteId: string,
  currentFavoriteState: boolean
): Promise<void> => {
  await updateVoiceNote(noteId, { favorite: !currentFavoriteState });
};

export const deleteVoiceNote = async (noteId: string, audioUrl?: string): Promise<void> => {
  const manifest = await getSystemManifest();
  const target = (manifest.voiceNotes || []).find((v) => v.id === noteId || v.audioUrl === audioUrl);
  const path = target?.path || target?.id || noteId;

  if (path && path.startsWith('voice-notes/')) {
    await StorageService.deleteFile(path);
  }

  const updatedNotes = (manifest.voiceNotes || []).filter((v) => v.id !== noteId && v.audioUrl !== audioUrl && v.path !== path);
  await saveSystemManifest({ ...manifest, voiceNotes: updatedNotes });
  notifySubscribers(updatedNotes);
};
