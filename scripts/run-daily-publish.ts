import { PrismaClient } from '@prisma/client';
import { geminiService } from '../apps/api/src/services/gemini.service.js';
import { ttsService } from '../apps/api/src/services/tts.service.js';
import { remotionService } from '../apps/api/src/services/remotion.service.js';
import { cloudinaryService } from '../apps/api/src/services/cloudinary.service.js';
import { instagramService } from '../apps/api/src/services/instagram.service.js';
import { topicDiscoveryService } from '../apps/api/src/services/topic-discovery.service.js';
import { decryptToken } from '../apps/api/src/utils/crypto.js';
import { env } from '../apps/api/src/config/env.js';
import { REEL_STATUS } from '@learnops/schema';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('\n=============================================================');
  console.log('🚀 LEARN OPS DAILY REEL AUTOMATION PIPELINE');
  console.log(`⏰ Executing at: ${new Date().toISOString()}`);
  console.log('=============================================================\n');

  // 1. Fetch Brand Configuration
  const brand = await prisma.brand.findFirst({
    include: { profile: true, socialAccounts: true },
  });

  if (!brand) {
    throw new Error('❌ Fatal: No Brand record found in database. Run database seed or create a Brand first.');
  }

  console.log(`[1/8] Brand Loaded: "${brand.displayName}" (${brand.name})`);

  // Check today's date in Brand's timezone (Asia/Karachi)
  const brandTz = brand.timezone || env.SCHEDULER_TIMEZONE || 'Asia/Karachi';
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: brandTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour12: false,
  });
  const dateStr = formatter.format(new Date());
  const isForce = process.env.FORCE_PUBLISH === 'true';
  const dailyScheduleKey = isForce
    ? `daily:${brand.id}:${dateStr}-${Date.now()}`
    : `daily:${brand.id}:${dateStr}`;

  console.log(`      Timezone: ${brandTz} | Today's Key: ${dailyScheduleKey}${isForce ? ' (FORCE_PUBLISH active)' : ''}`);

  // Prevent duplicate runs on the same calendar day (unless FORCE_PUBLISH is active)
  if (!isForce) {
    const existingJob = await prisma.jobRun.findUnique({
      where: { idempotencyKey: dailyScheduleKey },
    });
    if (existingJob && existingJob.status === 'SUCCEEDED') {
      console.log(`⚠️ Note: Daily Reel for date "${dateStr}" has already been published. Exiting cleanly.`);
      return;
    }
  }

  const jobRun = await prisma.jobRun.upsert({
    where: { idempotencyKey: dailyScheduleKey },
    update: { status: 'RUNNING', startedAt: new Date() },
    create: {
      idempotencyKey: dailyScheduleKey,
      jobType: 'DAILY_SCHEDULE',
      status: 'RUNNING',
      brandId: brand.id,
      startedAt: new Date(),
    },
  });

  try {
    // 2. Select Next Topic from Pool
    console.log('\n[2/8] Selecting next optimal, non-repeated topic from topic pool...');
    const selectedTopic = await topicDiscoveryService.selectNextTopicForProduction(brand.id);

    if (!selectedTopic) {
      throw new Error('❌ Fatal: No unused topic available in topic pool and replenishment failed.');
    }

    console.log(`✅ Selected Topic:`);
    console.log(`   - Title: "${selectedTopic.title}"`);
    console.log(`   - Category: ${selectedTopic.category}`);
    console.log(`   - Audience Level: ${selectedTopic.audienceLevel}`);
    console.log(`   - Visual Metaphor: ${selectedTopic.visualMetaphor}`);
    console.log(`   - Priority Score: ${selectedTopic.priorityScore}/100`);

    // 3. Grounded Script Generation via Gemini
    console.log('\n[3/8] Generating technical script with Gemini (Failover & Retry active)...');
    const approvedDocs = await prisma.knowledgeDocument.findMany({
      where: { brandId: brand.id, isApproved: true },
    });

    const script = await geminiService.generateReelScript({
      topic: selectedTopic.title,
      category: selectedTopic.category,
      brandName: brand.displayName,
      brandTone: brand.profile?.voiceTone || 'energetic',
      brandAudience: brand.profile?.audience || 'junior-to-mid',
      targetDurationSeconds: 16,
      approvedKnowledge: approvedDocs.map((d) => ({ title: d.title, content: d.content })),
    });

    console.log(`✅ Script generated successfully: "${script.topic}"`);
    console.log(`   - Hook: "${script.hook}"`);
    console.log(`   - Scenes: ${script.scenes.length} scenes`);
    console.log(`   - Total Estimated Duration: ~${script.durationSeconds}s`);

    // Create Reel in Database
    const reel = await prisma.reel.create({
      data: {
        brandId: brand.id,
        topicId: selectedTopic.id,
        title: script.topic,
        hook: script.hook || script.topic,
        caption: script.caption,
        hashtags: script.hashtags,
        durationSeconds: script.durationSeconds,
        scriptJson: script as any,
        modelName: env.GEMINI_MODEL,
        status: REEL_STATUS.RENDERING,
      },
    });

    for (let idx = 0; idx < script.scenes.length; idx++) {
      const sc = script.scenes[idx];
      await prisma.scene.create({
        data: {
          reelId: reel.id,
          sequence: idx,
          kind: sc.kind,
          durationSeconds: sc.durationSeconds,
          propsJson: sc as any,
        },
      });
    }

    // Mark topic as used
    await prisma.topic.update({
      where: { id: selectedTopic.id },
      data: { isUsed: true, lastUsedAt: new Date() },
    });

    // 4. Voiceover Synthesis via Kokoro TTS
    const voiceId = brand.profile?.voiceId || 'am_fenrir';
    console.log(`\n[4/8] Synthesizing human voiceover with Kokoro TTS (Voice: ${voiceId})...`);
    const { sceneAudios, masterAudio } = await ttsService.synthesizeReelAudio(
      reel.id,
      script.scenes,
      voiceId
    );
    script.durationSeconds = script.scenes.reduce((sum: number, s: any) => sum + s.durationSeconds, 0);
    console.log(`✅ Voiceover synthesized: Master audio duration: ${masterAudio.durationSeconds.toFixed(2)}s`);

    // 5. Video Rendering via Remotion
    console.log('\n[5/8] Rendering 1080x1920 MP4 video with Remotion...');
    const renderInput = {
      reelId: reel.id,
      brand: {
        name: brand.displayName,
        primaryColor: brand.profile?.primaryColor || '#783CEB',
        secondaryColor: brand.profile?.secondaryColor || '#B28BFF',
        backgroundColor: brand.profile?.bgColor || '#110F17',
        textColor: '#FFFFFF',
        fontFamily: brand.profile?.fontFamily || 'Inter',
        creatorCredit: env.REPO_CREDIT_URL,
      },
      script,
      sceneAudios,
      masterAudio,
    };

    const outputFileName = `reel_${reel.id}_${Date.now()}.mp4`;
    const renderResult = await remotionService.renderReelVideo(renderInput, outputFileName);
    console.log(`✅ Video rendered successfully: ${(renderResult.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`);

    let finalPublicUrl = renderResult.publicUrl;

    // 6. Upload to Cloudinary for Public HTTPS Delivery
    console.log('\n[6/8] Uploading video to Cloudinary for public HTTPS delivery...');
    if (cloudinaryService.isConfigured()) {
      try {
        const upload = await cloudinaryService.uploadVideo(
          renderResult.storagePath,
          `reel_${reel.id}`
        );
        finalPublicUrl = upload.publicUrl;
        console.log(`✅ Cloudinary upload complete: ${finalPublicUrl}`);
      } catch (cloudErr: any) {
        console.warn('⚠️ Cloudinary upload warning:', cloudErr.message);
      }
    } else {
      console.warn('⚠️ Cloudinary is not configured. Falling back to local/default media URL.');
    }

    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        reelId: reel.id,
        storagePath: renderResult.storagePath,
        publicUrl: finalPublicUrl,
        fileSizeBytes: BigInt(renderResult.fileSizeBytes),
        width: renderResult.width,
        height: renderResult.height,
        durationSeconds: renderResult.durationSeconds,
        checksumSha256: renderResult.checksumSha256,
      },
    });

    await prisma.reel.update({
      where: { id: reel.id },
      data: { status: REEL_STATUS.APPROVED },
    });

    // 7. Publish to Instagram via Graph API
    console.log('\n[7/8] Publishing Reel to Instagram (@learnops_dev)...');
    const socialAccount = brand.socialAccounts.find(
      (acc) => acc.platform === 'INSTAGRAM' && acc.isConnected
    );

    let accessToken = env.META_ACCESS_TOKEN;
    if (!accessToken && socialAccount?.encryptedToken) {
      try {
        accessToken = decryptToken(socialAccount.encryptedToken);
      } catch (err: any) {
        console.warn('⚠️ Token decryption warning:', err.message);
      }
    } else if (socialAccount?.encryptedToken && !accessToken) {
      accessToken = decryptToken(socialAccount.encryptedToken);
    }

    const igUserId = env.META_IG_USER_ID || socialAccount?.providerUserId || '17841429087138843';

    if (!finalPublicUrl.startsWith('https://')) {
      console.warn('⚠️ Video URL is not HTTPS. Skipping live Instagram publish.');
    } else if (!accessToken || !igUserId) {
      console.warn('⚠️ Instagram credentials not found. Skipping live publish.');
    } else {
      const idempotencyKey = `pub_${reel.id}_${Date.now()}`;
      const captionText = `${reel.caption}\n\n${reel.hashtags.map((h) => `#${h}`).join(' ')}`;

      const publishRes = await instagramService.publishReel({
        videoUrl: finalPublicUrl,
        caption: captionText,
        idempotencyKey,
        accessToken,
        igUserId,
      });

      if (publishRes.success) {
        console.log(`🎉 LIVE PUBLISH SUCCEEDED! Reel ID: ${publishRes.mediaId || publishRes.containerId}`);
        await prisma.reel.update({
          where: { id: reel.id },
          data: { status: REEL_STATUS.PUBLISHED, publishedAt: new Date() },
        });

        await prisma.topic.update({
          where: { id: selectedTopic.id },
          data: { status: 'PUBLISHED' },
        });

        if (socialAccount) {
          await prisma.publishAttempt.create({
            data: {
              reelId: reel.id,
              socialAccountId: socialAccount.id,
              status: 'PUBLISHED',
              idempotencyKey,
              remoteMediaId: publishRes.mediaId || publishRes.containerId,
              publishedAt: new Date(),
            },
          });
        }
      } else {
        console.error(`❌ Instagram publish failed: ${publishRes.error}`);
        await prisma.reel.update({
          where: { id: reel.id },
          data: { status: REEL_STATUS.FAILED },
        });
      }
    }

    // 8. Backlog Replenishment Check
    console.log('\n[8/8] Checking topic backlog health...');
    const queuedCount = await prisma.topic.count({
      where: { brandId: brand.id, status: 'QUEUED', isUsed: false },
    });
    console.log(`Current Queued Topics remaining: ${queuedCount}`);

    if (queuedCount < 20) {
      console.log(`⚠️ Backlog (${queuedCount}) is below target threshold of 20. Replenishing backlog...`);
      await topicDiscoveryService.replenishBacklog(brand.id, 25);
    } else {
      console.log('✅ Backlog health is strong (>20 topics). No replenishment needed today.');
    }

    // Mark JobRun as SUCCEEDED
    await prisma.jobRun.update({
      where: { id: jobRun.id },
      data: { status: 'SUCCEEDED', completedAt: new Date() },
    });

    console.log('\n=============================================================');
    console.log('✨ DAILY PIPELINE RUN COMPLETE & SUCCEEDED!');
    console.log('=============================================================\n');
  } catch (err: any) {
    console.error('\n❌ Fatal error in daily pipeline execution:', err);
    await prisma.jobRun.update({
      where: { id: jobRun.id },
      data: { status: 'FAILED', completedAt: new Date(), errorMessage: err.message },
    }).catch(() => {});
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
