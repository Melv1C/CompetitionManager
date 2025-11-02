import type { ServerType } from '@hono/node-server';
import {
  getRoomName,
  type ClientToServerEvents,
  type InterServerEvents,
  type ServerToClientEvents,
  type SocketData,
} from '@repo/core/types';
import { Server } from 'socket.io';
import { env } from './env';
import { createMiddleware } from 'hono/factory';

let globalIoInstance: Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> | null = null;

// Create and configure Socket.IO server
export function createSocketServer(httpServer: ServerType) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
    httpServer,
    {
      cors: {
        origin: [env.FRONTEND_URL, env.DESKTOP_URL],
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
        console.error('Error joining competition:', error);
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
        console.error('Error leaving competition:', error);
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

  globalIoInstance = io;

  return io;
}

export const ioMiddleware = createMiddleware(async (c, next) => {
  if (!c.var.io && globalIoInstance) {
    c.set('io', globalIoInstance);
  }
  return next();
});
