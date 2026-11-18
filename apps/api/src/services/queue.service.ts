import { Queue, Worker, type Job } from 'bullmq';
import { env } from '../config/env.js';
import { prisma } from '../prisma/client.js';
import { geminiService } from './gemini.service.js';
import { remotionService } from './remotion.service.js';
import { ttsService } from './tts.service.js';
import { instagramService } from './instagram.service.js';
import { REEL_STATUS, type ReelRenderInput } from '@learnops/schema';
import { decryptToken } from '../utils/crypto.js';

const QUEUE_NAME = process.env.QUEUE_NAME || 'social-reels-queue';

export class QueueService {
  private queue: Queue | null = null;
  private worker: Worker | null = null;
  private isRedisConnected = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      const connection = { url: env.REDIS_URL };

      this.queue = new Queue(QUEUE_NAME, {
        connection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: 100,
          removeOnFail: 200,
        },
      });

      this.worker = new Worker(
        QUEUE_NAME,
        async (job: Job) => {
          return this.processJob(job);
        },
        {
          connection,
          concurrency: env.WORKER_CONCURRENCY,
        }
      );

      this.worker.on('completed', (job) => {
        console.log(`[Worker] Job ${job.id} (${job.name}) completed successfully.`);
      });

      this.worker.on('failed', (job, err) => {
        console.error(`[Worker] Job ${job?.id} (${job?.name}) failed:`, err);
      });

      this.isRedisConnected = true;
      console.log('✅ BullMQ Queue and Worker initialized.');
    } catch (err) {
      console.warn('⚠️ Redis not available. Queue will run in synchronous fallback mode.', err);
      this.isRedisConnected = false;
    }
  }

  async enqueueJob(name: string, data: any, idempotencyKey: string) {
    // Record in durable JobRun table
    await prisma.jobRun.upsert({
      where: { idempotencyKey },
      update: { status: 'QUEUED', jobType: name },
      create: {
        idempotencyKey,
        jobType: name,
        status: 'QUEUED',
        brandId: data.brandId,
        reelId: data.reelId,
      },
    });

    if (this.queue && this.isRedisConnected) {
      try {
        const job = await this.queue.add(name, { ...data, idempotencyKey }, {
          jobId: idempotencyKey.replace(/[^A-Za-z0-9_-]/g, '_'),
          attempts: name === 'PUBLISH_REEL' ? 1 : 3,
        });
        await prisma.jobRun.update({
          where: { idempotencyKey },
          data: { bullMqJobId: job.id },
        });
        return { jobId: job.id, idempotencyKey };
      } catch (err) {
        console.warn('Falling back to synchronous processing due to Redis error:', err);
      }
    }

    // Synchronous execution fallback
    setImmediate(async () => {
      try {
        await this.processJob({ id: idempotencyKey, name, data: { ...data, idempotencyKey } } as any);
      } catch (e: any) {
        console.error('Synchronous job processing error:', e);
      }
    });

    return { jobId: idempotencyKey, idempotencyKey };
  }

  private async processJob(job: Job) {
    const { idempotencyKey, reelId, brandId, topicId } = job.data;
    console.log(`[Queue] Processing job: ${job.name} (Reel: ${reelId})`);

    await prisma.jobRun.update({
      where: { idempotencyKey },
      data: { status: 'RUNNING', startedAt: new Date() },
    });

    try {
      switch (job.name) {
        case 'GENERATE_SCRIPT': {
          const brand = await prisma.brand.findUnique({
            where: { id: brandId },
            include: { profile: true },
          });
          const topic = topicId ? await prisma.topic.findUnique({ where: { id: topicId } }) : null;
          const approvedDocs = await prisma.knowledgeDocument.findMany({
            where: { brandId, isApproved: true },
          });

          const script = await geminiService.generateReelScript({
            topic: topic?.title || 'Core Architecture Overview',
            category: topic?.category || 'DevOps',
            brandName: brand?.displayName || 'Brand',
            brandTone: brand?.profile?.voiceTone,
            brandAudience: brand?.profile?.audience,
            targetDurationSeconds: brand?.defaultDuration || 16,
            approvedKnowledge: approvedDocs.map((d) => ({ title: d.title, content: d.content })),
          });

          let reel = reelId ? await prisma.reel.findUnique({ where: { id: reelId } }) : null;
          if (!reel) {
            reel = await prisma.reel.create({
              data: {
                brandId,
                topicId,
                title: script.topic,
                hook: script.hook,
                caption: script.caption,
                hashtags: script.hashtags,
                durationSeconds: script.durationSeconds,
                scriptJson: script as any,
                modelName: env.GEMINI_MODEL,
                status: REEL_STATUS.SCRIPT_READY,
              },
            });
          } else {
            await prisma.reel.update({
              where: { id: reel.id },
              data: {
                title: script.topic,
                hook: script.hook,
                caption: script.caption,
                hashtags: script.hashtags,
                durationSeconds: script.durationSeconds,
                scriptJson: script as any,
                modelName: env.GEMINI_MODEL,
                status: REEL_STATUS.SCRIPT_READY,
              },
            });
          }

          // Replace scene records
          await prisma.scene.deleteMany({ where: { reelId: reel.id } });
          for (let i = 0; i < script.scenes.length; i++) {
            const sc = script.scenes[i];
            await prisma.scene.create({
              data: {
                reelId: reel.id,
                sequence: i,
                kind: sc.kind,
                durationSeconds: sc.durationSeconds,
                propsJson: sc as any,
              },
            });
          }

          if (topicId) {
            await prisma.topic.update({
              where: { id: topicId },
              data: { isUsed: true, lastUsedAt: new Date() },
            });
          }
          break;
        }

        case 'RENDER_VIDEO': {
          const reel = await prisma.reel.findUniqueOrThrow({
            where: { id: reelId },
            include: { brand: { include: { profile: true } } },
          });

          const profile = reel.brand.profile;
          if (!profile?.primaryColor || !profile?.secondaryColor || !profile?.bgColor) {
            throw new Error(
              `Cannot render reel "${reel.title}": Brand profile for "${reel.brand.displayName}" is missing required theme colors (` +
              `primaryColor: ${profile?.primaryColor ?? 'missing'}, ` +
              `secondaryColor: ${profile?.secondaryColor ?? 'missing'}, ` +
              `bgColor: ${profile?.bgColor ?? 'missing'}). ` +
              `Please configure Reel Colors in Brand Profile settings before generating videos.`
            );
          }

          await prisma.reel.update({
            where: { id: reel.id },
            data: { status: REEL_STATUS.RENDERING },
          });

          const script = reel.scriptJson as any;
          const voiceId = profile?.voiceId || undefined;

          // Build continuous story narrative: prefer script.narrationText or join scene voiceovers
          const fullStoryText =
            script.narrationText?.trim() ||
            (script.scenes || []).map((s: any) => s.voiceover).filter(Boolean).join(' ');

          console.log(`[Queue] Synthesizing continuous story voiceover for reel ${reel.id} (voice: ${voiceId || 'af_heart'})...`);
          const masterAudio = await ttsService.synthesizeStoryAudio(
            reel.id,
            fullStoryText,
            script.durationSeconds || 16,
            voiceId
          );
          console.log(`[Queue] Master story voiceover ready (${masterAudio.durationSeconds}s).`);

          const renderInput: ReelRenderInput = {
            reelId: reel.id,
            brand: {
              name: reel.brand.displayName,
              primaryColor: profile.primaryColor,
              secondaryColor: profile.secondaryColor,
              backgroundColor: profile.bgColor,
              textColor: '#FFFFFF',
              fontFamily: profile.fontFamily || undefined,
              creatorCredit: env.REPO_CREDIT_URL,
            },
            script,
            masterAudio,
          };

          const outputFileName = `reel_${reel.id}_${Date.now()}.mp4`;
          const renderResult = await remotionService.renderReelVideo(renderInput, outputFileName);

          await prisma.mediaAsset.create({
            data: {
              reelId: reel.id,
              storagePath: renderResult.storagePath,
              publicUrl: renderResult.publicUrl,
              fileSizeBytes: BigInt(renderResult.fileSizeBytes),
              width: renderResult.width,
              height: renderResult.height,
              durationSeconds: renderResult.durationSeconds,
              checksumSha256: renderResult.checksumSha256,
            },
          });

          // Transition to NEEDS_REVIEW or APPROVED based on brand autoPublish setting
          const nextStatus = reel.brand.autoPublish ? REEL_STATUS.APPROVED : REEL_STATUS.NEEDS_REVIEW;
          await prisma.reel.update({
            where: { id: reel.id },
            data: { status: nextStatus },
          });
          break;
        }

        case 'PUBLISH_REEL': {
          const reel = await prisma.reel.findUniqueOrThrow({
            where: { id: reelId },
            include: { mediaAssets: true, brand: { include: { socialAccounts: true } } },
          });

          const media = reel.mediaAssets[0];
          if (!media || !media.publicUrl) {
            throw new Error('Reel has no rendered media asset to publish');
          }

          if (reel.status !== REEL_STATUS.APPROVED && reel.status !== REEL_STATUS.SCHEDULED) {
            throw new Error('Only an approved or scheduled Reel can be published.');
          }

          if (!media.publicUrl.startsWith('https://')) {
            throw new Error('Publishing requires a publicly reachable HTTPS media URL.');
          }

          const socialAccount = reel.brand.socialAccounts.find(
            (account) => account.platform === 'INSTAGRAM' && account.isConnected
          );
          if (!socialAccount) {
            throw new Error('No connected Instagram account found for this brand.');
          }

          const accessToken = socialAccount.encryptedToken
            ? decryptToken(socialAccount.encryptedToken)
            : env.META_ACCESS_TOKEN;
          const igUserId = socialAccount.providerUserId !== 'pending_setup'
            ? socialAccount.providerUserId
            : env.META_IG_USER_ID;

          await prisma.reel.update({
            where: { id: reel.id },
            data: { status: REEL_STATUS.PUBLISHING },
          });

          const publishRes = await instagramService.publishReel({
            videoUrl: media.publicUrl,
            caption: `${reel.caption}\n\n${reel.hashtags.map((h) => `#${h}`).join(' ')}`,
            idempotencyKey,
            accessToken,
            igUserId,
          });

          await prisma.publishAttempt.create({
            data: {
              reelId: reel.id,
              socialAccountId: socialAccount.id,
              idempotencyKey,
              status: publishRes.success ? 'PUBLISHED' : 'FAILED',
              remoteMediaId: publishRes.mediaId,
              containerId: publishRes.containerId,
              errorMessage: publishRes.error,
              publishedAt: publishRes.success ? new Date() : null,
            },
          });

          await prisma.reel.update({
            where: { id: reel.id },
            data: {
              status: publishRes.success ? REEL_STATUS.PUBLISHED : REEL_STATUS.FAILED,
              publishedAt: publishRes.success ? new Date() : null,
            },
          });

          if (!publishRes.success) {
            throw new Error(`Instagram publishing failed: ${publishRes.error || 'Provider rejected publish request'}`);
          }
          break;
        }

        case 'DAILY_SCHEDULE': {
          const brand = await prisma.brand.findUniqueOrThrow({ where: { id: brandId } });
          const unusedTopic = await prisma.topic.findFirst({
            where: { brandId, isUsed: false },
            orderBy: { createdAt: 'asc' },
          });

          if (!unusedTopic) {
            console.log(`[Queue] No unused topics found for brand "${brand.displayName}". Daily run completed.`);
            break;
          }

          const genIdempotencyKey = `daily_gen_${brandId}_${unusedTopic.id}_${Date.now()}`;
          await this.enqueueJob(
            'GENERATE_SCRIPT',
            { brandId, topicId: unusedTopic.id },
            genIdempotencyKey
          );
          console.log(`[Queue] Enqueued daily script generation for topic "${unusedTopic.title}".`);
          break;
        }
      }

      await prisma.jobRun.update({
        where: { idempotencyKey },
        data: { status: 'SUCCEEDED', completedAt: new Date() },
      });
    } catch (err: any) {
      console.error(`[Queue] Job ${job.name} failed:`, err);
      await prisma.jobRun.update({
        where: { idempotencyKey },
        data: {
          status: 'FAILED_FINAL',
          errorSummary: err?.message || 'Unknown error occurred',
          completedAt: new Date(),
        },
      });
      throw err;
    }
  }
}

export const queueService = new QueueService();

