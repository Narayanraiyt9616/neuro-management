import { io, Socket } from 'socket.io-client';

/**
 * Real-Time Socket Service for BizNexus Collaboration & Notifications
 */
class SocketService {
  private socket: Socket | null = null;
  private currentBusinessId: string | null = null;
  private currentUserId: string | null = null;
  private currentProjectId: string | null = null;

  public connect(): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const socketUrl = import.meta.env.VITE_WS_URL || window.location.origin;

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    this.socket.on('connect', () => {
      // Re-join rooms if connection was dropped and restored
      if (this.currentBusinessId) {
        this.socket?.emit('join:business', this.currentBusinessId);
      }
      if (this.currentUserId) {
        this.socket?.emit('join:user', this.currentUserId);
      }
      if (this.currentProjectId) {
        this.socket?.emit('join:project', this.currentProjectId);
      }
    });

    return this.socket;
  }

  public getSocket(): Socket | null {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  public joinBusiness(businessId: string): void {
    this.currentBusinessId = businessId;
    const s = this.getSocket();
    s?.emit('join:business', businessId);
  }

  public joinUser(userId: string): void {
    this.currentUserId = userId;
    const s = this.getSocket();
    s?.emit('join:user', userId);
  }

  public joinProject(projectId: string): void {
    this.currentProjectId = projectId;
    const s = this.getSocket();
    s?.emit('join:project', projectId);
  }

  public leaveProject(projectId: string): void {
    if (this.currentProjectId === projectId) {
      this.currentProjectId = null;
    }
    const s = this.getSocket();
    s?.emit('leave:project', projectId);
  }

  public on<T = any>(event: string, callback: (data: T) => void): () => void {
    const s = this.getSocket();
    s?.on(event, callback);
    return () => {
      s?.off(event, callback);
    };
  }

  public off(event: string, callback?: (...args: any[]) => void): void {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
export default socketService;

