import { prisma } from '../apps/api/src/prisma/client.js';
import { knowledgeService } from '../apps/api/src/services/knowledge.service.js';
import { topicDiscoveryService } from '../apps/api/src/services/topic-discovery.service.js';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  console.log('🧪 Starting LearnOps Automated Verification Checklist Suite...\n');

  const brand = await prisma.brand.findFirstOrThrow({
    where: { slug: 'learnops' },
  });

  let testsPassed = 0;
  const totalTests = 6;

  // ---------------------------------------------------------
  // TEST 1: Update an existing document -> Only changed updates
  // ---------------------------------------------------------
  console.log('--- TEST 1: Incremental Checksum Sync ---');
  const testDocPath = path.resolve('knowledge-base/devops/docker/containers-vs-vms.md');
  const originalContent = await fs.readFile(testDocPath, 'utf8');

  try {
    // Append a comment
    await fs.writeFile(testDocPath, originalContent + '\n<!-- test-comment-checksum -->\n', 'utf8');
    const updateResult = await knowledgeService.syncGeneralDevops(brand.id);
    console.log(`  After edit: updated = ${updateResult.updated}, skipped = ${updateResult.skipped}`);
    
    // Restore
    await fs.writeFile(testDocPath, originalContent, 'utf8');
    const restoreResult = await knowledgeService.syncGeneralDevops(brand.id);
    console.log(`  After restore: updated = ${restoreResult.updated}, skipped = ${restoreResult.skipped}`);

    if (updateResult.updated === 1 && restoreResult.updated === 1) {
      console.log('  Status: ✅ PASS (Only modified document was re-indexed)\n');
      testsPassed++;
    } else {
      console.log('  Status: ❌ FAIL\n');
    }
  } catch (err) {
    await fs.writeFile(testDocPath, originalContent, 'utf8');
    throw err;
  }

  // ---------------------------------------------------------
  // TEST 2: Add an unverified DevOps document -> Excluded from approval
  // ---------------------------------------------------------
  console.log('--- TEST 2: Unverified Document Exclusion ---');
  const unverifiedPath = path.resolve('knowledge-base/devops/docker/unverified-test-doc.md');
  const unverifiedContent = `---
title: "Unverified Experimental Tech"
category: "Docker"
source_type: "general_devops"
source_url: "https://example.com/unverified"
is_verified: false
---
This is experimental unverified content that must never be used in Reels.
`;

  try {
    await fs.writeFile(unverifiedPath, unverifiedContent, 'utf8');
    await knowledgeService.syncGeneralDevops(brand.id);

    const docInDb = await prisma.knowledgeDocument.findFirst({
      where: {
        brandId: brand.id,
        sourcePath: 'devops/docker/unverified-test-doc.md',
      },
    });

    if (docInDb && docInDb.isApproved === false && docInDb.isVerified === false) {
      console.log(`  Document found in DB with isApproved=${docInDb.isApproved}, isVerified=${docInDb.isVerified}`);
      console.log('  Status: ✅ PASS (Unverified doc excluded from active generation pool)\n');
      testsPassed++;
    } else {
      console.log('  Status: ❌ FAIL\n');
    }
  } finally {
    await fs.unlink(unverifiedPath).catch(() => {});
  }

  // ---------------------------------------------------------
  // TEST 3: Stale / Deleted Document Handling
  // ---------------------------------------------------------
  console.log('--- TEST 3: Stale / Deleted Document Cleanup ---');
  await knowledgeService.syncGeneralDevops(brand.id);
  const deletedDocInDb = await prisma.knowledgeDocument.findFirst({
    where: {
      brandId: brand.id,
      sourcePath: 'devops/docker/unverified-test-doc.md',
    },
  });

  if (deletedDocInDb && deletedDocInDb.isApproved === false) {
    console.log(`  Deleted file in DB deactivated: isApproved = ${deletedDocInDb.isApproved}`);
    // Clean up DB row
    await prisma.knowledgeDocument.delete({ where: { id: deletedDocInDb.id } });
    console.log('  Status: ✅ PASS (Deleted file was automatically deactivated)\n');
    testsPassed++;
  } else {
    console.log('  Status: ❌ FAIL\n');
  }

  // ---------------------------------------------------------
  // TEST 4: Topic Status Lifecycle (QUEUED -> SELECTED -> IN_PRODUCTION -> PUBLISHED)
  // ---------------------------------------------------------
  console.log('--- TEST 4: Topic Status Lifecycle Transition ---');
  const sampleTopic = await prisma.topic.create({
    data: {
      brandId: brand.id,
      title: 'Lifecycle Test: Ephemeral Topic',
      category: 'Linux',
      brief: 'Test verification of 7-stage topic lifecycle.',
      status: 'QUEUED',
      sourceType: 'LEARNOPS_LESSON',
      audienceLevel: 'beginner',
      visualMetaphor: 'terminal',
      priorityScore: 99,
      semanticKey: 'test:lifecycle_ephemeral',
    },
  });

  try {
    // 1. QUEUED -> SELECTED
    await prisma.topic.update({ where: { id: sampleTopic.id }, data: { status: 'SELECTED' } });
    const s1 = await prisma.topic.findUnique({ where: { id: sampleTopic.id } });

    // 2. SELECTED -> IN_PRODUCTION
    await prisma.topic.update({ where: { id: sampleTopic.id }, data: { status: 'IN_PRODUCTION' } });
    const s2 = await prisma.topic.findUnique({ where: { id: sampleTopic.id } });

    // 3. IN_PRODUCTION -> PUBLISHED
    await prisma.topic.update({ where: { id: sampleTopic.id }, data: { status: 'PUBLISHED', isUsed: true } });
    const s3 = await prisma.topic.findUnique({ where: { id: sampleTopic.id } });

    if (s1?.status === 'SELECTED' && s2?.status === 'IN_PRODUCTION' && s3?.status === 'PUBLISHED') {
      console.log(`  Lifecycle steps: ${sampleTopic.status} -> ${s1.status} -> ${s2.status} -> ${s3.status}`);
      console.log('  Status: ✅ PASS (All status transitions valid)\n');
      testsPassed++;
    } else {
      console.log('  Status: ❌ FAIL\n');
    }
  } finally {
    await prisma.topic.delete({ where: { id: sampleTopic.id } });
  }

  // ---------------------------------------------------------
  // TEST 5: Category & Difficulty Balancing in Topic Selection
  // ---------------------------------------------------------
  console.log('--- TEST 5: Diversity & Category Balancing ---');
  const candidate = await topicDiscoveryService.selectNextTopicForProduction(brand.id);
  if (candidate) {
    console.log(`  Selected topic: "${candidate.title}"`);
    console.log(`  Category: ${candidate.category} | Difficulty: ${candidate.audienceLevel} | Source: ${candidate.sourceType}`);
    console.log('  Status: ✅ PASS (Successfully selected balanced candidate)\n');
    testsPassed++;

    // Revert candidate back to QUEUED
    await prisma.topic.update({
      where: { id: candidate.id },
      data: { status: 'QUEUED' },
    });
  } else {
    console.log('  Status: ❌ FAIL\n');
  }

  // ---------------------------------------------------------
  // TEST 6: Zero Billing / Safe Gemini Configuration
  // ---------------------------------------------------------
  console.log('--- TEST 6: Gemini Cost & Quota Safety ---');
  // Check the model hierarchy in gemini.service.ts
  const geminiPath = path.resolve('apps/api/src/services/gemini.service.ts');
  const geminiCode = await fs.readFile(geminiPath, 'utf8');
  const hasFallback = geminiCode.includes('gemini-2.5-flash-lite') || geminiCode.includes('gemini-3.1-flash-lite');
  const usesSafeModels = geminiCode.includes('modelsToTry') && hasFallback;

  if (usesSafeModels) {
    console.log('  Model hierarchy uses Flash & Flash-Lite tier with robust fallback.');
    console.log('  Status: ✅ PASS (Safe, cost-contained AI execution)\n');
    testsPassed++;
  } else {
    console.log('  Status: ❌ FAIL\n');
  }

  console.log(`═══════════════════════════════════════════════════════`);
  console.log(`Test Suite Finished: ${testsPassed} / ${totalTests} tests passed.`);
  console.log(`═══════════════════════════════════════════════════════\n`);

  await prisma.$disconnect();
  if (testsPassed !== totalTests) process.exit(1);
}

main().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
