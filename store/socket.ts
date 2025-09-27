// store/socket.ts

import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/constants/api';

export let socket: Socket | null = null;

export const initializeSocket = (token: string): Socket => {
  // Если сокет уже существует, возвращаем его
  if (socket?.connected) {
    return socket;
  }

  console.log('[Socket Service] Инициализация сокета...');
  socket = io(API_BASE_URL, {
    auth: { token },
    transports: ['websocket'],
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('[Socket Service] Отключаем глобальный сокет.');
    socket.disconnect();
    socket = null;
  }
};