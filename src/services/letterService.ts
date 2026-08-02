import {
  subscribeToCollection,
  addDocument,
  updateDocument,
  deleteDocument,
  type BaseDoc,
} from '../firebase/firestore';

export interface Letter extends BaseDoc {
  title: string;
  eventName: string;
  content: string;
  letterDate: string;
  author: string;
  favorite?: boolean;
}

const COLLECTION_NAME = 'letters';
const LETTERS_CACHE_KEY = 'fb_letters';

/**
 * Reads persistent letters from local cache
 */
const getLettersFromCache = (): Letter[] => {
  const raw = localStorage.getItem(LETTERS_CACHE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveLettersToCache = (letters: Letter[]) => {
  try {
    localStorage.setItem(LETTERS_CACHE_KEY, JSON.stringify(letters));
  } catch {}
};

/**
 * Realtime listener for Personal Letters
 */
export const subscribeLetters = (
  onData: (letters: Letter[]) => void
): (() => void) => {
  return subscribeToCollection<Letter>(
    COLLECTION_NAME,
    (items) => {
      const cached = getLettersFromCache();
      const map = new Map<string, Letter>();

      cached.forEach((l) => map.set(l.id, l));
      items.forEach((l) => map.set(l.id, l));

      const combined = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      saveLettersToCache(combined);
      onData(combined);
    },
    'createdAt',
    'desc'
  );
};

/**
 * Adds a new Personal Letter
 */
export const addLetter = async (metadata: {
  title: string;
  eventName: string;
  content: string;
  letterDate?: string;
  author?: string;
  favorite?: boolean;
}): Promise<string> => {
  const docId = await addDocument(COLLECTION_NAME, {
    title: metadata.title || 'Untitled Letter',
    eventName: metadata.eventName || 'Special Memory',
    content: metadata.content || '',
    letterDate: metadata.letterDate || new Date().toISOString().split('T')[0],
    author: metadata.author || 'Sanjana',
    favorite: !!metadata.favorite,
  });

  const current = getLettersFromCache();
  const newItem: Letter = {
    id: docId,
    title: metadata.title || 'Untitled Letter',
    eventName: metadata.eventName || 'Special Memory',
    content: metadata.content || '',
    letterDate: metadata.letterDate || new Date().toISOString().split('T')[0],
    author: metadata.author || 'Sanjana',
    favorite: !!metadata.favorite,
    createdAt: new Date().toISOString(),
  };
  saveLettersToCache([newItem, ...current]);

  return docId;
};

/**
 * Updates a Personal Letter
 */
export const updateLetter = async (
  letterId: string,
  updates: Partial<Omit<Letter, 'id'>>
): Promise<void> => {
  const current = getLettersFromCache();
  const updated = current.map((l) => (l.id === letterId ? { ...l, ...updates } : l));
  saveLettersToCache(updated);

  await updateDocument(COLLECTION_NAME, letterId, updates);
};

/**
 * Toggles favorite badge of a letter
 */
export const toggleLetterFavorite = async (
  letterId: string,
  currentFavoriteState: boolean
): Promise<void> => {
  await updateLetter(letterId, { favorite: !currentFavoriteState });
};

/**
 * Deletes a letter permanently
 */
export const deleteLetter = async (letterId: string): Promise<void> => {
  const current = getLettersFromCache();
  const filtered = current.filter((l) => l.id !== letterId);
  saveLettersToCache(filtered);

  await deleteDocument(COLLECTION_NAME, letterId);
};
