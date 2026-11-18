import { env } from '@huggingface/transformers';
import { KokoroTTS } from 'kokoro-js';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../');
const cacheDirectory = resolve(projectRoot, 'storage/models/kokoro');
const offlineOnly = process.argv.includes('--offline');

async function main() {
  await mkdir(cacheDirectory, { recursive: true });

  // Kokoro.js delegates model loading to Transformers.js; configure its cache
  // before importing/loading a model so the first download is persisted here.
  env.cacheDir = cacheDirectory;
  env.useFSCache = true;
  env.allowLocalModels = true;
  env.allowRemoteModels = !offlineOnly;

  console.info(`Loading ${MODEL_ID} on CPU (${offlineOnly ? 'offline cache check' : 'download if missing'})`);
  console.info(`Model cache: ${cacheDirectory}`);

  const tts = await KokoroTTS.from_pretrained(MODEL_ID, {
    dtype: 'q8',
    device: 'cpu',
  });

  console.info(`Kokoro model is ready. ${Object.keys(tts.voices).length} voices are available in the installed package.`);
}

main().catch((error: unknown) => {
  console.error('Kokoro model setup failed:', error);
  process.exitCode = 1;
});
