import type { ServerType } from '@hono/node-server';
import {
  getRoomName,
  type ClientToServerEvents,
  type InterServerEvents,
  type ServerToClientEvents,
  type SocketData,
} from '@repo/utils';
import { createMiddleware } from 'hono/factory';
import { Server } from 'socket.io';
import { env } from './env';
import { logger } from './logger';

export type IoServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

// Socket.IO instance holder
let ioInstance: IoServer | null = null;

// Setter to register the io instance (called from index.ts after creation)
export function setIoInstance(io: IoServer) {
  ioInstance = io;
}

// Middleware to inject Socket.IO into Hono context
export const ioMiddleware = createMiddleware(async (c, next) => {
  if (ioInstance) {
    c.set('io', ioInstance);
  } else {
    c.get('logStep')?.error('Unable to set io instance in context: ioInstance is null');
  }
  return next();
});

// Create and configure Socket.IO server
export function createSocketServer(httpServer: ServerType) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
    httpServer,
    {
      cors: {
        origin: [env.FRONTEND_URL, env.ADMIN_URL],
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    },
  );

  // Connection handler
  io.on('connection', socket => {
    // Handle joining competition
    socket.on('joinCompetition', async competitionEid => {
      try {
        // Join competition room
        const competitionRoom = getRoomName.competition(competitionEid);
        await socket.join(competitionRoom);

        // Notify the user that they successfully joined
        socket.emit('notification', {
          message: `Successfully joined competition`,
          type: 'success',
        });
      } catch (error) {
        logger.warn('Error joining competition:', { error });
        socket.emit('error', {
          message: 'Failed to join competition',
          code: 'JOIN_ERROR',
        });
      }
    });

    // Handle leaving competition
    socket.on('leaveCompetition', async competitionEid => {
      try {
        // Leave competition room
        const competitionRoom = getRoomName.competition(competitionEid);
        await socket.leave(competitionRoom);
      } catch (error) {
        logger.warn('Error leaving competition:', { error });
        socket.emit('error', {
          message: 'Failed to leave competition',
          code: 'LEAVE_ERROR',
        });
      }
    });

    // Handle ping for heartbeat
    socket.on('ping', () => {
      socket.emit('notification', {
        message: 'pong',
        type: 'info',
      });
    });
  });

  return io;
}
