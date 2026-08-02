/**
 * Supabase Storage and Database Type Definitions
 */

/**
 * Storage Bucket Folders defined for the 'memories' bucket
 */
export type StorageFolder = 
  | 'welcome-background'
  | 'gallery'
  | 'featured'
  | 'voice-notes'
  | 'letters'
  | 'music';

/**
 * Standardized Response structure for Supabase operations
 */
export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

/**
 * Options for file upload operations
 */
export interface UploadOptions {
  bucket?: string;
  folder: StorageFolder;
  file: File;
  customFileName?: string;
  upsert?: boolean;
  contentType?: string;
}

/**
 * Result returned by file upload operations
 */
export interface UploadResult {
  path: string;
  publicUrl: string;
  fullPath: string;
}

/**
 * Information about a file stored in Supabase Storage
 */
export interface StorageFile {
  name: string;
  id?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  last_accessed_at?: string | null;
  metadata?: Record<string, unknown> | null;
  publicUrl: string;
  path: string;
}

/**
 * Result returned by file deletion operations
 */
export interface DeleteResult {
  path: string;
  success: boolean;
}

/**
 * Gallery media item model
 */
export interface GalleryItem {
  id: string;
  title: string;
  caption?: string;
  url: string;
  path: string;
  type: 'image' | 'video';
  created_at: string;
  tags?: string[];
}

/**
 * Background media item model
 */
export interface BackgroundMedia {
  id: string;
  title: string;
  url: string;
  path: string;
  type: 'image' | 'video';
  is_active: boolean;
  created_at: string;
}

/**
 * Featured memory/highlight model
 */
export interface FeaturedItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  path: string;
  displayOrder: number;
  created_at: string;
}
