import { env } from '../config/env.js';
import { prisma } from '../prisma/client.js';
import { queueService } from './queue.service.js';

export class SchedulerService {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(
      `⏱️ Daily scheduler started. Configured publish time: ${env.DAILY_PUBLISH_TIME} (${env.SCHEDULER_TIMEZONE})`
    );

    // Check every 60 seconds
    this.timer = setInterval(() => {
      this.checkAndTriggerDailySchedules().catch((err) => {
        console.error('[Scheduler] Error during schedule check:', err);
      });
    }, 60 * 1000);

    // Initial check on boot
    this.checkAndTriggerDailySchedules().catch(() => {});
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('⏱️ Daily scheduler stopped.');
  }

  private async checkAndTriggerDailySchedules() {
    const [targetHour, targetMinute] = env.DAILY_PUBLISH_TIME.split(':').map(Number);
    const now = new Date();

    // Format current time in configured timezone
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: env.SCHEDULER_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const dateObj: Record<string, string> = {};
    for (const part of parts) {
      dateObj[part.type] = part.value;
    }

    const currentHour = Number(dateObj.hour);
    const currentMinute = Number(dateObj.minute);
    const todayDateStr = `${dateObj.year}-${dateObj.month}-${dateObj.day}`;

    // Only trigger if matching the configured hour & minute
    if (currentHour !== targetHour || currentMinute !== targetMinute) {
      return;
    }

    console.log(`[Scheduler] Daily trigger matched for ${todayDateStr} ${env.DAILY_PUBLISH_TIME}...`);

    const activeBrands = await prisma.brand.findMany({
      where: { isActive: true },
    });

    for (const brand of activeBrands) {
      const idempotencyKey = `daily:${brand.id}:${todayDateStr}`;

      // Check if already enqueued today
      const existingJob = await prisma.jobRun.findUnique({
        where: { idempotencyKey },
      });

      if (existingJob) {
        continue;
      }

      console.log(`[Scheduler] Enqueuing daily schedule for brand "${brand.displayName}" (${idempotencyKey})`);
      await queueService.enqueueJob('DAILY_SCHEDULE', { brandId: brand.id }, idempotencyKey);
    }
  }
}

export const schedulerService = new SchedulerService();
