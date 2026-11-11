import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('🎬 Starting Render of 12-Second Motion Graphics Video: Linux /etc Directory\n');

  const entryPoint = path.resolve(__dirname, '../src/index.ts');
  const rootDir = path.resolve(__dirname, '../../../');
  const outputDir = path.resolve(rootDir, 'renders/educational');
  await fs.mkdir(outputDir, { recursive: true });

  console.log(`📦 Bundling Remotion project from ${entryPoint}...`);
  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (config) => ({
      ...config,
      resolve: {
        ...config.resolve,
        extensionAlias: {
          '.js': ['.ts', '.tsx', '.js'],
          '.jsx': ['.tsx', '.jsx'],
        },
      },
    }),
  });
  console.log('✅ Bundle created successfully.\n');

  const compositionsToRender = [
    {
      id: 'LinuxEtcMotionGraphics',
      fileName: 'linux-etc-12s-reference-style.mp4',
      title: 'Linux /etc Directory (Reference Coral Palette)',
    },
    {
      id: 'LinuxEtcLearnOps',
      fileName: 'linux-etc-12s-learnops-style.mp4',
      title: 'Linux /etc Directory (LearnOps Purple Palette)',
    },
  ];

  for (const item of compositionsToRender) {
    console.log(`🎥 Selecting composition: ${item.id} (${item.title})...`);
    const startTime = Date.now();

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: item.id,
    });

    const outputPath = path.join(outputDir, item.fileName);
    console.log(`⏳ Rendering ${composition.durationInFrames} frames (${composition.durationInFrames / composition.fps}s) @ ${composition.fps}fps to:`);
    console.log(`   ${outputPath}`);

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      imageFormat: 'jpeg',
      pixelFormat: 'yuv420p',
    });

    const stats = await fs.stat(outputPath);
    const renderTime = (Date.now() - startTime) / 1000;

    console.log(`✅ Finished ${item.id}:`);
    console.log(`   Path: ${outputPath}`);
    console.log(`   Duration: ${composition.durationInFrames / composition.fps}s (${composition.durationInFrames} frames)`);
    console.log(`   Resolution: ${composition.width}x${composition.height} (9:16 Vertical)`);
    console.log(`   Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB (${stats.size} bytes)`);
    console.log(`   Render Time: ${renderTime.toFixed(2)}s\n`);
  }

  console.log('🎉 All Educational Motion Graphics Reels Rendered Successfully!');
}

main().catch((err) => {
  console.error('❌ Render failed:', err);
  process.exit(1);
});
