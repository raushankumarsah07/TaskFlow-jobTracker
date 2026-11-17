/**
 * socketEmitter — emit real-time events from services without coupling to socket.io
 * Import `io` lazily to avoid circular deps at startup.
 */
import { EVENTS } from '../sockets/events.js';

/**
 * Emit an event to a specific user's private room.
 * @param {object} io - Socket.IO server instance
 * @param {string} userId
 * @param {string} event
 * @param {object} payload
 */
export const emitToUser = (io, userId, event, payload) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};

/**
 * Emit an event to all members of a workspace room.
 * @param {object} io
 * @param {string} workspaceId
 * @param {string} event
 * @param {object} payload
 */
export const emitToWorkspace = (io, workspaceId, event, payload) => {
  if (!io) return;
  io.to(`workspace:${workspaceId}`).emit(event, payload);
};

/**
 * Broadcast a notification to a user and persist it.
 */
export const pushNotification = async (io, userId, notifData) => {
  try {
    const { Notification } = await import('../models/Notification.js');
    const notif = await Notification.create({ userId, ...notifData });
    emitToUser(io, userId, EVENTS.NOTIFICATION_NEW, notif);
    return notif;
  } catch (err) {
    console.error('[pushNotification] error:', err.message);
  }
};
