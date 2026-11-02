import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import config from './config/environment';
import logger from './utils/logger';
import { ISocketNotificationPayload, ISocketTaskEventPayload } from './types';

let io: SocketIOServer | null = null;

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin) return callback(null, true);
        if (
          config.isDevelopment ||
          origin === config.clientUrl ||
          /^http:\/\/localhost:\d+$/.test(origin) ||
          /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
        ) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive in dev/fallback for resilience
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    }
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`[SOCKET.IO] Client connected: ${socket.id}`);

    // Join Business Room
    socket.on('join:business', (businessId: string) => {
      if (businessId) {
        socket.join(`business:${businessId}`);
        logger.debug(`[SOCKET.IO] Socket ${socket.id} joined business:${businessId}`);
      }
    });

    // Join User Private Room (for notifications)
    socket.on('join:user', (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
        logger.debug(`[SOCKET.IO] Socket ${socket.id} joined user:${userId}`);
      }
    });

    // Join Project Room (for real-time Kanban & task changes)
    socket.on('join:project', (projectId: string) => {
      if (projectId) {
        socket.join(`project:${projectId}`);
        logger.debug(`[SOCKET.IO] Socket ${socket.id} joined project:${projectId}`);
      }
    });

    socket.on('leave:project', (projectId: string) => {
      if (projectId) {
        socket.leave(`project:${projectId}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`[SOCKET.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer | null => {
  return io;
};

/**
 * Emit real-time notification to a specific user
 */
export const notifyUser = (userId: string, notification: ISocketNotificationPayload): void => {
  if (!io) return;
  io.to(`user:${userId}`).emit('notification:new', notification);
};

/**
 * Emit real-time task status / Kanban board update to project room
 */
export const emitTaskEvent = (projectId: string, eventType: string, payload: ISocketTaskEventPayload | any): void => {
  if (!io) return;
  io.to(`project:${projectId}`).emit(`task:${eventType}`, payload);
  if (payload.businessId) {
    io.to(`business:${payload.businessId}`).emit(`task:${eventType}`, payload);
  }
};

/**
 * Broadcast event to all members in a business organization
 */
export const emitToBusiness = (businessId: string, eventName: string, data: any): void => {
  if (!io) return;
  io.to(`business:${businessId}`).emit(eventName, data);
};

export default {
  initSocket,
  getIO,
  notifyUser,
  emitTaskEvent,
  emitToBusiness
};

