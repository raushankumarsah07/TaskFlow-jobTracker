/**
 * Socket.IO handlers — per-socket event wiring
 * Called once per connection with the connected socket and the io server.
 */
import { EVENTS } from './events.js';
import { logger } from '../utils/logger.js';

/** In-memory online presence map  { userId -> Set<socketId> } */
const onlineUsers = new Map();

const addOnline = (userId, socketId) => {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socketId);
};

const removeOnline = (userId, socketId) => {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return false;
  sockets.delete(socketId);
  if (sockets.size === 0) { onlineUsers.delete(userId); return true; } // fully offline
  return false; // still connected from another tab
};

export const getOnlineUserIds = () => [...onlineUsers.keys()];

/**
 * Register all socket event handlers for a single connection.
 * @param {import('socket.io').Socket} socket
 * @param {import('socket.io').Server} io
 */
export const registerHandlers = (socket, io) => {
  const userId = socket.userId;

  // ── Presence: announce online ────────────────────────────────────────────
  addOnline(userId, socket.id);
  socket.broadcast.emit(EVENTS.USER_ONLINE, { userId, onlineUsers: getOnlineUserIds() });
  // Send current online list to the new connection
  socket.emit(EVENTS.ONLINE_USERS, { onlineUsers: getOnlineUserIds() });

  logger.info(`[Socket] User ${userId} connected (${socket.id}). Online: ${onlineUsers.size}`);

  // ── Workspace rooms ──────────────────────────────────────────────────────
  socket.on(EVENTS.JOIN_WORKSPACE, (workspaceId) => {
    if (typeof workspaceId !== 'string') return;
    socket.join(`workspace:${workspaceId}`);
    logger.info(`[Socket] ${userId} joined workspace:${workspaceId}`);
  });

  socket.on(EVENTS.LEAVE_WORKSPACE, (workspaceId) => {
    if (typeof workspaceId !== 'string') return;
    socket.leave(`workspace:${workspaceId}`);
    logger.info(`[Socket] ${userId} left workspace:${workspaceId}`);
  });

  // ── Typing / editing indicators ──────────────────────────────────────────
  socket.on(EVENTS.USER_EDITING, ({ entityId, entityType }) => {
    // Broadcast to others in the user's room (or workspace if implemented)
    socket.broadcast
      .to(`user:${userId}`)
      .emit(EVENTS.USER_EDITING, { userId, entityId, entityType });
  });

  socket.on(EVENTS.USER_STOPPED_EDITING, ({ entityId, entityType }) => {
    socket.broadcast
      .to(`user:${userId}`)
      .emit(EVENTS.USER_STOPPED_EDITING, { userId, entityId, entityType });
  });

  // ── Ping / heartbeat (keep-alive acknowledgement) ────────────────────────
  socket.on('ping', (cb) => { if (typeof cb === 'function') cb({ ts: Date.now() }); });

  // ── Disconnect ───────────────────────────────────────────────────────────
  socket.on('disconnect', (reason) => {
    const fullyOffline = removeOnline(userId, socket.id);
    if (fullyOffline) {
      socket.broadcast.emit(EVENTS.USER_OFFLINE, { userId, onlineUsers: getOnlineUserIds() });
    }
    logger.info(`[Socket] User ${userId} disconnected (${reason}). Online: ${onlineUsers.size}`);
  });

  // ── Error ────────────────────────────────────────────────────────────────
  socket.on('error', (err) => {
    logger.error(`[Socket] Error from ${userId}: ${err.message}`);
  });
};
