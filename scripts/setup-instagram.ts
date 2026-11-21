import readline from 'node:readline';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { encryptToken } from '../apps/api/src/utils/crypto.js';

const prisma = new PrismaClient();

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('\n=============================================================');
  console.log('🚀 LearnOps Instagram Graph API Auto-Setup & Verification');
  console.log('=============================================================\n');

  // Read existing .env if present
  const envPath = path.resolve(process.cwd(), '.env');
  let envContent = '';
  try {
    envContent = await fs.readFile(envPath, 'utf8');
  } catch {
    console.warn('Could not read existing .env file, will create new entries.');
  }

  const existingAppId = envContent.match(/META_APP_ID="?([^"\n]+)"?/)?.[1] || '';
  const existingAppSecret = envContent.match(/META_APP_SECRET="?([^"\n]+)"?/)?.[1] || '';

  const appId = (await prompt(`1. Enter your Meta App ID [${existingAppId || 'none'}]: `)) || existingAppId;
  const appSecret = (await prompt(`2. Enter your Meta App Secret [${existingAppSecret || 'none'}]: `)) || existingAppSecret;
  const shortLivedToken = await prompt('3. Paste the Temporary User Access Token from Graph API Explorer: ');

  if (!appId || !appSecret || !shortLivedToken) {
    console.error('❌ Error: App ID, App Secret, and Access Token are all required.');
    process.exit(1);
  }

  console.log('\n[1/4] Exchanging short-lived token for 60-Day Long-Lived Token...');
  const exchangeUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;

  const exchangeRes = await fetch(exchangeUrl);
  const exchangeData = (await exchangeRes.json()) as any;

  if (!exchangeRes.ok || !exchangeData.access_token) {
    console.error('❌ Failed to exchange token:', exchangeData.error?.message || exchangeData);
    process.exit(1);
  }

  const longLivedToken = exchangeData.access_token;
  const expiresInDays = exchangeData.expires_in ? Math.round(exchangeData.expires_in / 86400) : 60;
  console.log(`✅ Long-lived token acquired! Valid for ~${expiresInDays} days.`);

  console.log('\n[2/4] Discovering connected Facebook Pages & Instagram Business Account...');
  const pagesUrl = `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${longLivedToken}`;
  const pagesRes = await fetch(pagesUrl);
  const pagesData = (await pagesRes.json()) as any;

  if (!pagesRes.ok || !pagesData.data) {
    console.error('❌ Failed to query Facebook pages:', pagesData.error?.message || pagesData);
    process.exit(1);
  }

  let igUserId = '';
  let matchedPageName = '';

  for (const page of pagesData.data) {
    if (page.instagram_business_account?.id) {
      igUserId = page.instagram_business_account.id;
      matchedPageName = page.name;
      break;
    }
  }

  if (!igUserId) {
    console.warn('⚠️ No Instagram Business Account automatically found on /me/accounts.');
    console.log('Pages found:');
    for (const page of pagesData.data) {
      console.log(`  - Page: "${page.name}" (ID: ${page.id}) - No Instagram Business Account linked`);
    }
    const manualIgId = await prompt('\nEnter your numeric Instagram Business Account ID manually (or press Enter to abort): ');
    if (!manualIgId) {
      console.error('❌ Could not link Instagram Business Account. Please link your Instagram account to your Facebook Page in Page Settings.');
      process.exit(1);
    }
    igUserId = manualIgId;
  } else {
    console.log(`✅ Found Instagram Business Account via Page "${matchedPageName}"!`);
  }

  console.log(`\n[3/4] Verifying Instagram Account details for ID: ${igUserId}...`);
  const igRes = await fetch(`https://graph.facebook.com/v21.0/${igUserId}?fields=id,username,name,profile_picture_url&access_token=${longLivedToken}`);
  const igData = (await igRes.json()) as any;

  if (!igRes.ok || !igData.username) {
    console.error('❌ Failed to fetch Instagram profile details:', igData.error?.message || igData);
    process.exit(1);
  }

  console.log(`✅ Verified Instagram Profile: @${igData.username} (${igData.name || 'LearnOps'})`);

  console.log('\n[4/4] Updating .env and database SocialAccount...');

  // Update .env
  let updatedEnv = envContent;
  const updateOrAppend = (key: string, val: string) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(updatedEnv)) {
      updatedEnv = updatedEnv.replace(regex, `${key}="${val}"`);
    } else {
      updatedEnv += `\n${key}="${val}"`;
    }
  };

  updateOrAppend('META_APP_ID', appId);
  updateOrAppend('META_APP_SECRET', appSecret);
  updateOrAppend('META_ACCESS_TOKEN', longLivedToken);
  updateOrAppend('META_IG_USER_ID', igUserId);

  await fs.writeFile(envPath, updatedEnv, 'utf8');
  console.log('✅ Updated .env with META_APP_ID, META_APP_SECRET, META_ACCESS_TOKEN, and META_IG_USER_ID.');

  // Update SocialAccount table in Postgres
  try {
    const brand = await prisma.brand.findFirst();
    if (brand) {
      const encrypted = encryptToken(longLivedToken);
      await prisma.socialAccount.upsert({
        where: {
          brandId_platform_accountId: {
            brandId: brand.id,
            platform: 'INSTAGRAM',
            accountId: igUserId,
          },
        },
        update: {
          accountUsername: igData.username,
          encryptedToken: encrypted,
          tokenExpiresAt: new Date(Date.now() + (exchangeData.expires_in || 5184000) * 1000),
          scopes: ['instagram_basic', 'instagram_content_publish', 'pages_show_list', 'pages_read_engagement'],
          isActive: true,
        },
        create: {
          brandId: brand.id,
          platform: 'INSTAGRAM',
          accountId: igUserId,
          accountUsername: igData.username,
          encryptedToken: encrypted,
          tokenExpiresAt: new Date(Date.now() + (exchangeData.expires_in || 5184000) * 1000),
          scopes: ['instagram_basic', 'instagram_content_publish', 'pages_show_list', 'pages_read_engagement'],
          isActive: true,
        },
      });
      console.log('✅ Updated database SocialAccount table.');
    }
  } catch (err: any) {
    console.warn('⚠️ Note: Database update warning:', err.message);
  }

  console.log('\n🎉 SUCCESS! Your Meta Instagram Graph API connection is fully verified and configured.');
  console.log(`Connected Account: @${igData.username}`);
  console.log(`Token Duration: ~${expiresInDays} days`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
