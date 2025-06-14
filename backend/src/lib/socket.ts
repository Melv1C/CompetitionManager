import {
  getRoomName,
  type ClientToServerEvents,
  type InterServerEvents,
  type JoinCompetitionData,
  type LeaveCompetitionData,
  type ServerToClientEvents,
  type SocketData,
} from '@competition-manager/core/types';
import type { ServerType } from '@hono/node-server';
import { Server } from 'socket.io';
import { env } from './env';

// Create and configure Socket.IO server
export function createSocketServer(httpServer: ServerType) {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: env.BETTER_AUTH_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle joining competition
    socket.on('joinCompetition', async (data: JoinCompetitionData) => {
      try {
        const { competitionId, userId } = data;

        // Join competition room
        const competitionRoom = getRoomName.competition(competitionId);
        await socket.join(competitionRoom);

        console.log(`User ${userId} joined competition ${competitionId}`);

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
    socket.on('leaveCompetition', async (data: LeaveCompetitionData) => {
      try {
        const { competitionId, userId } = data;

        // Leave competition room
        const competitionRoom = getRoomName.competition(competitionId);
        await socket.leave(competitionRoom);

        console.log(`User ${userId} left competition ${competitionId}`);
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

    // Handle disconnection
    socket.on('disconnect', async (reason) => {
      console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
    });
  });

  return io;
}
