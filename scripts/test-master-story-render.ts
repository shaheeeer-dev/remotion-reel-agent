import path from 'node:path';
import fs from 'node:fs/promises';
import { voiceService } from '../apps/api/src/services/voice.service.js';
import { trimSilence } from '../apps/api/src/services/tts.service.js';
import { remotionService, getMonorepoRoot } from '../apps/api/src/services/remotion.service.js';
import type { ReelRenderInput, Scene } from '@learnops/schema';

async function main() {
  console.log('🚀 Testing Master Continuous Story Narration with Remotion...\n');

  const rootDir = getMonorepoRoot();
  const tts = await (voiceService as any).getTTSInstance();

  // 55-word story: continuous, natural, attention-grabbing storytelling matching all scenes
  const storyText =
    "Have you ever opened the etc folder in Linux and wondered what lives inside? " +
    "Think of it as the control center, holding configuration files for every host service. " +
    "Unlike personal user configs, etc manages system-wide daemon and server settings. " +
    "From your nginx configs to user passwords, every setting is editable text. " +
    "Follow LearnOps for daily DevOps tutorials!";

  console.log(`🎙️ Story: "${storyText}"`);
  console.log(`Word count: ${storyText.split(/\s+/).filter(Boolean).length} words`);

  // Target: 16.0s reel. We want speech to span ~15.2s.
  let audio = await tts.generate(storyText, { voice: 'af_heart', speed: 1.05 });
  trimSilence(audio);
  let duration = audio.audio.length / audio.sampling_rate;
  console.log(`Initial duration: ${duration.toFixed(2)}s`);

  const targetDuration = 15.2;
  if (Math.abs(duration - targetDuration) > 0.8) {
    const adjustedSpeed = Number((1.05 * (duration / targetDuration)).toFixed(2));
    const speed = Math.min(1.4, Math.max(0.9, adjustedSpeed));
    console.log(`Adjusting speed to ${speed}x for perfect ~15.2s pacing...`);
    audio = await tts.generate(storyText, { voice: 'af_heart', speed });
    trimSilence(audio);
    duration = audio.audio.length / audio.sampling_rate;
    console.log(`Paced duration: ${duration.toFixed(2)}s`);
  }

  const audioDir = path.resolve(rootDir, 'storage/media/audio/reels/test_master');
  await fs.mkdir(audioDir, { recursive: true });
  const audioPath = path.join(audioDir, 'master.wav');
  await audio.save(audioPath);

  const wavBuffer = await fs.readFile(audioPath);
  const audioDataUri = `data:audio/wav;base64,${wavBuffer.toString('base64')}`;

  const scenes: Scene[] = [
    {
      kind: 'hook',
      durationSeconds: 3.5,
      badge: 'LINUX ARCHITECTURE',
      headline: 'What is the /etc directory?',
      subtext: 'Every Linux admin needs to know this folder.',
      voiceover: 'Have you ever opened the etc folder in Linux and wondered what lives inside?',
    },
    {
      kind: 'folder_tree',
      durationSeconds: 4,
      title: 'Directory Anatomy',
      rootPath: '/etc',
      tree: [
        { name: 'nginx', isDirectory: true, highlight: true, description: 'Web server config' },
        { name: 'passwd', isDirectory: false, highlight: false, description: 'User accounts' },
        { name: 'hosts', isDirectory: false, highlight: false, description: 'Host mappings' },
        { name: 'ssh', isDirectory: true, highlight: false, description: 'SSH daemon config' },
      ],
      explanation: 'Machine-wide settings',
      voiceover: 'Think of it as the control center, holding configuration files for every host service.',
    },
    {
      kind: 'comparison',
      durationSeconds: 3.5,
      title: 'Scope Distinction',
      leftLabel: 'SYSTEM',
      leftTitle: 'The Machine',
      leftDescription: 'All users & services',
      leftIcon: 'server',
      rightLabel: 'USER',
      rightTitle: 'One User',
      rightDescription: 'Personal settings',
      rightIcon: 'user',
      takeaway: 'Different folders, different scope',
      voiceover: 'Unlike personal user configs, etc manages system-wide daemon and server settings.',
    },
    {
      kind: 'terminal',
      durationSeconds: 3,
      title: 'Inspect Files',
      promptUser: 'learner@linux:~$',
      command: 'ls -la /etc/nginx',
      outputLines: ['drwxr-xr-x 8 root root 4096 conf.d', '-rw-r--r-- 1 root root 1440 nginx.conf'],
      explanation: 'Real config files',
      voiceover: 'From your nginx configs to user passwords, every setting is editable plain text.',
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

  const renderInput: ReelRenderInput = {
    reelId: 'test_master',
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
      caption: 'Demystifying the Linux /etc folder! #linux #devops',
      hashtags: ['linux', 'devops'],
    },
    masterAudio: {
      audioPath,
      audioUrl: '/media/audio/reels/test_master/master.wav',
      audioDataUri,
      durationSeconds: duration,
    },
  };

  console.log('\n🎬 Rendering Remotion Reel with Master Continuous Story Audio...');
  const outputFileName = 'e2e_master_story_reel.mp4';
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

