import { Router } from 'express';
import { voiceService } from '../services/voice.service.js';

export const voicesRouter = Router();

// GET /api/v1/voices - List all available Kokoro voices
voicesRouter.get('/', (req, res) => {
  const voices = voiceService.getAvailableVoices();
  res.json({ data: voices });
});

// GET /api/v1/voices/:voiceId/preview - Stream/download the 24kHz audio preview WAV
voicesRouter.get('/:voiceId/preview', async (req, res, next) => {
  try {
    const { voiceId } = req.params;
    const filePath = await voiceService.getPreviewFilePath(voiceId);

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.sendFile(filePath);
  } catch (err: any) {
    if (err.message && err.message.includes('Invalid voice ID')) {
      return res.status(404).json({ error: { message: err.message } });
    }
    next(err);
  }
});
