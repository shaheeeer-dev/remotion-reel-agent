import { env } from '../config/env.js';
import { prisma } from '../prisma/client.js';
import { decryptToken } from '../utils/crypto.js';

export interface InstagramPublishResult {
  success: boolean;
  containerId?: string;
  mediaId?: string;
  error?: string;
}

export class InstagramService {
  /**
   * Check connection and eligibility status for a brand's connected Instagram account
   */
  async checkEligibility(socialAccountId: string): Promise<{
    isEligible: boolean;
    accountType?: string;
    username?: string;
    reasons?: string[];
  }> {
    const account = await prisma.socialAccount.findUnique({
      where: { id: socialAccountId },
    });

    if (!account) {
      return {
        isEligible: false,
        reasons: ['Social account not found in database.'],
      };
    }

    const token = account.encryptedToken
      ? decryptToken(account.encryptedToken)
      : env.META_ACCESS_TOKEN;

    if (!token) {
      return {
        isEligible: false,
        reasons: ['No valid Meta access token found. Please connect your Instagram Business account.'],
      };
    }

    try {
      // Validate token with Meta Graph API
      const res = await fetch(
        `https://graph.facebook.com/${env.META_GRAPH_API_VERSION}/me?fields=id,name&access_token=${token}`
      );
      const data = (await res.json()) as any;

      if (!res.ok || data.error) {
        return {
          isEligible: false,
          reasons: [data.error?.message || 'Meta token validation failed with provider.'],
        };
      }

      return {
        isEligible: true,
        accountType: 'BUSINESS',
        username: account.accountUsername,
        reasons: [],
      };
    } catch (err: any) {
      return {
        isEligible: false,
        reasons: [`Could not contact Meta Graph API: ${err.message}`],
      };
    }
  }

  /**
   * Publishes an MP4 video to Instagram Reels via Graph API container flow
   */
  async publishReel(options: {
    videoUrl: string;
    caption: string;
    idempotencyKey: string;
    accessToken?: string;
    igUserId?: string;
  }): Promise<InstagramPublishResult> {
    console.log(`[InstagramService] Initiating publish container flow (idempotency: ${options.idempotencyKey})...`);

    const token = options.accessToken || env.META_ACCESS_TOKEN;
    const igUserId = options.igUserId || env.META_IG_USER_ID;

    if (!token || !igUserId) {
      const errMsg = 'META_ACCESS_TOKEN and META_IG_USER_ID are required to publish. Live publishing cannot proceed without verified credentials.';
      console.error(`[InstagramService] ${errMsg}`);
      return {
        success: false,
        error: errMsg,
      };
    }

    let containerId: string | undefined;
    try {
      // Step 1: Create Reel Media Container
      const createContainerUrl = `https://graph.facebook.com/${env.META_GRAPH_API_VERSION}/${igUserId}/media`;
      const containerResponse = await fetch(createContainerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_type: 'REELS',
          video_url: options.videoUrl,
          caption: options.caption,
          share_to_feed: true,
          access_token: token,
        }),
      });

      const containerData = (await containerResponse.json()) as any;
      if (!containerResponse.ok || !containerData.id) {
        throw new Error(containerData.error?.message || 'Failed to create Instagram media container');
      }

      containerId = containerData.id;
      console.log(`[InstagramService] Container created: ${containerId}. Polling status...`);

      // Step 2: Poll container status until FINISHED or ERROR
      let isReady = false;
      let attempts = 0;
      while (!isReady && attempts < 25) {
        attempts++;
        await new Promise((r) => setTimeout(r, 4000));

        const statusUrl = `https://graph.facebook.com/${env.META_GRAPH_API_VERSION}/${containerId}?fields=status_code&access_token=${token}`;
        const statusRes = await fetch(statusUrl);
        const statusData = (await statusRes.json()) as any;

        if (statusData.status_code === 'FINISHED') {
          isReady = true;
          break;
        } else if (statusData.status_code === 'ERROR') {
          throw new Error('Instagram failed to process video container');
        }
      }

      if (!isReady) {
        throw new Error('Timeout waiting for Instagram to process video container');
      }

      // Step 3: Publish container
      const publishUrl = `https://graph.facebook.com/${env.META_GRAPH_API_VERSION}/${igUserId}/media_publish`;
      const publishRes = await fetch(publishUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: token,
        }),
      });

      const publishData = (await publishRes.json()) as any;
      if (!publishRes.ok || !publishData.id) {
        throw new Error(publishData.error?.message || 'Failed to publish Instagram media container');
      }

      console.log(`[InstagramService] Reel published successfully: Media ID ${publishData.id}`);
      return {
        success: true,
        containerId,
        mediaId: publishData.id,
      };
    } catch (err: any) {
      console.error('[InstagramService] Publish error:', err?.message || err);
      return {
        success: false,
        error: err?.message || 'Unknown error during Instagram publish',
        containerId,
      };
    }
  }
}

export const instagramService = new InstagramService();
