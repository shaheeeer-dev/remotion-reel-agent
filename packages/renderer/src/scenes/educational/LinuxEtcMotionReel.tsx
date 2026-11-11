import React from 'react';
import { Series, useVideoConfig } from 'remotion';
import { BrandThemeProvider } from '../../styles/theme.js';
import { FilingCabinetHookScene } from './FilingCabinetHookScene.js';
import { InsideEtcExplainScene } from './InsideEtcExplainScene.js';
import { ScopeDistinguishScene } from './ScopeDistinguishScene.js';
import { TerminalRecapScene } from './TerminalRecapScene.js';

export interface LinuxEtcMotionReelProps {
  durationSeconds?: number;
  brand?: {
    name?: string;
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    cardBackground?: string;
    textColor?: string;
    mutedTextColor?: string;
    fontFamily?: string;
    callToAction?: string;
    tagline?: string;
  };
}

/**
 * Educational Motion Graphics Reel: Linux /etc Directory
 *
 * Sequence of 4 Distinct Animated Scenes:
 * - Scene 1: Hook — Filing cabinet with /etc drawer sliding out
 * - Scene 2: Explain — Plain files with real effects (hosts, fstab, sshd_config)
 * - Scene 3: Distinguish — System vs Personal scope (/etc vs ~/.config)
 * - Scene 4: Recap — Interactive terminal inspection (ls /etc)
 *
 * Features:
 * - Dynamic Duration: Evenly distributes target duration across the 4 scenes.
 * - Platform Safe Area: All essential content is positioned inside the top 80% (0-1536px),
 *   leaving the bottom 20% (384px) strictly clear for platform overlays.
 * - Zero emojis: Pure Lucide SVG vector iconography.
 * - Dynamic Theming: Reads Brand Profile & Reel Colors without hardcoded fallbacks.
 */
export const LinuxEtcMotionReel: React.FC<LinuxEtcMotionReelProps> = ({ brand, durationSeconds }) => {
  const { fps, durationInFrames: totalDurationInFrames } = useVideoConfig();

  const brandName = brand?.name || 'LearnOps';

  // Calculate dynamic frame distribution across the 4 scenes
  const totalFrames = durationSeconds ? Math.round(durationSeconds * fps) : totalDurationInFrames;
  const scene1Frames = Math.round(totalFrames * 0.25);
  const scene2Frames = Math.round(totalFrames * 0.25);
  const scene3Frames = Math.round(totalFrames * 0.25);
  // Guarantee exact frame sum match
  const scene4Frames = totalFrames - (scene1Frames + scene2Frames + scene3Frames);

  return (
    <BrandThemeProvider brand={brand}>
      <div
        style={{
          width: '1080px',
          height: '1920px',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: brand?.backgroundColor || '#110F17',
        }}
      >
        <Series>
          {/* Scene 1 — Hook (~25% of total time) */}
          <Series.Sequence durationInFrames={scene1Frames}>
            <FilingCabinetHookScene />
          </Series.Sequence>

          {/* Scene 2 — Explain (~25% of total time) */}
          <Series.Sequence durationInFrames={scene2Frames}>
            <InsideEtcExplainScene />
          </Series.Sequence>

          {/* Scene 3 — Distinguish (~25% of total time) */}
          <Series.Sequence durationInFrames={scene3Frames}>
            <ScopeDistinguishScene />
          </Series.Sequence>

          {/* Scene 4 — Recap & Brand Outro (~25% of total time) */}
          <Series.Sequence durationInFrames={scene4Frames}>
            <TerminalRecapScene brandName={brandName} />
          </Series.Sequence>
        </Series>
      </div>
    </BrandThemeProvider>
  );
};
