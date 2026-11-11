import React from 'react';
import { Series } from 'remotion';
import { BrandThemeProvider } from '../../styles/theme.js';
import { FilingCabinetHookScene } from './FilingCabinetHookScene.js';
import { InsideEtcExplainScene } from './InsideEtcExplainScene.js';
import { ScopeDistinguishScene } from './ScopeDistinguishScene.js';
import { TerminalRecapScene } from './TerminalRecapScene.js';

export interface LinuxEtcMotionReelProps {
  brand?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    cardBackground?: string;
    textColor?: string;
  };
}

/**
 * 12-Second Educational Motion Graphics Reel: Linux /etc Directory
 *
 * Sequence of 4 Distinct Scenes (3.0s / 90 frames each @ 30fps):
 * - Scene 1 (0–3s): Hook — Filing cabinet with /etc drawer sliding out
 * - Scene 2 (3–6s): Explain — Plain files with real effects (hosts, fstab, sshd_config)
 * - Scene 3 (6–9s): Distinguish — System vs Personal scope (/etc vs ~/.config)
 * - Scene 4 (9–12s): Recap — Interactive terminal inspection (ls /etc)
 */
export const LinuxEtcMotionReel: React.FC<LinuxEtcMotionReelProps> = ({ brand }) => {
  return (
    <BrandThemeProvider brand={brand}>
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#110F17',
        }}
      >
        <Series>
          {/* Scene 1 — Hook: 3 seconds (90 frames) */}
          <Series.Sequence durationInFrames={90}>
            <FilingCabinetHookScene />
          </Series.Sequence>

          {/* Scene 2 — Explain: 3 seconds (90 frames) */}
          <Series.Sequence durationInFrames={90}>
            <InsideEtcExplainScene />
          </Series.Sequence>

          {/* Scene 3 — Distinguish: 3 seconds (90 frames) */}
          <Series.Sequence durationInFrames={90}>
            <ScopeDistinguishScene />
          </Series.Sequence>

          {/* Scene 4 — Recap: 3 seconds (90 frames) */}
          <Series.Sequence durationInFrames={90}>
            <TerminalRecapScene />
          </Series.Sequence>
        </Series>
      </div>
    </BrandThemeProvider>
  );
};
