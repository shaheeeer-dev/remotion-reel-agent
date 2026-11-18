import path from 'node:path';
import fs from 'node:fs/promises';
import { ttsService } from '../apps/api/src/services/tts.service.js';
import { remotionService, getMonorepoRoot } from '../apps/api/src/services/remotion.service.js';
import type { ReelRenderInput, Scene } from '@learnops/schema';

async function main() {
  console.log('🚀 Starting End-to-End TTS + Remotion Reel Render Test...\n');

  const rootDir = getMonorepoRoot();
  const reelId = `e2e-tts-${Date.now()}`;

  const scenes: Scene[] = [
    {
      kind: 'hook',
      durationSeconds: 3,
      badge: 'LINUX ARCHITECTURE',
      headline: 'What is the /etc directory?',
      subtext: 'Every Linux admin needs to know this folder.',
      voiceover: 'Ever wonder what the slash etc folder actually is?',
    },
    {
      kind: 'folder_tree',
      durationSeconds: 3,
      headline: 'System-Wide Configuration',
      subtext: 'Static configuration files for host services',
      rootPath: '/etc',
      tree: [
        { name: 'nginx', isDirectory: true, highlight: true, description: 'Web server config' },
        { name: 'passwd', isDirectory: false, highlight: false, description: 'User accounts' },
        { name: 'hosts', isDirectory: false, highlight: false, description: 'Host mappings' },
        { name: 'ssh', isDirectory: true, highlight: false, description: 'SSH daemon config' },
      ],
      voiceover: 'In Linux, slash etc stores system configuration files.',
    },
    {
      kind: 'terminal_code',
      durationSeconds: 4,
      headline: 'Inspecting /etc/hosts',
      filename: '/etc/hosts',
      language: 'bash',
      code: '127.0.0.1   localhost\n::1         localhost ip6-localhost\n192.168.1.5 prod-db-primary',
      highlightLines: [3],
      explanation: 'DNS and local hostname mappings',
      voiceover: 'Like your network settings, user lists, and server configs.',
    },
    {
      kind: 'key_principle',
      durationSeconds: 4,
      headline: 'Editable Plain Text',
      statement: 'Configuration without compilation',
      supportingPoints: [
        'All settings are human-readable text',
        'Modified with standard text editors (vim, nano)',
        'Reloaded via systemctl reload <service>',
      ],
      ruleOfThumb: 'Always backup config before modifying: cp file file.bak',
      voiceover: 'These are plain text files, editable with any editor.',
    },
    {
      kind: 'outro',
      durationSeconds: 2,
      headline: 'LearnOps',
      subtext: 'Follow for daily tutorials.',
      voiceover: 'Follow LearnOps for daily tutorials.',
    },
  ];

  const totalDuration = scenes.reduce((acc, s) => acc + s.durationSeconds, 0);
  console.log(`Total Reel Duration: ${totalDuration}s across ${scenes.length} scenes.\n`);

  console.log('🎙️ Step 1: Synthesizing Kokoro TTS Scene Audio...');
  const voiceId = 'af_heart';
  const sceneAudios = await ttsService.synthesizeReelAudio(reelId, scenes, voiceId);

  console.log(`\n✅ Generated ${sceneAudios.length} scene voiceovers:`);
  for (const a of sceneAudios) {
    const scene = scenes[a.sceneIndex];
    console.log(
      `   Scene ${a.sceneIndex} [${scene.kind}]: Audio ${a.durationSeconds}s / Slot ${scene.durationSeconds}s (Cushion: ${(scene.durationSeconds - a.durationSeconds).toFixed(2)}s)`
    );
  }

  console.log('\n🎬 Step 2: Preparing Remotion Render Input...');
  const renderInput: ReelRenderInput = {
    reelId,
    brand: {
      name: 'LearnOps',
      primaryColor: '#783CEB',
      secondaryColor: '#B28BFF',
      backgroundColor: '#110F17',
      cardBackground: '#1C1824',
      textColor: '#FFFFFF',
      creatorCredit: 'https://github.com/learnops/learnops',
    },
    script: {
      schemaVersion: 1,
      topic: 'Linux: What is /etc?',
      hook: 'What is the /etc directory?',
      durationSeconds: totalDuration,
      scenes,
      caption: 'Demystifying the Linux /etc folder in 16 seconds! #linux #devops',
      hashtags: ['linux', 'devops', 'sysadmin'],
    },
    sceneAudios,
  };

  const outputFileName = `e2e_tts_reel_${reelId}.mp4`;
  console.log(`\n🎥 Step 3: Rendering Reel Video to ${outputFileName}...`);
  const result = await remotionService.renderReelVideo(renderInput, outputFileName);

  console.log('\n🎉 Render Complete!');
  console.log(`- Path: ${result.storagePath}`);
  console.log(`- Size: ${(Number(result.fileSizeBytes) / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`- Duration: ${result.durationSeconds}s`);
  console.log(`- Dimensions: ${result.width}x${result.height}`);
  console.log(`- SHA256: ${result.checksumSha256}`);
}

main().catch((err) => {
  console.error('❌ E2E Test Failed:', err);
  process.exit(1);
});

