import { prisma } from '../apps/api/src/prisma/client.js';
import { knowledgeService } from '../apps/api/src/services/knowledge.service.js';

async function main() {
  console.log('🚀 LearnOps Knowledge Ingestion Engine starting...\n');

  const brand = await prisma.brand.findFirstOrThrow({
    where: { slug: 'learnops' },
  });

  console.log(`📌 Target Brand: ${brand.displayName} (${brand.id})\n`);

  const { learnops, generalDevops } = await knowledgeService.syncAll(brand.id);

  console.log('\n📊 Ingestion Results:');
  console.log(`- LearnOps Lessons: ${learnops.added} added, ${learnops.updated} updated, ${learnops.skipped} skipped (${learnops.total} total)`);
  if (learnops.errors.length > 0) {
    console.warn('  Errors:', learnops.errors);
  }

  console.log(`- General DevOps References: ${generalDevops.added} added, ${generalDevops.updated} updated, ${generalDevops.skipped} skipped (${generalDevops.total} total)`);
  if (generalDevops.errors.length > 0) {
    console.warn('  Errors:', generalDevops.errors);
  }

  console.log('\n📈 Generating Knowledge Coverage Report...');
  const report = await knowledgeService.getKnowledgeCoverage(brand.id);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('            KNOWLEDGE BASE COVERAGE REPORT             ');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`\n📚 LearnOps Course Lessons (Synced from content.md): ${report.learnopsLessons.total}`);
  for (const [cat, count] of Object.entries(report.learnopsLessons.categories)) {
    console.log(`   • ${cat.padEnd(24)} : ${count} lessons`);
  }

  console.log(`\n🌐 General DevOps References: ${report.generalDevops.total} (${report.generalDevops.verified} verified)`);
  for (const [cat, count] of Object.entries(report.generalDevops.categories)) {
    console.log(`   • ${cat.padEnd(24)} : ${count} documents`);
  }

  console.log(`\n🎯 Reel Idea Backlog Health:`);
  console.log(`   • Active Queued Ideas  : ${report.backlogStatus.currentQueued} / ${report.backlogStatus.target} target`);
  for (const [status, count] of Object.entries(report.backlogStatus.byStatus)) {
    console.log(`   • Status [${status.padEnd(12)}] : ${count}`);
  }
  console.log('═══════════════════════════════════════════════════════\n');

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
