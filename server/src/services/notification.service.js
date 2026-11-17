/**
 * Notification Service
 */
import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';

export const notificationService = {
  async getAll(userId, query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(50, parseInt(query.limit) || 20);
    const filter = { userId };
    if (query.unread === 'true') filter.isRead = false;

    const [data, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId, isRead: false }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit), unreadCount } };
  },

  async markRead(userId, id) {
    const n = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );
    if (!n) throw new ApiError(404, 'Notification not found');
    return n;
  },

  async markAllRead(userId) {
    const result = await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    return { updated: result.modifiedCount };
  },

  async deleteOne(userId, id) {
    const n = await Notification.findOneAndDelete({ _id: id, userId });
    if (!n) throw new ApiError(404, 'Notification not found');
    return { deleted: true };
  },

  async create(userId, data) {
    return Notification.create({ userId, ...data });
  },
};
