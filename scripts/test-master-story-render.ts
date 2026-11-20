import path from 'node:path';
import fs from 'node:fs/promises';
import { ttsService } from '../apps/api/src/services/tts.service.js';
import { remotionService, getMonorepoRoot } from '../apps/api/src/services/remotion.service.js';
import type { ReelRenderInput, Scene } from '@learnops/schema';

async function main() {
  console.log('🚀 Testing Scene-Aligned 22s Reel Audio & Subtitles Render...\n');

  const scenes: Scene[] = [
    {
      kind: 'hook',
      durationSeconds: 5,
      badge: 'DOCKER FUNDAMENTALS',
      headline: 'What is a *Container*?',
      subtext: 'It is not a Virtual Machine',
      visualMetaphor: 'container_stack',
      voiceover: 'Ever wondered what a Docker container actually is under the hood?',
    },
    {
      kind: 'container_diagram',
      durationSeconds: 5,
      title: 'Shared OS Kernel',
      hostOs: 'Host Linux Kernel',
      containerEngine: 'Docker Engine',
      containers: [
        { name: 'web-app', app: 'Node.js API', binsLibs: 'Alpine libc + Node v20' },
        { name: 'db-app', app: 'Postgres DB', binsLibs: 'Alpine + Postgres 16' },
      ],
      comparisonNote: 'Isolated via Namespaces & Cgroups',
      voiceover: 'Unlike virtual machines, containers share the host Linux kernel directly.',
    },
    {
      kind: 'comparison',
      durationSeconds: 5,
      title: 'Architecture Split',
      leftLabel: 'VIRTUAL MACHINES',
      leftTitle: 'Full Hardware',
      leftDescription: 'Includes Guest OS & Hypervisor',
      leftIcon: 'server',
      rightLabel: 'CONTAINERS',
      rightTitle: 'Shared Kernel',
      rightDescription: 'Isolated Binaries & Processes',
      rightIcon: 'box',
      takeaway: '*Containers* isolate processes, not hardware',
      voiceover: 'While VMs simulate entire operating systems, containers isolate single app processes.',
    },
    {
      kind: 'terminal',
      durationSeconds: 5,
      title: 'Instant Execution',
      promptUser: 'learner@linux:~$',
      command: 'docker run -d --name app nginx:alpine',
      outputLines: [
        'a1b2c3d4e5f6...',
        'Status: Downloaded newer image',
        'Container started in 150ms',
      ],
      explanation: 'Starts like a regular OS process',
      voiceover: 'This allows docker to launch an isolated application process in milliseconds.',
    },
    {
      kind: 'outro',
      durationSeconds: 2,
      headline: 'LearnOps',
      subtext: 'Follow for daily tutorials.',
      voiceover: 'Follow LearnOps for daily DevOps tutorials!',
    },
  ];

  const totalDuration = scenes.reduce((acc, s) => acc + s.durationSeconds, 0);
  console.log(`Target duration: ${totalDuration}s across ${scenes.length} scenes.`);

  const reelId = 'test_docker_22s';
  console.log('🎙️ Synthesizing scene-aligned audio with Kokoro...');
  const { sceneAudios, masterAudio } = await ttsService.synthesizeReelAudio(
    reelId,
    scenes,
    'af_heart'
  );

  console.log('Master Audio info:', {
    path: masterAudio.audioPath,
    durationSeconds: masterAudio.durationSeconds,
  });

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
      topic: 'Docker: What is a Container Really?',
      hook: 'What is a *Container*?',
      durationSeconds: masterAudio.durationSeconds,
      scenes,
      caption: 'Containers are NOT virtual machines! 🐳 #docker #devops',
      hashtags: ['docker', 'devops', 'linux'],
      narrationText: scenes.map((s) => s.voiceover).join(' '),
    },
    sceneAudios,
    masterAudio,
  };

  console.log('\n🎬 Rendering Remotion Reel with Scene-Aligned Audio...');
  const outputFileName = 'test_docker_22s_verified.mp4';
  const result = await remotionService.renderReelVideo(renderInput, outputFileName);

  console.log('\n🎉 Render Complete!');
  console.log(`- Path: ${result.storagePath}`);
  console.log(`- Size: ${(Number(result.fileSizeBytes) / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`- Duration: ${result.durationSeconds}s`);
}

main().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
