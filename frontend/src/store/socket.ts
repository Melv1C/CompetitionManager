import { socketService, type SocketState } from '@/lib/socket';
import type {
  ClientToServerEvents,
  ErrorData,
  JoinCompetitionData,
  LeaveCompetitionData,
  NotificationData,
} from '@competition-manager/core/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface SocketStore extends SocketState {
  // Actions
  connect: () => void;
  disconnect: () => void;
  emit<K extends keyof ClientToServerEvents>(
    event: K,
    ...args: Parameters<ClientToServerEvents[K]>
  ): void;

  // Competition specific actions
  joinCompetition: (data: JoinCompetitionData) => void;
  leaveCompetition: (data: LeaveCompetitionData) => void;

  // Event handlers (can be overridden by components)
  onError: (handler: (data: ErrorData) => void) => () => void;
  onNotification: (handler: (data: NotificationData) => void) => () => void;
}

export const useSocketStore = create<SocketStore>()(
  devtools(
    (set) => ({
      // Initial state
      socket: null,
      status: 'disconnected',
      error: null,
      reconnectAttempts: 0,

      // Actions
      connect: () => {
        socketService.connect();
      },

      disconnect: () => {
        socketService.disconnect();
        set({ socket: null, status: 'disconnected', reconnectAttempts: 0 });
      },

      emit: (event, ...args) => {
        socketService.emit(event, ...args);
      },

      // Competition specific actions
      joinCompetition: (data: JoinCompetitionData) => {
        socketService.emit('joinCompetition', data);
      },

      leaveCompetition: (data: LeaveCompetitionData) => {
        socketService.emit('leaveCompetition', data);
      },

      // Event handler registration
      onError: (handler: (data: ErrorData) => void) => {
        socketService.on('error', handler);
        return () => socketService.off('error', handler);
      },

      onNotification: (handler: (data: NotificationData) => void) => {
        socketService.on('notification', handler);
        return () => socketService.off('notification', handler);
      },
    }),
    {
      name: 'socket-store',
    }
  )
);

// Subscribe to socket service state changes
socketService.onStateChange((socketState) => {
  console.log('Socket state changed:', socketState);
  useSocketStore.setState(socketState);
});

// Helper hooks for specific use cases
export const useSocket = () => {
  const store = useSocketStore();
  return {
    socket: store.socket,
    status: store.status,
    isConnected: store.status === 'connected',
    isDisconnected: store.status === 'disconnected',
    reconnectAttempts: store.reconnectAttempts,
    connect: store.connect,
    disconnect: store.disconnect,
    emit: store.emit,
  };
};

export const useSocketEvents = () => {
  const store = useSocketStore();
  return {
    joinCompetition: store.joinCompetition,
    leaveCompetition: store.leaveCompetition,
    onError: store.onError,
    onNotification: store.onNotification,
  };
};
