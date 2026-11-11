import React from 'react';
import { Series, useVideoConfig } from 'remotion';
import { BrandThemeProvider } from '../../styles/theme.js';
import { FilingCabinetHookScene } from './FilingCabinetHookScene.js';
import { InsideEtcExplainScene } from './InsideEtcExplainScene.js';
import { ScopeDistinguishScene } from './ScopeDistinguishScene.js';
import { TerminalRecapScene } from './TerminalRecapScene.js';
import { OutroScene } from '../OutroScene.js';

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
 * Sequence of 5 Distinct Animated Scenes:
 * - Scene 1: Hook — Filing cabinet with /etc drawer sliding out
 * - Scene 2: Explain — Plain files with real effects (hosts, fstab, sshd_config)
 * - Scene 3: Distinguish — System vs Personal scope (/etc vs ~/.config)
 * - Scene 4: Recap — Interactive terminal inspection (ls /etc)
 * - Scene 5: Outro & CTA (1 second) — Brand title, "Follow for daily tutorials.", and "Follow" button
 *
 * Features:
 * - Dynamic Duration: Paces the 4 educational scenes and reserves exactly 1 second for the final Outro.
 * - Platform Safe Area: All essential content is positioned inside the top 80% (0-1536px),
 *   leaving the bottom 20% (384px) strictly clear for platform overlays.
 * - Zero emojis: Pure Lucide SVG vector iconography.
 * - Dynamic Theming: Reads Brand Profile & Reel Colors without hardcoded fallbacks.
 */
export const LinuxEtcMotionReel: React.FC<LinuxEtcMotionReelProps> = ({ brand, durationSeconds }) => {
  const { fps, durationInFrames: totalDurationInFrames } = useVideoConfig();

  const brandName = brand?.name || 'LearnOps';

  const totalFrames = durationSeconds ? Math.round(durationSeconds * fps) : totalDurationInFrames;

  // 1 second reserved for the final Brand Outro & CTA
  const outroFrames = Math.round(1 * fps); // 30 frames @ 30 FPS
  const contentFrames = Math.max(fps * 4, totalFrames - outroFrames);

  // Divide the remaining educational content evenly across the 4 scenes
  const scene1Frames = Math.round(contentFrames * 0.25);
  const scene2Frames = Math.round(contentFrames * 0.25);
  const scene3Frames = Math.round(contentFrames * 0.25);
  const scene4Frames = contentFrames - (scene1Frames + scene2Frames + scene3Frames);

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
          {/* Scene 1 — Hook */}
          <Series.Sequence durationInFrames={scene1Frames}>
            <FilingCabinetHookScene />
          </Series.Sequence>

          {/* Scene 2 — Explain */}
          <Series.Sequence durationInFrames={scene2Frames}>
            <InsideEtcExplainScene />
          </Series.Sequence>

          {/* Scene 3 — Distinguish */}
          <Series.Sequence durationInFrames={scene3Frames}>
            <ScopeDistinguishScene />
          </Series.Sequence>

          {/* Scene 4 — Terminal Recap */}
          <Series.Sequence durationInFrames={scene4Frames}>
            <TerminalRecapScene brandName={brandName} />
          </Series.Sequence>

          {/* Scene 5 — 1-Second Brand Outro & Follow CTA */}
          <Series.Sequence durationInFrames={outroFrames}>
            <OutroScene
              brandName={brandName}
              tagline={brand?.tagline || 'Follow for daily tutorials.'}
              callToAction={brand?.callToAction || 'Follow'}
            />
          </Series.Sequence>
        </Series>
      </div>
    </BrandThemeProvider>
  );
};
