import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

import authRoutes from './routes/authRoutes';
import consultationRoutes from './routes/consultationRoutes';
import sttRoutes from './routes/sttRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/speech-to-text', sttRoutes);

app.get('/', (req, res) => {
  res.send('VoiceBridge API is running');
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_consultation', (consultationId) => {
    socket.join(consultationId);
    console.log(`User joined consultation: ${consultationId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export { io, prisma };
