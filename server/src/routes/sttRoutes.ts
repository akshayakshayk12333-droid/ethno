import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import { prisma, io } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { convertSpeechToText } from '../services/speechToTextService';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', authenticate, upload.single('audio'), async (req: AuthRequest, res) => {
  const { consultationId } = req.body;
  const audioFile = req.file;
  const senderId = req.user?.id;
  const senderRole = req.user?.role as 'PATIENT' | 'DOCTOR';

  if (!senderId || senderRole !== 'DOCTOR') {
    if (audioFile) fs.unlinkSync(audioFile.path);
    return res.status(403).json({ error: 'Only doctors can use speech-to-text' });
  }

  if (!audioFile || !consultationId) {
    if (audioFile) fs.unlinkSync(audioFile.path);
    return res.status(400).json({ error: 'Missing audio file or consultation ID' });
  }

  try {
    // Call ElevenLabs STT Service
    const transcription = await convertSpeechToText(audioFile.path);

    // Save message to DB
    const message = await prisma.message.create({
      data: {
        consultationId,
        senderId,
        senderRole,
        content: transcription,
        messageType: 'SPEECH_TRANSCRIPTION',
      },
    });

    // Broadcast to room
    io.to(consultationId).emit('new_message', message);
    
    // Notify dashboards
    io.emit('dashboard_update');

    res.json(message);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Speech to text processing failed' });
  } finally {
    // Clean up uploaded file
    if (fs.existsSync(audioFile.path)) {
      fs.unlinkSync(audioFile.path);
    }
  }
});

export default router;
