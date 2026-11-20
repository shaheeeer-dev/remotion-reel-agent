import { prisma } from '../apps/api/src/prisma/client.js';
import { geminiService } from '../apps/api/src/services/gemini.service.js';
import { ttsService } from '../apps/api/src/services/tts.service.js';
import { remotionService } from '../apps/api/src/services/remotion.service.js';
import crypto from 'node:crypto';
import path from 'node:path';

async function main() {
  console.log('🎬 Starting Controlled End-to-End Test (LearnOps + General DevOps)...\n');

  const brand = await prisma.brand.findFirstOrThrow({
    where: { slug: 'learnops' },
    include: { profile: true },
  });

  // 1. Select 1 LearnOps Lesson topic
  const learnopsTopic = await prisma.topic.findFirstOrThrow({
    where: {
      brandId: brand.id,
      sourceType: 'LEARNOPS_LESSON',
      status: { in: ['QUEUED', 'DISCOVERED', 'IN_PRODUCTION'] },
    },
    include: {
      documents: { include: { document: true } },
    },
    orderBy: { priorityScore: 'desc' },
  });

  // 2. Select 1 General DevOps topic
  const devopsTopic = await prisma.topic.findFirstOrThrow({
    where: {
      brandId: brand.id,
      sourceType: 'GENERAL_DEVOPS',
      status: { in: ['QUEUED', 'DISCOVERED', 'IN_PRODUCTION'] },
    },
    include: {
      documents: { include: { document: true } },
    },
    orderBy: { priorityScore: 'desc' },
  });

  const testJobs = [
    { type: 'LEARNOPS_LESSON', topic: learnopsTopic, tag: 'learnops_test' },
    { type: 'GENERAL_DEVOPS', topic: devopsTopic, tag: 'devops_test' },
  ];

  for (const job of testJobs) {
    const { topic, type, tag } = job;
    console.log(`\n=======================================================`);
    console.log(`🚀 Processing [${type}]: "${topic.title}" (Score: ${topic.priorityScore})`);
    console.log(`=======================================================`);

    // Transition topic to IN_PRODUCTION
    await prisma.topic.update({
      where: { id: topic.id },
      data: { status: 'IN_PRODUCTION' },
    });

    const reelId = crypto.randomUUID();
    console.log(`📌 Generated Reel ID: ${reelId}`);

    // Fetch context documents
    const docContext = topic.documents.map((d: any) => d.document.content).join('\n\n');

    console.log(`🤖 Generating script with Gemini...`);
    const script = await geminiService.generateReelScript({
      topic: topic.title,
      category: topic.category,
      brandName: brand.displayName,
      brandTone: 'Clear, technical, authoritative, encouraging',
      brandAudience: 'Beginner to intermediate Linux & DevOps learners',
      targetDurationSeconds: 16,
      approvedKnowledge: topic.documents.map((d: any) => ({
        title: d.document.title,
        content: d.document.content,
      })),
    });

    console.log(`✅ Script generated: "${script.topic}" with ${script.scenes.length} scenes.`);

    console.log(`🎙️ Synthesizing scene-aligned audio with Kokoro TTS...`);
    const audioResult = await ttsService.synthesizeReelAudio(
      reelId,
      script.scenes,
      brand.voiceProfile || 'am_adam'
    );

    console.log(`✅ Master audio generated: ${audioResult.masterAudio.durationSeconds}s`);

    const outputFileName = `reel_${tag}_${reelId.slice(0, 8)}.mp4`;
    console.log(`🎥 Rendering Remotion video (${outputFileName})...`);

    const renderResult = await remotionService.renderReelVideo(
      {
        script,
        brand: {
          id: brand.id,
          name: brand.displayName,
          primaryColor: brand.profile?.primaryColor || '#6F41EC',
          secondaryColor: brand.profile?.secondaryColor || '#C4B5FD',
          backgroundColor: brand.profile?.bgColor || '#0B0F17',
          brandColor: brand.profile?.primaryColor || '#6F41EC',
          handle: brand.instagramHandle || '@learnops.dev',
        },
        masterAudio: audioResult.masterAudio,
      },
      outputFileName
    );

    console.log(`🎉 Render completed!`);
    console.log(`   Path: ${renderResult.storagePath}`);
    console.log(`   Size: ${(renderResult.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`   Duration: ${renderResult.durationSeconds}s`);

    // Transition topic to PUBLISHED
    await prisma.topic.update({
      where: { id: topic.id },
      data: {
        status: 'PUBLISHED',
        isUsed: true,
      },
    });

    // Create Reel record in DB
    await prisma.reel.create({
      data: {
        id: reelId,
        brandId: brand.id,
        topicId: topic.id,
        title: script.topic,
        hook: script.hook || script.topic,
        scriptJson: script as any,
        caption: script.caption,
        hashtags: script.hashtags,
        status: 'RENDERED',
        durationSeconds: Math.round(renderResult.durationSeconds),
      },
    });

    await prisma.mediaAsset.create({
      data: {
        reelId,
        storagePath: renderResult.storagePath,
        publicUrl: renderResult.publicUrl,
        fileSizeBytes: BigInt(renderResult.fileSizeBytes),
        width: renderResult.width,
        height: renderResult.height,
        durationSeconds: renderResult.durationSeconds,
      },
    });

    console.log(`💾 Saved Reel and MediaAsset, marked Topic as PUBLISHED.`);

    // Extract validation frames and silence detection report
    try {
      const artifactDir = '/Users/shaheer/.gemini/antigravity/brain/4de3041e-31a5-4726-b56e-a3a4b24a5cdb';
      const videoPath = renderResult.storagePath;
      const { execSync } = await import('node:child_process');

      console.log(`📸 Extracting verification frames for [${tag}]...`);
      execSync(`ffmpeg -y -ss 00:00:01 -i "${videoPath}" -vframes 1 "${artifactDir}/${tag}_frame_hook.png" 2>/dev/null`);
      execSync(`ffmpeg -y -ss 00:00:05 -i "${videoPath}" -vframes 1 "${artifactDir}/${tag}_frame_content.png" 2>/dev/null`);
      execSync(`ffmpeg -y -ss 00:00:10 -i "${videoPath}" -vframes 1 "${artifactDir}/${tag}_frame_terminal.png" 2>/dev/null`);
      const outroTimestamp = Math.max(1, Math.floor(renderResult.durationSeconds - 1));
      execSync(`ffmpeg -y -ss ${outroTimestamp} -i "${videoPath}" -vframes 1 "${artifactDir}/${tag}_frame_outro.png" 2>/dev/null`);
      console.log(`✅ Extracted verification frames to artifact directory.`);

      // Silence detection report
      const silenceOutput = execSync(`ffmpeg -i "${videoPath}" -af silencedetect=noise=-30dB:d=0.25 -f null - 2>&1 || true`).toString();
      const silenceMatches = [...silenceOutput.matchAll(/silence_duration: ([\d\.]+)/g)].map((m) => m[1]);
      console.log(`🔊 Silence pauses detected between scenes: ${silenceMatches.join('s, ')}s`);
    } catch (verifErr: any) {
      console.warn(`⚠️ Frame extraction warning:`, verifErr.message);
    }
  }

  console.log('\n=======================================================');
  console.log('✅ Controlled End-to-End Test Succeeded for Both Pipelines!');
  console.log('=======================================================\n');

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('❌ Controlled test failed:', err);
  process.exit(1);
});
