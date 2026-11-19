import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBrandTheme } from '../styles/theme.js';
import type { SubtitleChunk } from '@learnops/schema';

export interface AnimatedSubtitlesProps {
  voiceover?: string;
  durationSeconds: number;
  isHook?: boolean;
  subtitles?: SubtitleChunk[];
}

/**
 * Splits voiceover text into chunks of at most 3 words.
 * Honors natural phrase boundaries and punctuation.
 */
export function chunkVoiceover(text: string, maxWordsPerChunk = 3): string[] {
  if (!text || !text.trim()) return [];

  const words = text.trim().split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let current: string[] = [];

  for (let i = 0; i < words.length; i++) {
    current.push(words[i]);
    const hasPunctuation = /[,.?!;:]$/.test(words[i]);

    if (current.length === maxWordsPerChunk || (current.length >= 2 && hasPunctuation)) {
      chunks.push(current.join(' '));
      current = [];
    }
  }

  if (current.length > 0) {
    if (chunks.length > 0 && current.length === 1 && chunks[chunks.length - 1].split(' ').length < maxWordsPerChunk) {
      chunks[chunks.length - 1] += ' ' + current[0];
    } else {
      chunks.push(current.join(' '));
    }
  }

  return chunks;
}

/**
 * Derives timed subtitle chunks (startFrame, endFrame) for each 1-3 word group,
 * weighting chunk duration by character length and punctuation pauses.
 */
export function deriveSubtitleChunks(
  voiceover: string,
  durationSeconds: number,
  fps: number
): SubtitleChunk[] {
  const chunks = chunkVoiceover(voiceover, 3);
  if (chunks.length === 0) return [];

  const totalFrames = Math.round(durationSeconds * fps);
  const speechStartFrame = 3;
  // Leave a 0.25s cushion at the end of the scene before cutting
  const speechEndFrame = Math.max(speechStartFrame + 12, totalFrames - Math.round(0.25 * fps));
  const availableFrames = speechEndFrame - speechStartFrame;

  // Weight chunks by character count + punctuation pauses
  const weights = chunks.map((c) => {
    let w = c.length;
    if (/[,;:]/.test(c)) w += 4;
    if (/[.?!]/.test(c)) w += 6;
    return w;
  });
  const totalWeight = weights.reduce((acc, w) => acc + w, 0);

  let currentFrame = speechStartFrame;
  return chunks.map((chunk, idx) => {
    const isLast = idx === chunks.length - 1;
    const chunkFrames = isLast
      ? speechEndFrame - currentFrame
      : Math.max(6, Math.round((weights[idx] / totalWeight) * availableFrames));
    const startFrame = currentFrame;
    const endFrame = isLast ? totalFrames : startFrame + chunkFrames;
    currentFrame = startFrame + chunkFrames;

    return {
      text: chunk,
      startFrame,
      endFrame,
      startSeconds: Number((startFrame / fps).toFixed(2)),
      endSeconds: Number((endFrame / fps).toFixed(2)),
    };
  });
}

export const AnimatedSubtitles: React.FC<AnimatedSubtitlesProps> = ({
  voiceover,
  durationSeconds,
  isHook = false,
  subtitles,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useBrandTheme();

  if (!voiceover || !voiceover.trim()) {
    return null;
  }

  const chunks = React.useMemo(() => {
    if (subtitles && subtitles.length > 0) {
      return subtitles;
    }
    return deriveSubtitleChunks(voiceover, durationSeconds, fps);
  }, [voiceover, durationSeconds, fps, subtitles]);

  if (chunks.length === 0) {
    return null;
  }

  // Find the active chunk for the current frame
  let activeIndex = chunks.findIndex(
    (c) => frame >= (c.startFrame ?? 0) && frame < (c.endFrame ?? Infinity)
  );

  // If before first chunk, use first chunk; if past last chunk, hold last chunk
  if (activeIndex === -1) {
    if (frame < (chunks[0].startFrame ?? 0)) {
      activeIndex = 0;
    } else {
      activeIndex = chunks.length - 1;
    }
  }

  const activeChunk = chunks[activeIndex];
  const chunkStartFrame = activeChunk.startFrame ?? 0;

  // Snappy pop-in spring animation whenever a new chunk triggers
  const popSpring = spring({
    frame: frame - chunkStartFrame,
    fps,
    config: {
      damping: 14,
      stiffness: 240,
      mass: 0.5,
    },
  });

  // Dynamic scale from 0.94 to 1.0 for high visual impact
  const scale = 0.94 + 0.06 * popSpring;

  // Styling rules specified by user:
  // - Hook screen has brand color background -> black box + white text
  // - Rest of video (except outro) has black background -> brand color box + white text
  const boxBg = isHook ? '#110F17' : theme.colors.brandPrimary;
  const textColor = '#FFFFFF';
  const boxBorder = isHook
    ? '2px solid rgba(255, 255, 255, 0.2)'
    : '2px solid rgba(255, 255, 255, 0.25)';
  const boxShadow = isHook
    ? '0 16px 36px rgba(0, 0, 0, 0.65)'
    : `0 16px 38px ${theme.colors.brandPrimary}55, 0 8px 20px rgba(0, 0, 0, 0.45)`;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%',
        maxWidth: '960px',
        margin: '0 auto',
      }}
    >
      {/* Dynamic Animated Subtitle Box */}
      <div
        style={{
          transform: `scale(${scale})`,
          backgroundColor: boxBg,
          border: boxBorder,
          boxShadow,
          borderRadius: '20px',
          padding: '16px 38px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '920px',
        }}
      >
        <span
          style={{
            fontSize: '64px', // Just a bit smaller than the 84px headline
            fontWeight: 900,
            lineHeight: 1.15,
            color: textColor,
            letterSpacing: '-0.03em',
            fontFamily: theme.fonts.heading,
            textAlign: 'center',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
          }}
        >
          {activeChunk.text}
        </span>
      </div>
    </div>
  );
};
