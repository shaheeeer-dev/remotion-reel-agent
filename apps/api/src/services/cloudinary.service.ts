import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

export interface CloudinaryUploadResult {
  publicUrl: string;
  assetId: string;
  bytes: number;
  durationSeconds?: number;
}

export class CloudinaryService {
  private initialized = false;

  private init() {
    if (this.initialized) return;

    if (env.CLOUDINARY_URL) {
      cloudinary.config({
        cloudinary_url: env.CLOUDINARY_URL,
        secure: true,
      });
      this.initialized = true;
    } else if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
      cloudinary.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_API_SECRET,
        secure: true,
      });
      this.initialized = true;
    }
  }

  isConfigured(): boolean {
    return Boolean(
      env.CLOUDINARY_URL ||
      (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET)
    );
  }

  /**
   * Upload an MP4 video file to Cloudinary with public HTTPS delivery
   */
  async uploadVideo(localFilePath: string, publicId: string): Promise<CloudinaryUploadResult> {
    this.init();

    if (!this.isConfigured()) {
      throw new Error('Cloudinary credentials are not configured in environment variables.');
    }

    console.log(`[CloudinaryService] Uploading video to Cloudinary: ${localFilePath}...`);

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'video',
      public_id: publicId,
      folder: 'learnops-reels',
      overwrite: true,
      format: 'mp4',
    });

    console.log(`[CloudinaryService] Upload succeeded! Public HTTPS URL: ${result.secure_url} (${(result.bytes / (1024 * 1024)).toFixed(2)} MB)`);

    return {
      publicUrl: result.secure_url,
      assetId: result.public_id,
      bytes: result.bytes,
      durationSeconds: result.duration,
    };
  }

  /**
   * Monitor Cloudinary credit and storage usage to stay safely within free allowance
   */
  async getUsage(): Promise<{
    creditsUsedPercent: number;
    creditsUsed: number;
    creditsLimit: number;
    bandwidthBytes: number;
    storageBytes: number;
  }> {
    this.init();

    if (!this.isConfigured()) {
      return {
        creditsUsedPercent: 0,
        creditsUsed: 0,
        creditsLimit: 25,
        bandwidthBytes: 0,
        storageBytes: 0,
      };
    }

    try {
      const usage = await cloudinary.api.usage();
      const creditsUsage = usage.credits || {};
      return {
        creditsUsedPercent: creditsUsage.used_percent || 0,
        creditsUsed: creditsUsage.usage || 0,
        creditsLimit: creditsUsage.limit || 25,
        bandwidthBytes: usage.bandwidth?.usage || 0,
        storageBytes: usage.storage?.usage || 0,
      };
    } catch (err: any) {
      console.warn('[CloudinaryService] Could not fetch usage stats:', err.message);
      return {
        creditsUsedPercent: 0,
        creditsUsed: 0,
        creditsLimit: 25,
        bandwidthBytes: 0,
        storageBytes: 0,
      };
    }
  }
}

export const cloudinaryService = new CloudinaryService();
