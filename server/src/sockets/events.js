/**
 * Socket event name constants — single source of truth for client and server
 */
export const EVENTS = {
  // ── Connection ──────────────────────────────────────────────
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // ── Applications ────────────────────────────────────────────
  APPLICATION_CREATED: 'application:created',
  APPLICATION_UPDATED: 'application:updated',
  APPLICATION_DELETED: 'application:deleted',
  APPLICATION_STATUS_CHANGED: 'application:statusChanged',
  APPLICATION_REORDERED: 'application:reordered',

  // ── Tasks ────────────────────────────────────────────────────
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  TASK_STATUS_CHANGED: 'task:statusChanged',
  TASK_REORDERED: 'task:reordered',
  SUBTASK_TOGGLED: 'task:subtaskToggled',

  // ── Notifications ────────────────────────────────────────────
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_ALL_READ: 'notification:allRead',

  // ── Reminders ────────────────────────────────────────────────
  REMINDER_DEADLINE: 'reminder:deadline',
  REMINDER_INTERVIEW: 'reminder:interview',

  // ── Presence ─────────────────────────────────────────────────
  USER_ONLINE: 'presence:online',
  USER_OFFLINE: 'presence:offline',
  ONLINE_USERS: 'presence:onlineUsers',

  // ── Typing / editing indicators ──────────────────────────────
  USER_EDITING: 'collab:editing',
  USER_STOPPED_EDITING: 'collab:stoppedEditing',

  // ── Client → Server join/leave workspace ─────────────────────
  JOIN_WORKSPACE: 'workspace:join',
  LEAVE_WORKSPACE: 'workspace:leave',
};
