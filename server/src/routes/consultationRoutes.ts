import { Router } from 'express';
import { prisma, io } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Start a consultation (usually by patient)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { doctorId } = req.body;
  const patientId = req.user?.id;

  if (!patientId || !doctorId) return res.status(400).json({ error: 'Missing user IDs' });

  try {
    const consultation = await prisma.consultation.create({
      data: {
        patientId,
        doctorId,
      },
    });

    // Notify dashboards
    io.emit('dashboard_update');

    res.json(consultation);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get consultations for the logged-in user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  try {
    const consultations = await prisma.consultation.findMany({
      where: role === 'PATIENT' ? { patientId: userId } : { doctorId: userId },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        doctor: { select: { id: true, name: true, email: true } },
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(consultations);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific consultation and messages
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const consultationId = req.params.id as string;
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        doctor: { select: { id: true, name: true, email: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!consultation) return res.status(404).json({ error: 'Not found' });

    // Validate user is part of consultation
    if (consultation.patientId !== req.user?.id && consultation.doctorId !== req.user?.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(consultation);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send a text message
router.post('/:id/messages', authenticate, async (req: AuthRequest, res) => {
  const { content } = req.body;
  const consultationId = req.params.id as string;
  const senderId = req.user?.id;
  const senderRole = req.user?.role as 'PATIENT' | 'DOCTOR';

  if (!senderId || !senderRole) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const message = await prisma.message.create({
      data: {
        consultationId,
        senderId,
        senderRole,
        content,
        messageType: 'TEXT',
      },
    });

    // Broadcast to room
    io.to(consultationId).emit('new_message', message);
    
    // Notify dashboards
    io.emit('dashboard_update');

    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
