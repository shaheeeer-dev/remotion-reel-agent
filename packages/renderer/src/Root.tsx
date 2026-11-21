import React from 'react';
import { Composition } from 'remotion';
import { MainReel } from './composition/MainReel.js';
import type { ReelRenderInput } from '@learnops/schema';

// Test fixtures
import linuxEtcFixture from './test-fixtures/linux-etc.json' assert { type: 'json' };
import dockerFixture from './test-fixtures/docker-container.json' assert { type: 'json' };
import cicdFixture from './test-fixtures/devops-cicd.json' assert { type: 'json' };
import chmodChownFixture from './test-fixtures/chmod-chown.json' assert { type: 'json' };
import nginxFixture from './test-fixtures/nginx-load-balancing.json' assert { type: 'json' };

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Primary Dynamic Reel Composition (Used in Production) */}
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

      {/* Test Video 1: Linux /etc Directory (Filesystem Tree Metaphor) */}
      <Composition
        id="Test2-LinuxEtc"
        component={MainReel}
        durationInFrames={linuxEtcFixture.script.durationSeconds * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={linuxEtcFixture as unknown as ReelRenderInput}
      />

      {/* Test Video 2: Docker Container Architecture (Dashed Sandbox Metaphor) */}
      <Composition
        id="Test2-DockerContainer"
        component={MainReel}
        durationInFrames={dockerFixture.script.durationSeconds * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={dockerFixture as unknown as ReelRenderInput}
      />

      {/* Test Video 3: DevOps CI/CD Pipeline (Horizontal Pipeline Metaphor) */}
      <Composition
        id="Test2-DevOpsCICD"
        component={MainReel}
        durationInFrames={cicdFixture.script.durationSeconds * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={cicdFixture as unknown as ReelRenderInput}
      />

      {/* Test Video 4: Linux Permissions chmod vs chown (Octal 755 Grid Metaphor) */}
      <Composition
        id="Test2-ChmodChown"
        component={MainReel}
        durationInFrames={chmodChownFixture.script.durationSeconds * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={chmodChownFixture as unknown as ReelRenderInput}
      />

      {/* Test Video 5: Nginx Load Balancing Strategies (Network Flow Metaphor) */}
      <Composition
        id="Test2-NginxLoadBalancing"
        component={MainReel}
        durationInFrames={nginxFixture.script.durationSeconds * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={nginxFixture as unknown as ReelRenderInput}
      />
    </>
  );
};
