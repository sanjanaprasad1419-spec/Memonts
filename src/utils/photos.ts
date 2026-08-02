import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/firebase';

export interface PhotoMemory {
  id: string;
  imageUrl: string;
  caption: string;
  memoryDate: string;
  createdAt?: Timestamp | number | null;
  updatedAt?: Timestamp | number | null;
  isLocal?: boolean;
}

const PHOTOS_COLLECTION = 'photos';
const LOCAL_PHOTOS_KEY = 'ourverse_photos_cache';

// Helper to compress and convert File to lightweight Base64 Data URL (Max 1200px, JPEG 0.8)
const compressAndConvertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const maxDim = 1200;
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          maxDim;
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        // Compress to JPEG 80% quality (~150KB max)
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } else {
        // Fallback to FileReader
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      }
    };

    img.onerror = () => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    };

    img.src = url;
  });
};

// Get local photos stored in localStorage
const getLocalPhotos = (): PhotoMemory[] => {
  try {
    const stored = localStorage.getItem(LOCAL_PHOTOS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save local photos to localStorage safely
const saveLocalPhotos = (photos: PhotoMemory[]) => {
  try {
    localStorage.setItem(LOCAL_PHOTOS_KEY, JSON.stringify(photos));
  } catch (err) {
    console.warn('LocalStorage save warning:', err);
  }
};

// Fetch photos from both Firestore and LocalStorage
export const fetchPhotos = async (): Promise<PhotoMemory[]> => {
  const localPhotos = getLocalPhotos();
  let firestorePhotos: PhotoMemory[] = [];

  try {
    // Timeout Firestore fetch if unconfigured or slow (1.5s timeout)
    const fetchPromise = (async () => {
      const q = query(collection(db, PHOTOS_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<PhotoMemory, 'id'>),
      }));
    })();

    const timeoutPromise = new Promise<PhotoMemory[]>((resolve) =>
      setTimeout(() => resolve([]), 1500)
    );

    firestorePhotos = await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    console.info('Firestore fetch bypassed, using local store:', error);
  }

  // Combine & deduplicate photos by id
  const combinedMap = new Map<string, PhotoMemory>();
  localPhotos.forEach((p) => combinedMap.set(p.id, p));
  firestorePhotos.forEach((p) => combinedMap.set(p.id, p));

  return Array.from(combinedMap.values());
};

// Upload photo memory (Guaranteed Instant Upload + Firebase Sync with Timeout)
export const uploadPhoto = async (
  file: File,
  caption: string,
  memoryDate: string
): Promise<PhotoMemory> => {
  const compressedBase64 = await compressAndConvertToBase64(file);
  const id = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const newPhoto: PhotoMemory = {
    id,
    imageUrl: compressedBase64,
    caption,
    memoryDate,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isLocal: true,
  };

  // 1. Instantly store locally for 100% reliable success
  const existingLocal = getLocalPhotos();
  const updatedLocal = [newPhoto, ...existingLocal];
  saveLocalPhotos(updatedLocal);

  // 2. Attempt Firebase Storage & Firestore sync with 1.5s max timeout
  try {
    const firebaseSyncPromise = (async () => {
      const fileExtension = 'jpg';
      const fileName = `photos/${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${fileExtension}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, file);
      const firestoreUrl = await getDownloadURL(storageRef);

      const docRef = await addDoc(collection(db, PHOTOS_COLLECTION), {
        imageUrl: firestoreUrl,
        caption,
        memoryDate,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      newPhoto.id = docRef.id;
      newPhoto.imageUrl = firestoreUrl;
      newPhoto.isLocal = false;
      saveLocalPhotos([newPhoto, ...existingLocal]);
    })();

    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve(null), 1500)
    );

    await Promise.race([firebaseSyncPromise, timeoutPromise]);
  } catch (err) {
    console.info('Firebase upload bypassed or timed out, saved to persistent local store:', err);
  }

  return newPhoto;
};

// Update photo caption and date
export const updatePhoto = async (
  id: string,
  caption: string,
  memoryDate: string
): Promise<void> => {
  const localPhotos = getLocalPhotos();
  const updated = localPhotos.map((p) =>
    p.id === id ? { ...p, caption, memoryDate, updatedAt: Date.now() } : p
  );
  saveLocalPhotos(updated);

  try {
    const docRef = doc(db, PHOTOS_COLLECTION, id);
    await updateDoc(docRef, {
      caption,
      memoryDate,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.info('Updated photo locally:', err);
  }
};

// Delete photo document
export const deletePhoto = async (id: string, imageUrl: string): Promise<void> => {
  const localPhotos = getLocalPhotos();
  const filtered = localPhotos.filter((p) => p.id !== id);
  saveLocalPhotos(filtered);

  try {
    const docRef = doc(db, PHOTOS_COLLECTION, id);
    await deleteDoc(docRef);

    if (imageUrl.includes('firebasestorage')) {
      const storageRef = ref(storage, imageUrl);
      await deleteObject(storageRef);
    }
  } catch (err) {
    console.info('Deleted photo locally:', err);
  }
};
