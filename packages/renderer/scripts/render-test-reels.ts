import path from 'node:path';
import fs from 'node:fs/promises';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';

async function main() {
  console.log('🚀 Starting Test 2: Multi-Topic Remotion Renderer Validation\n');

  const entryPoint = path.resolve(process.cwd(), 'src/index.ts');
  const outputDir = path.resolve(process.cwd(), '../../renders/test2');
  await fs.mkdir(outputDir, { recursive: true });

  console.log(`📦 Bundling Remotion project from ${entryPoint}...`);
  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });
  console.log('✅ Bundle created successfully.\n');

  const testCompositions = [
    {
      id: 'Test2-LinuxEtc',
      fileName: 'linux-etc-directory.mp4',
      topic: 'Linux: What is /etc?',
    },
    {
      id: 'Test2-DockerContainer',
      fileName: 'docker-what-is-a-container.mp4',
      topic: 'Docker: What is a Container?',
    },
    {
      id: 'Test2-DevOpsCICD',
      fileName: 'devops-what-is-cicd.mp4',
      topic: 'DevOps: What is CI/CD?',
    },
  ];

  const results: Array<{
    topic: string;
    compositionId: string;
    outputPath: string;
    durationSeconds: number;
    totalFrames: number;
    fps: number;
    dimensions: string;
    fileSizeBytes: number;
    renderTimeSeconds: number;
  }> = [];

  for (const comp of testCompositions) {
    console.log(`🎬 Rendering Composition [${comp.id}] — "${comp.topic}"...`);
    const startTime = Date.now();

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: comp.id,
    });

    const outputPath = path.join(outputDir, comp.fileName);

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

    const result = {
      topic: comp.topic,
      compositionId: comp.id,
      outputPath,
      durationSeconds: composition.durationInFrames / composition.fps,
      totalFrames: composition.durationInFrames,
      fps: composition.fps,
      dimensions: `${composition.width}x${composition.height}`,
      fileSizeBytes: stats.size,
      renderTimeSeconds: Number(renderTime.toFixed(2)),
    };

    results.push(result);
    console.log(`✅ Finished ${comp.id}:`);
    console.log(`   Output: ${outputPath}`);
    console.log(`   Duration: ${result.durationSeconds}s (${result.totalFrames} frames @ ${result.fps}fps)`);
    console.log(`   Dimensions: ${result.dimensions}`);
    console.log(`   Size: ${(result.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`   Render Time: ${result.renderTimeSeconds}s\n`);
  }

  console.log('================================================================');
  console.log('🎉 Test 2 Summary — All 3 Educational Reels Successfully Rendered');
  console.log('================================================================');
  console.table(
    results.map((r) => ({
      Topic: r.topic,
      Duration: `${r.durationSeconds}s`,
      Resolution: r.dimensions,
      'Size (MB)': (r.fileSizeBytes / (1024 * 1024)).toFixed(2),
      'Render Time': `${r.renderTimeSeconds}s`,
      File: path.basename(r.outputPath),
    }))
  );

  // Write summary metadata report
  const reportPath = path.join(outputDir, 'test2-manifest.json');
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`📝 Manifest written to ${reportPath}`);
}

main().catch((err) => {
  console.error('❌ Error during Test 2 render execution:', err);
  process.exit(1);
});

