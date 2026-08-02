import { StorageService } from './storage.service';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { GalleryItem, ServiceResponse, StorageFile } from '../types/supabase';

/**
 * Service for managing Gallery items via Supabase Storage ('memories/gallery')
 * and Supabase Database ('gallery_items' table).
 */
export class GalleryService {
  private static STORAGE_FOLDER = 'gallery' as const;
  private static TABLE_NAME = 'gallery_items';

  /**
   * Upload a new media item to the gallery folder in memories bucket
   */
  public static async uploadGalleryMedia(
    file: File,
    meta?: { title?: string; caption?: string; tags?: string[] }
  ): Promise<ServiceResponse<GalleryItem>> {
    try {
      const uploadRes = await StorageService.uploadFile({
        folder: this.STORAGE_FOLDER,
        file,
      });

      if (!uploadRes.success || !uploadRes.data) {
        return {
          data: null,
          error: uploadRes.error || 'Failed to upload gallery media file',
          success: false,
        };
      }

      const mediaType: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image';
      const newItem: GalleryItem = {
        id: uploadRes.data.path,
        title: meta?.title || file.name,
        caption: meta?.caption || '',
        url: uploadRes.data.publicUrl,
        path: uploadRes.data.path,
        type: mediaType,
        created_at: new Date().toISOString(),
        tags: meta?.tags || [],
      };

      // Optionally insert into database if configured and table exists
      if (isSupabaseConfigured()) {
        try {
          await supabase.from(this.TABLE_NAME).insert([
            {
              title: newItem.title,
              caption: newItem.caption,
              url: newItem.url,
              path: newItem.path,
              type: newItem.type,
              tags: newItem.tags,
            },
          ]);
        } catch (dbErr) {
          console.warn('[GalleryService] Database record insert skipped/failed:', dbErr);
          // Storage upload succeeded, so return item gracefully
        }
      }

      return {
        data: newItem,
        error: null,
        success: true,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload gallery media';
      console.error('[GalleryService] uploadGalleryMedia error:', err);
      return {
        data: null,
        error: msg,
        success: false,
      };
    }
  }

  /**
   * List all gallery items stored in the memories storage bucket
   */
  public static async getGalleryFiles(): Promise<ServiceResponse<StorageFile[]>> {
    return StorageService.listFiles(this.STORAGE_FOLDER);
  }

  /**
   * Delete a gallery item by storage path
   */
  public static async deleteGalleryMedia(path: string): Promise<ServiceResponse<boolean>> {
    try {
      const delRes = await StorageService.deleteFile(path);
      if (!delRes.success) {
        return {
          data: false,
          error: delRes.error,
          success: false,
        };
      }

      // Try deleting record from DB table if it exists
      if (isSupabaseConfigured()) {
        try {
          await supabase.from(this.TABLE_NAME).delete().eq('path', path);
        } catch (dbErr) {
          console.warn('[GalleryService] Database record delete skipped/failed:', dbErr);
        }
      }

      return {
        data: true,
        error: null,
        success: true,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete gallery media';
      console.error('[GalleryService] deleteGalleryMedia error:', err);
      return {
        data: false,
        error: msg,
        success: false,
      };
    }
  }
}
