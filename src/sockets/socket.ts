import { Server as SocketIOServer } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

let io: SocketIOServer | null = null;

export function setupSocket(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: config.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('join_assignment', (assignmentId: string) => {
      if (typeof assignmentId === 'string' && assignmentId.length > 0) {
        socket.join(assignmentId);
        logger.info(`Socket ${socket.id} joined room: ${assignmentId}`);
        socket.emit('joined_assignment', {
          assignmentId,
          message: `Joined assignment room: ${assignmentId}`,
        });
      } else {
        socket.emit('error', { message: 'Invalid assignment ID' });
      }
    });

    socket.on('leave_assignment', (assignmentId: string) => {
      if (typeof assignmentId === 'string' && assignmentId.length > 0) {
        socket.leave(assignmentId);
        logger.info(`Socket ${socket.id} left room: ${assignmentId}`);
      }
    });

    socket.on('disconnect', (reason: string) => {
      logger.info(`Socket disconnected: ${socket.id} (reason: ${reason})`);
    });

    socket.on('error', (err: Error) => {
      logger.error(`Socket error for ${socket.id}: ${err.message}`);
    });
  });

  logger.info('Socket.io server initialized');
  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call setupSocket first.');
  }
  return io;
}
