import { prisma } from '../apps/api/src/prisma/client.js';
import { topicDiscoveryService } from '../apps/api/src/services/topic-discovery.service.js';

async function main() {
  console.log('💡 LearnOps Topic Discovery & Rolling Backlog Engine starting...\n');

  const brand = await prisma.brand.findFirstOrThrow({
    where: { slug: 'learnops' },
  });

  console.log(`📌 Target Brand: ${brand.displayName} (${brand.id})`);
  console.log('🎯 Backlog Target: 25 high-potential Reel ideas\n');

  const result = await topicDiscoveryService.ensureBacklog(brand.id, 25);

  console.log(`\n🎉 Discovery Run Complete!`);
  console.log(`- New Topics Added   : ${result.added}`);
  console.log(`- Total Backlog Queued: ${result.totalQueued}`);

  // Fetch full queued backlog for visual inspection
  const queued = await prisma.topic.findMany({
    where: { brandId: brand.id, status: 'QUEUED' },
    include: {
      documents: {
        include: { document: { select: { title: true, sourceType: true } } },
      },
    },
    orderBy: { priorityScore: 'desc' },
  });

  console.log('\n═════════════════════════════════════════════════════════════════════════════════');
  console.log('                          CURRENT REEL IDEA BACKLOG                              ');
  console.log('═════════════════════════════════════════════════════════════════════════════════');
  queued.forEach((t, i) => {
    const docTags = t.documents.map((d) => `[${d.document.sourceType === 'LEARNOPS_LESSON' ? 'LearnOps' : 'DevOps'}] ${d.document.title}`).join(', ') || 'General Reference';
    console.log(
      `${(i + 1).toString().padStart(2)}. [Score: ${t.priorityScore}] [${t.category.padEnd(16)}] ${t.title}`
    );
    console.log(`    Brief  : ${t.brief}`);
    console.log(`    Visual : ${t.visualMetaphor || 'comparison'} | Sources: ${docTags}`);
    console.log(`    Origin : ${t.sourceType} ${t.learnopsLessonId ? `(Lesson: ${t.learnopsLessonId})` : ''}`);
    console.log('---------------------------------------------------------------------------------');
  });

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('❌ Topic discovery failed:', err);
  process.exit(1);
});
