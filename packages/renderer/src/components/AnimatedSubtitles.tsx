import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBrandTheme } from '../styles/theme.js';
import type { SubtitleChunk, TimedWord } from '@learnops/schema';

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
 * and distributes word-level startFrame/endFrame within each chunk for karaoke-style
 * single-word block highlighting.
 */
export function deriveSubtitleChunks(
  voiceover: string,
  durationSeconds: number,
  fps: number
): SubtitleChunk[] {
  const chunks = chunkVoiceover(voiceover, 3);
  if (chunks.length === 0) return [];

  const totalFrames = Math.round(durationSeconds * fps);
  const speechStartFrame = 0; // Start immediately from 0:00 without artificial delay
  // Leave a 0.4s natural breathing cushion at the end of the scene before cutting
  const speechEndFrame = Math.max(speechStartFrame + 12, totalFrames - Math.round(0.4 * fps));
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

    // Distribute chunk frames across individual words (1-3 words)
    const rawWords = chunk.split(/\s+/).filter(Boolean);
    const chunkDuration = endFrame - startFrame;

    const wordWeights = rawWords.map((w) => {
      let weight = w.length;
      if (/[,;:]$/.test(w)) weight += 3;
      if (/[.?!]$/.test(w)) weight += 5;
      return Math.max(2, weight);
    });
    const totalWordWeight = wordWeights.reduce((a, b) => a + b, 0);

    let currentWFrame = startFrame;
    const words: TimedWord[] = rawWords.map((w, wIdx) => {
      const isLastWord = wIdx === rawWords.length - 1;
      const wFrames = isLastWord
        ? endFrame - currentWFrame
        : Math.max(3, Math.round((wordWeights[wIdx] / totalWordWeight) * chunkDuration));
      const wStart = currentWFrame;
      const wEnd = isLastWord ? endFrame : wStart + wFrames;
      currentWFrame = wEnd;

      return {
        word: w,
        startFrame: wStart,
        endFrame: wEnd,
        startSeconds: Number((wStart / fps).toFixed(2)),
        endSeconds: Number((wEnd / fps).toFixed(2)),
      };
    });

    return {
      text: chunk,
      startFrame,
      endFrame,
      startSeconds: Number((startFrame / fps).toFixed(2)),
      endSeconds: Number((endFrame / fps).toFixed(2)),
      words,
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

  // Resolve individual timed words inside the active 3-word chunk
  const chunkWords: TimedWord[] = React.useMemo(() => {
    if (activeChunk.words && activeChunk.words.length > 0) {
      return activeChunk.words;
    }
    const rawWords = activeChunk.text.split(/\s+/).filter(Boolean);
    const startF = activeChunk.startFrame ?? 0;
    const endF = activeChunk.endFrame ?? Math.round(durationSeconds * fps);
    const span = Math.max(1, endF - startF);
    const perWord = Math.floor(span / Math.max(1, rawWords.length));
    return rawWords.map((w, idx) => ({
      word: w,
      startFrame: startF + idx * perWord,
      endFrame: idx === rawWords.length - 1 ? endF : startF + (idx + 1) * perWord,
      startSeconds: (startF + idx * perWord) / fps,
      endSeconds: (idx === rawWords.length - 1 ? endF : startF + (idx + 1) * perWord) / fps,
    }));
  }, [activeChunk, durationSeconds, fps]);

  // Find which specific word in the 3-word chunk is currently being spoken
  let activeWordIndex = chunkWords.findIndex(
    (w) => frame >= (w.startFrame ?? 0) && frame < (w.endFrame ?? Infinity)
  );
  if (activeWordIndex === -1) {
    if (frame < (chunkWords[0]?.startFrame ?? 0)) {
      activeWordIndex = 0;
    } else {
      activeWordIndex = chunkWords.length - 1;
    }
  }

  // Styling rules specified by user:
  // - 3 words are written on the screen at a time
  // - The highlight block is placed behind ONLY the word currently being spoken:
  //   - Hook screen (purple bg): solid black box (#110F17) + white text
  //   - Content screens (black bg): brand color box (e.g. #783CEB) + white text
  //   - Unspoken/other words in the 3-word phrase have NO block (transparent bg)
  const activeBoxBg = isHook ? '#110F17' : theme.colors.brandPrimary;
  const activeBoxBorder = isHook
    ? '2px solid rgba(255, 255, 255, 0.25)'
    : '2px solid rgba(255, 255, 255, 0.3)';
  const activeBoxShadow = isHook
    ? '0 14px 32px rgba(0, 0, 0, 0.65)'
    : `0 14px 34px ${theme.colors.brandPrimary}66, 0 4px 14px rgba(0, 0, 0, 0.5)`;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '6px',
        textAlign: 'center',
        width: '100%',
        maxWidth: '960px',
        margin: '0 auto',
      }}
    >
      {chunkWords.map((w, wIdx) => {
        const isCurrent = wIdx === activeWordIndex;
        const wordStart = w.startFrame ?? 0;

        // Snappy spring pop on the active word when speech hits it
        const wordSpring = spring({
          frame: frame - wordStart,
          fps,
          config: {
            damping: 14,
            stiffness: 260,
            mass: 0.5,
          },
        });
        const scale = isCurrent ? 0.95 + 0.07 * wordSpring : 1.0;

        return (
          <div
            key={`${activeChunk.text}-${wIdx}`}
            style={{
              transform: `scale(${scale})`,
              backgroundColor: isCurrent ? activeBoxBg : 'transparent',
              border: isCurrent ? activeBoxBorder : '2px solid transparent',
              boxShadow: isCurrent ? activeBoxShadow : 'none',
              borderRadius: '14px',
              padding: '8px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.1s ease',
            }}
          >
            <span
              style={{
                fontSize: '64px', // Just a bit smaller than the 84px headline
                fontWeight: 900,
                lineHeight: 1.15,
                color: '#FFFFFF',
                letterSpacing: '-0.03em',
                fontFamily: theme.fonts.heading,
                textAlign: 'center',
                opacity: isCurrent ? 1.0 : isHook ? 0.85 : 0.65,
                textShadow: isCurrent
                  ? '0 2px 8px rgba(0, 0, 0, 0.4)'
                  : isHook
                    ? '0 2px 6px rgba(0, 0, 0, 0.25)'
                    : '0 2px 6px rgba(0, 0, 0, 0.5)',
              }}
            >
              {w.word}
            </span>
          </div>
        );
      })}
    </div>
  );
};
