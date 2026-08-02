import { db } from './config';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { saveMediaToIndexedDB, getMediaFromIndexedDB } from '../utils/mediaStore';

export interface BaseDoc {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

// In-memory & Cross-tab Broadcast Channel for instant realtime sync
const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('firestore_sync_channel') : null;
const localSubscribers: Record<string, Set<(data: any[]) => void>> = {};

/**
 * Safely writes collection items to IndexedDB and LocalStorage without empty string data corruption
 */
const safeStoreCollectionItems = (key: string, items: any[]) => {
  // Always save full items to IndexedDB (unlimited capacity)
  saveMediaToIndexedDB(key, items);

  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (err) {
    console.info(`LocalStorage quota handled safely for '${key}' via IndexedDB`);
  }
};

const notifyLocalSubscribers = (collectionName: string, items: any[]) => {
  if (localSubscribers[collectionName]) {
    localSubscribers[collectionName].forEach((cb) => cb(items));
  }
  if (syncChannel) {
    syncChannel.postMessage({ collectionName, items });
  }
};

if (syncChannel) {
  syncChannel.onmessage = (event) => {
    const { collectionName, items } = event.data || {};
    if (collectionName && items && localSubscribers[collectionName]) {
      localSubscribers[collectionName].forEach((cb) => cb(items));
    }
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('fb_')) {
      const colName = e.key.replace('fb_', '');
      if (localSubscribers[colName] && e.newValue) {
        try {
          const items = JSON.parse(e.newValue);
          localSubscribers[colName].forEach((cb) => cb(items));
        } catch {}
      }
    }
  });
}

/**
 * Subscribes to Firestore collection changes in real time
 */
export const subscribeToCollection = <T extends BaseDoc>(
  collectionName: string,
  onData: (items: T[]) => void,
  orderByField: string = 'createdAt',
  orderDirection: 'asc' | 'desc' = 'desc'
): (() => void) => {
  if (!localSubscribers[collectionName]) {
    localSubscribers[collectionName] = new Set();
  }
  localSubscribers[collectionName].add(onData as any);

  // Load cached items from IndexedDB / LocalStorage for zero latency initial render
  const key = `fb_${collectionName}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        onData(parsed);
      }
    } catch {}
  }

  // Also check IndexedDB for full non-truncated items
  getMediaFromIndexedDB<T[]>(key).then((idbItems) => {
    if (idbItems && Array.isArray(idbItems) && idbItems.length > 0) {
      onData(idbItems);
    }
  });

  try {
    const colRef = collection(db, collectionName);
    const q = query(colRef, orderBy(orderByField, orderDirection));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: T[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
          } as T;
        });

        safeStoreCollectionItems(key, items);
        onData(items);
        notifyLocalSubscribers(collectionName, items);
      },
      (error) => {
        console.warn(`Firestore onSnapshot fallback for '${collectionName}':`, error);
        getMediaFromIndexedDB<T[]>(key).then((cached) => {
          if (cached) onData(cached);
        });
      }
    );

    return () => {
      unsubscribe();
      if (localSubscribers[collectionName]) {
        localSubscribers[collectionName].delete(onData as any);
      }
    };
  } catch (error) {
    console.warn(`Firestore collection subscription fallback for '${collectionName}':`, error);
    getMediaFromIndexedDB<T[]>(key).then((cached) => {
      if (cached) onData(cached);
    });

    return () => {
      if (localSubscribers[collectionName]) {
        localSubscribers[collectionName].delete(onData as any);
      }
    };
  }
};

/**
 * Adds a document with a 1s max timeout race so UI NEVER hangs
 */
export const addDocument = async <T extends Record<string, any>>(
  collectionName: string,
  data: T
): Promise<string> => {
  const payload = {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const key = `fb_${collectionName}`;
  let items: any[] = [];
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      items = JSON.parse(stored);
    } catch {}
  }

  const id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newItem = { id, ...payload };
  items.unshift(newItem);

  safeStoreCollectionItems(key, items);
  notifyLocalSubscribers(collectionName, items);

  try {
    const firestorePromise = (async () => {
      const colRef = collection(db, collectionName);
      const docRef = await addDoc(colRef, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    })();

    const timeoutPromise = new Promise<string>((resolve) =>
      setTimeout(() => resolve(id), 1000)
    );

    return await Promise.race([firestorePromise, timeoutPromise]);
  } catch (error) {
    console.warn(`Firestore addDoc fallback for '${collectionName}':`, error);
    return id;
  }
};

/**
 * Updates a document with a 1s max timeout race so UI NEVER hangs
 */
export const updateDocument = async <T extends Record<string, any>>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<void> => {
  const payload = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  const key = `fb_${collectionName}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    let items: any[] = JSON.parse(stored);
    items = items.map((item) => (item.id === docId ? { ...item, ...payload } : item));
    safeStoreCollectionItems(key, items);
    notifyLocalSubscribers(collectionName, items);
  }

  try {
    const firestorePromise = (async () => {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...payload,
        updatedAt: serverTimestamp(),
      });
    })();

    const timeoutPromise = new Promise<void>((resolve) =>
      setTimeout(() => resolve(), 1000)
    );

    await Promise.race([firestorePromise, timeoutPromise]);
  } catch (error) {
    console.warn(`Firestore updateDoc fallback for '${collectionName}':`, error);
  }
};

/**
 * Deletes a document with a 1s max timeout race so UI NEVER hangs
 */
export const deleteDocument = async (collectionName: string, docId: string): Promise<void> => {
  const key = `fb_${collectionName}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    let items: any[] = JSON.parse(stored);
    items = items.filter((item) => item.id !== docId);
    safeStoreCollectionItems(key, items);
    notifyLocalSubscribers(collectionName, items);
  }

  try {
    const firestorePromise = (async () => {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    })();

    const timeoutPromise = new Promise<void>((resolve) =>
      setTimeout(() => resolve(), 1000)
    );

    await Promise.race([firestorePromise, timeoutPromise]);
  } catch (error) {
    console.warn(`Firestore deleteDoc fallback for '${collectionName}':`, error);
  }
};
