import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import type { ReelRenderInput } from '@learnops/schema';
import { env } from '../config/env.js';

let cachedBundleUrl: string | null = null;

export class RemotionService {
  private async getBundle(): Promise<string> {
    if (cachedBundleUrl) {
      return cachedBundleUrl;
    }

    const rendererEntry = path.resolve(process.cwd(), '../../packages/renderer/src/index.ts');
    console.log(`Bundling Remotion from ${rendererEntry}...`);

    cachedBundleUrl = await bundle({
      entryPoint: rendererEntry,
      webpackOverride: (config) => config,
    });

    return cachedBundleUrl;
  }

  async renderReelVideo(input: ReelRenderInput, outputFileName: string): Promise<{
    storagePath: string;
    publicUrl: string;
    fileSizeBytes: number;
    durationSeconds: number;
    width: number;
    height: number;
    checksumSha256: string;
  }> {
    const storageDir = path.resolve(process.cwd(), env.MEDIA_STORAGE_DIR);
    await fs.mkdir(storageDir, { recursive: true });

    const bundleUrl = await this.getBundle();

    const composition = await selectComposition({
      serveUrl: bundleUrl,
      id: 'MainReel',
      inputProps: input,
    });

    const outputPath = path.join(storageDir, outputFileName);

    await renderMedia({
      composition,
      serveUrl: bundleUrl,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: input,
      imageFormat: 'jpeg',
      pixelFormat: 'yuv420p',
    });

    const fileBuffer = await fs.readFile(outputPath);
    const stats = await fs.stat(outputPath);
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const durationSeconds = composition.durationInFrames / composition.fps;

    return {
      storagePath: outputPath,
      publicUrl: `${env.PUBLIC_MEDIA_BASE_URL}/${outputFileName}`,
      fileSizeBytes: stats.size,
      durationSeconds,
      width: composition.width,
      height: composition.height,
      checksumSha256: checksum,
    };
  }
}

export const remotionService = new RemotionService();

