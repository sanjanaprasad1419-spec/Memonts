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
}

const subscribers = new Set<(letters: Letter[]) => void>();

const notifySubscribers = (letters: Letter[]) => {
  subscribers.forEach((cb) => {
    try {
      cb(letters);
    } catch (e) {
      console.error('[DEBUG Letters Refresh Error]', e);
    }
  });
};

export const fetchLettersFromSupabase = async (): Promise<Letter[]> => {
  const manifest = await getSystemManifest();
  return manifest.letters || [];
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

  const manifest = await getSystemManifest();
  const updatedLetters = [newItem, ...manifest.letters];
  await saveSystemManifest({ ...manifest, letters: updatedLetters });

  notifySubscribers(updatedLetters);
  return docId;
};

export const updateLetter = async (
  letterId: string,
  updates: Partial<Omit<Letter, 'id'>>
): Promise<void> => {
  const manifest = await getSystemManifest();
  const updatedLetters = manifest.letters.map((l) => (l.id === letterId ? { ...l, ...updates } : l));
  await saveSystemManifest({ ...manifest, letters: updatedLetters });
  notifySubscribers(updatedLetters);
};

export const toggleLetterFavorite = async (
  letterId: string,
  currentFavoriteState: boolean
): Promise<void> => {
  await updateLetter(letterId, { favorite: !currentFavoriteState });
};

export const deleteLetter = async (letterId: string): Promise<void> => {
  const manifest = await getSystemManifest();
  const updatedLetters = manifest.letters.filter((l) => l.id !== letterId);
  await saveSystemManifest({ ...manifest, letters: updatedLetters });
  notifySubscribers(updatedLetters);
};
