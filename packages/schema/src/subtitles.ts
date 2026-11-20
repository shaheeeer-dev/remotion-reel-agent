import type { SubtitleChunk, TimedWord } from './scene.schema.js';

/**
 * Splits voiceover text into chunks of at most maxWordsPerChunk (default: 3 words).
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
 *
 * All chunks and word timings are strictly calibrated to the actual speech duration
 * (speechDurationSeconds), ensuring the final words highlight on the exact spoken syllable
 * rather than lagging behind into the trailing stay pause.
 */
export function deriveSubtitleChunks(
  voiceover: string,
  speechDurationSeconds: number,
  fps = 30
): SubtitleChunk[] {
  const chunks = chunkVoiceover(voiceover, 3);
  if (chunks.length === 0) return [];

  const speechFrames = Math.max(12, Math.round(speechDurationSeconds * fps));
  const speechStartFrame = 0;
  const speechEndFrame = speechFrames;
  const availableFrames = speechEndFrame - speechStartFrame;

  // Weight chunks proportionally by character count (natural reading cadence)
  const weights = chunks.map((c) => {
    const clean = c.replace(/[^a-zA-Z0-9]/g, '');
    let w = clean.length;
    if (/[,;:]/.test(c)) w += 2;
    return Math.max(3, w);
  });
  const totalWeight = weights.reduce((acc, w) => acc + w, 0);

  let currentFrame = speechStartFrame;
  return chunks.map((chunk, idx) => {
    const isLast = idx === chunks.length - 1;
    const chunkFrames = isLast
      ? Math.max(4, speechEndFrame - currentFrame)
      : Math.max(6, Math.round((weights[idx] / totalWeight) * availableFrames));
    const startFrame = currentFrame;
    const endFrame = isLast ? speechEndFrame : Math.min(speechEndFrame, startFrame + chunkFrames);
    currentFrame = endFrame;

    // Distribute chunk frames across individual words (1-3 words)
    const rawWords = chunk.split(/\s+/).filter(Boolean);
    const chunkDuration = Math.max(1, endFrame - startFrame);

    const wordWeights = rawWords.map((w) => {
      const len = w.replace(/[^a-zA-Z0-9]/g, '').length;
      return Math.max(2, len);
    });
    const totalWordWeight = wordWeights.reduce((a, b) => a + b, 0);

    let currentWFrame = startFrame;
    const words: TimedWord[] = rawWords.map((w, wIdx) => {
      const isLastWord = wIdx === rawWords.length - 1;
      const wFrames = isLastWord
        ? Math.max(2, endFrame - currentWFrame)
        : Math.max(2, Math.round((wordWeights[wIdx] / totalWordWeight) * chunkDuration));
      const wStart = currentWFrame;
      const wEnd = isLastWord ? endFrame : Math.min(endFrame, wStart + wFrames);
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
