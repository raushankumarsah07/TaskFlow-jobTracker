/**
 * Notification Controller
 */
import { notificationService } from '../services/notification.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAll = asyncHandler(async (req, res) => {
  const result = await notificationService.getAll(req.user._id, req.query);
  res.json({ success: true, ...result });
});

export const markRead = asyncHandler(async (req, res) => {
  const n = await notificationService.markRead(req.user._id, req.params.id);
  res.json({ success: true, data: { notification: n } });
});

export const markAllRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllRead(req.user._id);
  res.json({ success: true, message: `${result.updated} notifications marked read`, data: result });
});

export const deleteOne = asyncHandler(async (req, res) => {
  await notificationService.deleteOne(req.user._id, req.params.id);
  res.json({ success: true, message: 'Notification deleted' });
});
