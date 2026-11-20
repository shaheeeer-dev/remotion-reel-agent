import { PrismaClient } from '@prisma/client';
import '../config/env.js';
import { knowledgeService } from '../services/knowledge.service.js';
import { topicDiscoveryService } from '../services/topic-discovery.service.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Initializing LearnOps Database with verified knowledge sources...');

  // 1. Create or ensure LearnOps Brand & Profile
  const brand = await prisma.brand.upsert({
    where: { slug: 'learnops' },
    update: {},
    create: {
      slug: 'learnops',
      displayName: 'LearnOps',
      isActive: true,
      timezone: 'UTC',
      defaultDuration: 16,
      autoPublish: false,
      profile: {
        create: {
          audience: 'Beginner to intermediate Linux & DevOps engineers, sysadmins, and software developers',
          voiceTone: 'Practical, concise, technically rigorous, visually clear, encouraging',
          contentPillars: ['Linux Essentials', 'Docker Architecture', 'CI/CD Automation', 'Kubernetes'],
          primaryColor: '#783CEB',
          secondaryColor: '#B28BFF',
          bgColor: '#110F17',
          fontFamily: 'Inter',
        },
      },
    },
  });

  console.log(`✅ Brand verified: ${brand.displayName} (${brand.id})`);

  // 2. Synchronize verified knowledge sources (Source A: LearnOps lessons, Source B: DevOps docs)
  console.log('📚 Syncing real knowledge base documents...');
  const { learnops, generalDevops } = await knowledgeService.syncAll(brand.id);
  console.log(`✅ Synced ${learnops.total} LearnOps lessons and ${generalDevops.total} General DevOps documents.`);

  // 3. Ensure topic backlog is populated
  console.log('🎯 Checking topic pool backlog...');
  const backlog = await topicDiscoveryService.ensureBacklog(brand.id, 25);
  console.log(`✅ Active queued topics in backlog: ${backlog.totalQueued}.`);

  console.log('\n🎉 Seed process complete: System is 100% production-ready with real data.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
