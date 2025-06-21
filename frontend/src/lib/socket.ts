import type {
  ClientToServerEvents,
  ErrorData,
  NotificationData,
  ServerToClientEvents,
} from '@repo/core/types';
import { io, Socket } from 'socket.io-client';
import { env } from './env';

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export type ConnectionStatus = 'disconnected' | 'connected' | 'error';

export interface SocketState {
  socket: TypedSocket | null;
  status: ConnectionStatus;
  error: string | null;
  reconnectAttempts: number;
}

class SocketService {
  private socket: TypedSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private statusCallbacks: Set<(state: SocketState) => void> = new Set();

  constructor() {
    this.connect();
  }

  /**
   * Subscribe to socket state changes
   */
  onStateChange(callback: (state: SocketState) => void) {
    this.statusCallbacks.add(callback);
    // Immediately call with current state
    callback(this.getState());

    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  /**
   * Get current socket state
   */
  getState(): SocketState {
    return {
      socket: this.socket,
      status: this.getConnectionStatus(),
      error: null, // Error is handled internally for now
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  /**
   * Notify all subscribers of state changes
   */
  private notifyStateChange() {
    const state = this.getState();
    this.statusCallbacks.forEach((callback) => callback(state));
  }

  /**
   * Connect to the socket server
   */
  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(env.VITE_SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 5000,
    }) as TypedSocket;

    this.setupEventListeners();

    return this.socket;
  }

  /**
   * Disconnect from the socket server
   */
  disconnect() {
    this.socket?.disconnect();
    this.reconnectAttempts = 0;
  }

  /**
   * Get the current socket instance
   */
  getSocket(): TypedSocket | null {
    return this.socket;
  }

  /**
   * Get connection status
   */
  private getConnectionStatus(): ConnectionStatus {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    return 'disconnected';
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('🔌 Socket connected');
      this.reconnectAttempts = 0; // Reset on successful connection
      this.notifyStateChange();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      this.notifyStateChange();
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      this.reconnectAttempts++;
      this.notifyStateChange();
    });

    // Application events
    this.socket.on('error', (data: ErrorData) => {
      console.error('Socket error:', data);
    });

    this.socket.on('notification', (data: NotificationData) => {
      console.log('Socket notification:', data);
    });
  }

  /**
   * Emit an event to the server
   */
  emit<K extends keyof ClientToServerEvents>(
    event: K,
    ...args: Parameters<ClientToServerEvents[K]>
  ) {
    if (this.socket?.connected) {
      this.socket.emit(event, ...args);
    } else {
      console.warn(`Cannot emit ${String(event)}: socket not connected`);
    }
  }

  /**
   * Listen to server events
   */
  on<K extends keyof ServerToClientEvents>(
    event: K,
    listener: ServerToClientEvents[K]
  ) {
    if (this.socket) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.socket.on(event, listener as any);
    }
  }

  /**
   * Remove event listener
   */
  off<K extends keyof ServerToClientEvents>(
    event: K,
    listener?: ServerToClientEvents[K]
  ) {
    if (this.socket) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.socket.off(event, listener as any);
    }
  }
}

// Singleton instance
export const socketService = new SocketService();
