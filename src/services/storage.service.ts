import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { 
  StorageFolder, 
  UploadOptions, 
  UploadResult, 
  StorageFile, 
  DeleteResult, 
  ServiceResponse 
} from '../types/supabase';

export const BUCKET_NAME = 'memories';
export type UploadProgressCallback = (progress: number) => void;

/**
 * Storage Service provides reusable helper methods for Supabase Storage.
 * Target Bucket: 'memories'
 */
export class StorageService {
  /**
   * Sanitizes a file name for safe storage paths
   */
  public static sanitizeFileName(fileName: string): string {
    const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    return `${timestamp}_${cleanName}`;
  }

  /**
   * Generates public URL for a given file path in the memories bucket
   */
  public static getPublicUrl(path: string, bucket: string = BUCKET_NAME): string {
    try {
      if (!path) return '';
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl || '';
    } catch (error) {
      console.error('[StorageService] Error getting public URL:', error);
      return '';
    }
  }

  /**
   * Uploads a file to a specified folder inside the memories bucket
   */
  public static async uploadFile(
    options: UploadOptions
  ): Promise<ServiceResponse<UploadResult>> {
    try {
      if (!isSupabaseConfigured()) {
        return {
          data: null,
          error: 'Supabase credentials are not properly configured in .env',
          success: false,
        };
      }

      const {
        bucket = BUCKET_NAME,
        folder,
        file,
        customFileName,
        upsert = false,
        contentType,
      } = options;

      if (!file) {
        return {
          data: null,
          error: 'No file provided for upload',
          success: false,
        };
      }

      const fileName = customFileName 
        ? customFileName 
        : this.sanitizeFileName(file.name);

      const filePath = `${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          upsert,
          contentType: contentType || file.type,
        });

      if (error) {
        console.error(`[StorageService] Upload failed for ${filePath}:`, error.message);
        return {
          data: null,
          error: `Upload failed: ${error.message}`,
          success: false,
        };
      }

      const publicUrl = this.getPublicUrl(data.path, bucket);

      return {
        data: {
          path: data.path,
          publicUrl,
          fullPath: data.fullPath,
        },
        error: null,
        success: true,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during upload';
      console.error('[StorageService] Unexpected error during upload:', err);
      return {
        data: null,
        error: errorMessage,
        success: false,
      };
    }
  }

  /**
   * Deletes a file from the memories bucket by path
   */
  public static async deleteFile(
    path: string, 
    bucket: string = BUCKET_NAME
  ): Promise<ServiceResponse<DeleteResult>> {
    try {
      if (!isSupabaseConfigured()) {
        return {
          data: null,
          error: 'Supabase credentials are not properly configured',
          success: false,
        };
      }

      if (!path) {
        return {
          data: null,
          error: 'File path is required for deletion',
          success: false,
        };
      }

      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) {
        console.error(`[StorageService] Delete failed for ${path}:`, error.message);
        return {
          data: null,
          error: `Delete failed: ${error.message}`,
          success: false,
        };
      }

      return {
        data: { path, success: true },
        error: null,
        success: true,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during file deletion';
      console.error('[StorageService] Unexpected error during deletion:', err);
      return {
        data: null,
        error: errorMessage,
        success: false,
      };
    }
  }

  /**
   * Lists all files in a specific folder within the memories bucket
   */
  public static async listFiles(
    folder: StorageFolder,
    bucket: string = BUCKET_NAME
  ): Promise<ServiceResponse<StorageFile[]>> {
    try {
      if (!isSupabaseConfigured()) {
        return {
          data: [],
          error: 'Supabase credentials are not properly configured',
          success: false,
        };
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        console.error(`[StorageService] List files failed for folder ${folder}:`, error.message);
        return {
          data: [],
          error: `Listing files failed: ${error.message}`,
          success: false,
        };
      }

      const filesWithUrls: StorageFile[] = (data || [])
        .filter((file) => file.name !== '.emptyFolderPlaceholder')
        .map((file) => {
          const filePath = `${folder}/${file.name}`;
          const publicUrl = this.getPublicUrl(filePath, bucket);
          return {
            name: file.name,
            id: file.id,
            updated_at: file.updated_at,
            created_at: file.created_at,
            last_accessed_at: file.last_accessed_at,
            metadata: file.metadata as Record<string, unknown>,
            publicUrl,
            path: filePath,
          };
        });

      return {
        data: filesWithUrls,
        error: null,
        success: true,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while listing files';
      console.error('[StorageService] Unexpected error during file listing:', err);
      return {
        data: [],
        error: errorMessage,
        success: false,
      };
    }
  }

  /**
   * Convenience helper to upload specifically to welcome-background folder
   */
  public static async uploadWelcomeBackground(file: File): Promise<ServiceResponse<UploadResult>> {
    return this.uploadFile({ folder: 'welcome-background', file });
  }

  /**
   * Convenience helper to upload specifically to gallery folder
   */
  public static async uploadGalleryMedia(file: File): Promise<ServiceResponse<UploadResult>> {
    return this.uploadFile({ folder: 'gallery', file });
  }

  /**
   * Convenience helper to upload specifically to featured folder
   */
  public static async uploadFeaturedMedia(file: File): Promise<ServiceResponse<UploadResult>> {
    return this.uploadFile({ folder: 'featured', file });
  }

  /**
   * Convenience helper to upload specifically to voice-notes folder
   */
  public static async uploadVoiceNote(file: File): Promise<ServiceResponse<UploadResult>> {
    return this.uploadFile({ folder: 'voice-notes', file });
  }

  /**
   * Convenience helper to upload specifically to letters folder
   */
  public static async uploadLetterFile(file: File): Promise<ServiceResponse<UploadResult>> {
    return this.uploadFile({ folder: 'letters', file });
  }

  /**
   * Convenience helper to upload specifically to music folder
   */
  public static async uploadMusicFile(file: File): Promise<ServiceResponse<UploadResult>> {
    return this.uploadFile({ folder: 'music', file });
  }
}
