import React from 'react';
import { Composition } from 'remotion';
import { MainReel } from './composition/MainReel.js';
import { LinuxEtcMotionReel } from './scenes/educational/LinuxEtcMotionReel.js';
import type { ReelRenderInput } from '@learnops/schema';

// Test fixtures
import linuxEtcFixture from './test-fixtures/linux-etc.json' assert { type: 'json' };
import dockerFixture from './test-fixtures/docker-container.json' assert { type: 'json' };
import cicdFixture from './test-fixtures/devops-cicd.json' assert { type: 'json' };

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 12-Second Motion Graphics Video: Linux /etc Directory (4 Scenes) */}
      <Composition
        id="LinuxEtcMotionGraphics"
        component={LinuxEtcMotionReel}
        durationInFrames={360} // 12 seconds @ 30 fps
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          brand: {
            primaryColor: '#FF3B00', // Coral/Orange matching reference video
            secondaryColor: '#B28BFF',
            backgroundColor: '#110F17',
            cardBackground: '#1C1824',
            textColor: '#FFFFFF',
          },
        }}
      />

      {/* 12-Second Motion Graphics Video (LearnOps Purple Edition) */}
      <Composition
        id="LinuxEtcLearnOps"
        component={LinuxEtcMotionReel}
        durationInFrames={360} // 12 seconds @ 30 fps
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          brand: {
            primaryColor: '#783CEB', // LearnOps Brand Purple
            secondaryColor: '#B28BFF',
            backgroundColor: '#110F17',
            cardBackground: '#1C1824',
            textColor: '#FFFFFF',
          },
        }}
      />

      {/* Dynamic Main Reel Composition */}
      <Composition
        id="MainReel"
        component={MainReel}
        durationInFrames={480} // fallback 16s
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={linuxEtcFixture as unknown as ReelRenderInput}
        calculateMetadata={async ({ props }) => {
          const typedProps = props as ReelRenderInput;
          const totalSeconds =
            typedProps?.script?.durationSeconds ||
            typedProps?.script?.scenes?.reduce((acc, s) => acc + s.durationSeconds, 0) ||
            16;
          return {
            durationInFrames: Math.round(totalSeconds * FPS),
          };
        }}
      />

      {/* Test 2 Video 1: Linux /etc Directory */}
      <Composition
        id="Test2-LinuxEtc"
        component={MainReel}
        durationInFrames={linuxEtcFixture.script.durationSeconds * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={linuxEtcFixture as unknown as ReelRenderInput}
      />

      {/* Test 2 Video 2: Docker Container Architecture */}
      <Composition
        id="Test2-DockerContainer"
        component={MainReel}
        durationInFrames={dockerFixture.script.durationSeconds * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={dockerFixture as unknown as ReelRenderInput}
      />

      {/* Test 2 Video 3: DevOps CI/CD Pipeline */}
      <Composition
        id="Test2-DevOpsCICD"
        component={MainReel}
        durationInFrames={cicdFixture.script.durationSeconds * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={cicdFixture as unknown as ReelRenderInput}
      />
    </>
  );
};

