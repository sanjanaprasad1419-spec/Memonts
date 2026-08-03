import { StorageService } from '../services/storage.service';
import type { StorageFolder } from '../types/supabase';

export interface UploadProgressCallback {
  (progress: number): void;
}

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload JPG, PNG, WEBP, or GIF.' };
  }
  const maxSize = 15 * 1024 * 1024; // 15MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds maximum limit of 15MB.' };
  }
  return { valid: true };
};

/**
 * Uploads an image directly to Supabase Storage ('memories' bucket)
 * Returns ONLY the permanent public CDN URL from Supabase.
 */
export const uploadImageToStorage = async (
  file: File,
  folderPath: string,
  onProgress?: UploadProgressCallback
): Promise<string> => {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid file');
  }

  if (onProgress) onProgress(30);

  const folder: StorageFolder = (folderPath.includes('welcome')
    ? 'welcome-background'
    : folderPath.includes('featured')
    ? 'featured'
    : 'gallery') as StorageFolder;

  const res = await StorageService.uploadFile({
    folder,
    file,
  });

  if (!res.success || !res.data) {
    throw new Error(res.error || 'Upload to Supabase Storage failed');
  }

  if (onProgress) onProgress(100);

  console.log(`[DEBUG firebase/storage.ts] Uploaded file "${file.name}" to Supabase Storage. Public URL: "${res.data.publicUrl}"`);
  return res.data.publicUrl;
};

/**
 * Deletes an image from Supabase Storage
 */
export const deleteImageFromStorage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl || imageUrl.startsWith('data:')) return;

  try {
    if (imageUrl.includes('/object/public/memories/')) {
      const path = imageUrl.split('/object/public/memories/')[1];
      if (path) {
        await StorageService.deleteFile(path);
      }
    }
  } catch (error) {
    console.warn('Delete image warning:', error);
  }
};
