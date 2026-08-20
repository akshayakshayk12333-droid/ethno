import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected! ID:', socket.id);
  socket.emit('join_consultation', 'test-room');
});

socket.on('connect_error', (err) => {
  console.error('Connection error:', err);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
