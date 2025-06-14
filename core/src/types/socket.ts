// Socket event validation schemas (using the same pattern as other schemas)
export interface JoinCompetitionData {
  competitionId: string;
  userId: string;
}

export interface LeaveCompetitionData {
  competitionId: string;
  userId: string;
}

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
}

export interface ClientToServerEvents {
  // Competition events
  joinCompetition: (data: JoinCompetitionData) => void;
  leaveCompetition: (data: LeaveCompetitionData) => void;

  // Heartbeat
  ping: () => void;
}

export interface InterServerEvents {}

export interface SocketData {}

// Room naming conventions
export const ROOM_PREFIXES = {
  COMPETITION: 'competition:',
} as const;

// Helper functions for room names
export const getRoomName = {
  competition: (competitionId: string) =>
    `${ROOM_PREFIXES.COMPETITION}${competitionId}`,
} as const;
