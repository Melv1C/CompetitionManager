import { socketService, type SocketState } from '@/lib/socket';
import type { ClientToServerEvents } from '@repo/core/types';
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
}

export const useSocketStore = create<SocketStore>()(
  devtools(
    set => ({
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
    }),
    {
      name: 'socket-store',
    },
  ),
);

// Subscribe to socket service state changes
socketService.onStateChange(socketState => {
  console.log('Socket state changed:', socketState);
  useSocketStore.setState(socketState);
});

// Helper hooks for specific use cases
export const useSocket = () => {
  const socket = useSocketStore(state => state.socket);
  if (!socket) {
    throw new Error('Socket is not connected');
  }
  return { socket };
};

export const useSocketStatus = () => {
  const status = useSocketStore(state => state.status);
  const reconnectAttempts = useSocketStore(state => state.reconnectAttempts);
  return {
    status,
    isConnected: status === 'connected',
    isDisconnected: status === 'disconnected',
    reconnectAttempts,
  };
};
