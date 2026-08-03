import { StorageService } from './storage.service';
import { getSystemManifest, saveSystemManifest } from './supabaseSync.service';

export interface Letter {
  id: string;
  title: string;
  eventName: string;
  content: string;
  letterDate: string;
  author: string;
  favorite?: boolean;
  createdAt?: string;
  path?: string;
}

const STORAGE_FOLDER = 'letters' as const;
const subscribers = new Set<(letters: Letter[]) => void>();

const notifySubscribers = (letters: Letter[]) => {
  console.log(`[DEBUG Letters Refresh] Distributing ${letters.length} letter(s). Provider: Supabase Storage CDN.`);
  subscribers.forEach((cb) => {
    try {
      cb(letters);
    } catch (e) {
      console.error('[DEBUG Letters Refresh Error]', e);
    }
  });
};

/**
 * Uploads/saves a letter JSON file to Supabase Storage ('memories/letters/<docId>.json')
 */
const saveLetterFileToStorage = async (letter: Letter): Promise<string | null> => {
  try {
    const fileName = `${letter.id}.json`;
    const jsonString = JSON.stringify(letter, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const file = new File([blob], fileName, { type: 'application/json' });

    const uploadRes = await StorageService.uploadFile({
      folder: STORAGE_FOLDER,
      file,
      customFileName: fileName,
      upsert: true,
      contentType: 'application/json',
    });

    if (uploadRes.success && uploadRes.data) {
      console.log(`[DEBUG letterService] Saved letter file "${fileName}" to Supabase Storage memories/letters/`);
      return uploadRes.data.path;
    } else {
      console.warn(`[DEBUG letterService Warning] Upload letter file failed:`, uploadRes.error);
    }
  } catch (err) {
    console.error('[DEBUG letterService Exception]', err);
  }
  return null;
};

/**
 * Downloads and loads letters from Supabase Storage 'memories/letters' and metadata manifest
 */
export const fetchLettersFromSupabase = async (): Promise<Letter[]> => {
  console.log('[DEBUG Fetch Request Started] Querying Supabase Storage bucket "memories" folder "letters"...');

  const manifest = await getSystemManifest();
  const manifestMap = new Map<string, Letter>();
  (manifest.letters || []).forEach((item) => {
    if (item.id) manifestMap.set(item.id, item);
  });

  const res = await StorageService.listFiles(STORAGE_FOLDER);

  if (!res.success || !res.data) {
    return manifest.letters || [];
  }

  console.log(`[DEBUG Fetch Completed] Found ${res.data.length} storage object(s) in memories/letters.`);

  const letters: Letter[] = manifest.letters || [];

  if (JSON.stringify(letters) !== JSON.stringify(manifest.letters)) {
    saveSystemManifest({ ...manifest, letters });
  }

  return letters;
};

export const subscribeLetters = (
  onData: (letters: Letter[]) => void
): (() => void) => {
  subscribers.add(onData);

  fetchLettersFromSupabase().then((items) => {
    notifySubscribers(items);
  });

  return () => {
    subscribers.delete(onData);
  };
};

export const addLetter = async (metadata: {
  title: string;
  eventName: string;
  content: string;
  letterDate?: string;
  author?: string;
  favorite?: boolean;
}): Promise<string> => {
  const docId = `letter_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const storagePath = `letters/${docId}.json`;

  const newItem: Letter = {
    id: docId,
    path: storagePath,
    title: metadata.title || 'Untitled Letter',
    eventName: metadata.eventName || 'Special Memory',
    content: metadata.content || '',
    letterDate: metadata.letterDate || new Date().toISOString().split('T')[0],
    author: metadata.author || 'Sanjana',
    favorite: !!metadata.favorite,
    createdAt: new Date().toISOString(),
  };

  // 1. Upload letter file to Supabase Storage 'memories/letters/<docId>.json'
  await saveLetterFileToStorage(newItem);

  // 2. Save letter in system manifest in Supabase Storage
  const manifest = await getSystemManifest();
  const updatedLetters = [newItem, ...(manifest.letters || []).filter((l) => l.id !== docId)];
  await saveSystemManifest({ ...manifest, letters: updatedLetters });

  notifySubscribers(updatedLetters);
  return docId;
};

export const updateLetter = async (
  letterId: string,
  updates: Partial<Omit<Letter, 'id'>>
): Promise<void> => {
  const manifest = await getSystemManifest();
  const existing = (manifest.letters || []).find((l) => l.id === letterId);

  if (existing) {
    const updatedItem: Letter = { ...existing, ...updates };
    await saveLetterFileToStorage(updatedItem);

    const updatedLetters = (manifest.letters || []).map((l) => (l.id === letterId ? updatedItem : l));
    await saveSystemManifest({ ...manifest, letters: updatedLetters });
    notifySubscribers(updatedLetters);
  }
};

export const toggleLetterFavorite = async (
  letterId: string,
  currentFavoriteState: boolean
): Promise<void> => {
  await updateLetter(letterId, { favorite: !currentFavoriteState });
};

export const deleteLetter = async (letterId: string): Promise<void> => {
  console.log(`[DEBUG Delete Letter Request] Letter ID: "${letterId}"`);

  // Delete letter file from Supabase Storage 'memories/letters/<letterId>.json'
  const fileToDelete = letterId.endsWith('.json') ? letterId : `letters/${letterId}.json`;
  await StorageService.deleteFile(fileToDelete);

  const manifest = await getSystemManifest();
  const updatedLetters = (manifest.letters || []).filter((l) => l.id !== letterId && l.path !== fileToDelete);
  await saveSystemManifest({ ...manifest, letters: updatedLetters });

  notifySubscribers(updatedLetters);
};
