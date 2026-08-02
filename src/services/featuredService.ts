import {
  subscribeToCollection,
  addDocument,
  updateDocument,
  deleteDocument,
  type BaseDoc,
} from '../firebase/firestore';
import { uploadImageToStorage, deleteImageFromStorage, type UploadProgressCallback } from '../firebase/storage';

export interface FeaturedMemory extends BaseDoc {
  imageUrl: string;
  displayOrder: number;
  enabled: boolean;
}

const COLLECTION_NAME = 'featuredMemories';
const STORAGE_FOLDER = 'featured';

/**
 * Realtime listener for Featured Memories
 */
export const subscribeFeaturedMemories = (
  onData: (memories: FeaturedMemory[]) => void
): (() => void) => {
  return subscribeToCollection<FeaturedMemory>(
    COLLECTION_NAME,
    (items) => {
      const sorted = [...items].sort((a, b) => a.displayOrder - b.displayOrder);
      onData(sorted);
    },
    'displayOrder',
    'asc'
  );
};

/**
 * Uploads a new Featured Memory photo
 */
export const addFeaturedMemory = async (
  file: File,
  currentCount: number,
  onProgress?: UploadProgressCallback
): Promise<string> => {
  const imageUrl = await uploadImageToStorage(file, STORAGE_FOLDER, onProgress);
  const docId = await addDocument(COLLECTION_NAME, {
    imageUrl,
    displayOrder: currentCount + 1,
    enabled: true,
  });
  return docId;
};

/**
 * Toggles enabled / disabled state of a Featured Memory
 */
export const toggleFeaturedMemoryEnabled = async (
  memoryId: string,
  currentState: boolean
): Promise<void> => {
  await updateDocument(COLLECTION_NAME, memoryId, { enabled: !currentState });
};

/**
 * Reorders Featured Memories
 */
export const reorderFeaturedMemories = async (
  orderedMemories: FeaturedMemory[]
): Promise<void> => {
  const updates = orderedMemories.map((mem, idx) =>
    updateDocument(COLLECTION_NAME, mem.id, { displayOrder: idx + 1 })
  );
  await Promise.all(updates);
};

/**
 * Deletes a Featured Memory photo
 */
export const deleteFeaturedMemory = async (
  memoryId: string,
  imageUrl: string
): Promise<void> => {
  await deleteDocument(COLLECTION_NAME, memoryId);
  await deleteImageFromStorage(imageUrl);
};
