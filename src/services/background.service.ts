import { StorageService } from './storage.service';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { BackgroundMedia, ServiceResponse, StorageFile } from '../types/supabase';

/**
 * Service for managing Welcome Background media via Supabase Storage ('memories/welcome-background')
 */
export class BackgroundService {
  private static STORAGE_FOLDER = 'welcome-background' as const;
  private static TABLE_NAME = 'background_media';

  /**
   * Upload a new background image/video file to Supabase storage
   */
  public static async uploadBackground(
    file: File,
    title?: string
  ): Promise<ServiceResponse<BackgroundMedia>> {
    try {
      const uploadRes = await StorageService.uploadFile({
        folder: this.STORAGE_FOLDER,
        file,
      });

      if (!uploadRes.success || !uploadRes.data) {
        return {
          data: null,
          error: uploadRes.error || 'Failed to upload background file',
          success: false,
        };
      }

      const mediaType: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image';
      const newMedia: BackgroundMedia = {
        id: uploadRes.data.path,
        title: title || file.name,
        url: uploadRes.data.publicUrl,
        path: uploadRes.data.path,
        type: mediaType,
        is_active: false,
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured()) {
        try {
          await supabase.from(this.TABLE_NAME).insert([
            {
              title: newMedia.title,
              url: newMedia.url,
              path: newMedia.path,
              type: newMedia.type,
              is_active: false,
            },
          ]);
        } catch (dbErr) {
          console.warn('[BackgroundService] Database record insert skipped/failed:', dbErr);
        }
      }

      return {
        data: newMedia,
        error: null,
        success: true,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload background media';
      console.error('[BackgroundService] uploadBackground error:', err);
      return {
        data: null,
        error: msg,
        success: false,
      };
    }
  }

  /**
   * List all stored background files from Supabase storage
   */
  public static async getBackgroundFiles(): Promise<ServiceResponse<StorageFile[]>> {
    return StorageService.listFiles(this.STORAGE_FOLDER);
  }

  /**
   * Delete a background media file by path
   */
  public static async deleteBackground(path: string): Promise<ServiceResponse<boolean>> {
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
          console.warn('[BackgroundService] Database record delete skipped/failed:', dbErr);
        }
      }

      return {
        data: true,
        error: null,
        success: true,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete background file';
      console.error('[BackgroundService] deleteBackground error:', err);
      return {
        data: false,
        error: msg,
        success: false,
      };
    }
  }
}
