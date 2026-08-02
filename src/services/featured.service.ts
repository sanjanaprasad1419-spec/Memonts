import { StorageService } from './storage.service';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { FeaturedItem, ServiceResponse, StorageFile } from '../types/supabase';

/**
 * Service for managing Featured section items via Supabase Storage ('memories/featured')
 */
export class FeaturedService {
  private static STORAGE_FOLDER = 'featured' as const;
  private static TABLE_NAME = 'featured_items';

  /**
   * Upload media and create a featured item entry
   */
  public static async uploadFeaturedMedia(
    file: File,
    meta?: { title?: string; description?: string; displayOrder?: number }
  ): Promise<ServiceResponse<FeaturedItem>> {
    try {
      const uploadRes = await StorageService.uploadFile({
        folder: this.STORAGE_FOLDER,
        file,
      });

      if (!uploadRes.success || !uploadRes.data) {
        return {
          data: null,
          error: uploadRes.error || 'Failed to upload featured file',
          success: false,
        };
      }

      const newItem: FeaturedItem = {
        id: uploadRes.data.path,
        title: meta?.title || file.name,
        description: meta?.description || '',
        imageUrl: uploadRes.data.publicUrl,
        path: uploadRes.data.path,
        displayOrder: meta?.displayOrder ?? 0,
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured()) {
        try {
          await supabase.from(this.TABLE_NAME).insert([
            {
              title: newItem.title,
              description: newItem.description,
              image_url: newItem.imageUrl,
              path: newItem.path,
              display_order: newItem.displayOrder,
            },
          ]);
        } catch (dbErr) {
          console.warn('[FeaturedService] Database record insert skipped/failed:', dbErr);
        }
      }

      return {
        data: newItem,
        error: null,
        success: true,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload featured media';
      console.error('[FeaturedService] uploadFeaturedMedia error:', err);
      return {
        data: null,
        error: msg,
        success: false,
      };
    }
  }

  /**
   * List all files in the featured storage folder
   */
  public static async getFeaturedFiles(): Promise<ServiceResponse<StorageFile[]>> {
    return StorageService.listFiles(this.STORAGE_FOLDER);
  }

  /**
   * Delete a featured item file by path
   */
  public static async deleteFeaturedMedia(path: string): Promise<ServiceResponse<boolean>> {
    try {
      const delRes = await StorageService.deleteFile(path);
      if (!delRes.success) {
        return {
          data: false,
          error: delRes.error,
          success: false,
        };
      }

      if (isSupabaseConfigured()) {
        try {
          await supabase.from(this.TABLE_NAME).delete().eq('path', path);
        } catch (dbErr) {
          console.warn('[FeaturedService] Database record delete skipped/failed:', dbErr);
        }
      }

      return {
        data: true,
        error: null,
        success: true,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete featured item';
      console.error('[FeaturedService] deleteFeaturedMedia error:', err);
      return {
        data: false,
        error: msg,
        success: false,
      };
    }
  }
}
