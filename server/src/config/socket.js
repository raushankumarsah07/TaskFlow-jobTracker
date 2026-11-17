/**
 * Socket.IO server initialization
 * - JWT auth middleware on the handshake
 * - Per-connection handler registration
 * - Exports `io` for use by services
 */
import { Server } from 'socket.io';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
import { verifyAccessToken } from '../utils/generateToken.js';
import { registerHandlers } from '../sockets/handlers.js';

/** Singleton Socket.IO server instance — import this in services to emit events. */
export let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.client.url,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
  });

  // ── Authentication middleware ──────────────────────────────────────────
  io.use((socket, next) => {
    // Token can come from: auth.token, query.token, or Authorization header
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication error: no token provided'));
    }

    try {
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error(`Authentication error: ${err.message}`));
    }
  });

  // ── Connection handler ─────────────────────────────────────────────────
  io.on('connection', (socket) => {
    // Join private user room immediately
    socket.join(`user:${socket.userId}`);

    // Wire all event handlers
    registerHandlers(socket, io);
  });

  // ── Adapter events (optional: for Redis adapter later) ────────────────
  io.engine.on('connection_error', (err) => {
    logger.error(`[Socket.IO] Connection error: ${err.code} ${err.message}`);
  });

  logger.info('[Socket.IO] Initialized and ready');
  return io;
};
