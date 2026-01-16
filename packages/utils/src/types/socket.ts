import type { Cuid, Id, Result } from '../schemas';

export interface ErrorData {
  message: string;
  code?: string;
}

export interface NotificationData {
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface ServerToClientEvents {
  // System events
  error: (data: ErrorData) => void;
  notification: (data: NotificationData) => void;

  // Result events
  upsertResult: (data: Result) => void;
  resultDeleted: (id: Id) => void;
}

export interface ClientToServerEvents {
  // Competition events
  joinCompetition: (competitionEid: Cuid) => void;
  leaveCompetition: (competitionEid: Cuid) => void;

  // Heartbeat
  ping: () => void;
}

export type InterServerEvents = object;

export type SocketData = object;

// Room naming conventions
export const ROOM_PREFIXES = {
  COMPETITION: 'competition:',
} as const;

// Helper functions for room names
export const getRoomName = {
  competition: (competitionEid: Cuid) => `${ROOM_PREFIXES.COMPETITION}${competitionEid}`,
} as const;
