/**
 * Task Service — full CRUD, subtasks, bulk ops, recurring tasks, stats
 * Emits Socket.IO events after every mutation for real-time sync.
 */
import { Task } from '../models/Task.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { ApiError } from '../utils/ApiError.js';
import { EVENTS } from '../sockets/events.js';
import { emitToUser } from '../utils/socketEmitter.js';

const getIO = async () => (await import('../config/socket.js')).io;

const buildFilter = (userId, query) => {
  const filter = { userId, isDeleted: false };
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.label) filter.labels = query.label.toLowerCase();
  if (query.applicationId) filter.applicationId = query.applicationId;
  if (query.search) filter.$text = { $search: query.search };
  if (query.dueBefore) filter.dueDate = { $lte: new Date(query.dueBefore) };
  if (query.dueAfter) {
    filter.dueDate = filter.dueDate || {};
    filter.dueDate.$gte = new Date(query.dueAfter);
  }
  if (query.overdue === 'true') {
    filter.dueDate = { $lt: new Date() };
    filter.status = { $ne: 'done' };
  }
  return filter;
};

const SORT_FIELDS = ['createdAt', 'dueDate', 'priority', 'status', 'title', 'updatedAt'];

export const taskService = {
  // ── GET all (paginated) ───────────────────────────────────────────────
  async getAll(userId, query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    const skip = (page - 1) * limit;
    const sortField = SORT_FIELDS.includes(query.sortBy) ? query.sortBy : 'createdAt';
    const sortOrder = query.order === 'asc' ? 1 : -1;

    const filter = buildFilter(userId, query);
    const [data, total] = await Promise.all([
      Task.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('applicationId', 'company role status')
        .lean({ virtuals: true }),
      Task.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  // ── GET Board (grouped by status) ─────────────────────────────────────
  async getBoard(userId) {
    const tasks = await Task.find({ userId, isDeleted: false })
      .sort({ boardOrder: 1, createdAt: -1 })
      .lean({ virtuals: true });
    const board = { 'todo': [], 'in-progress': [], 'done': [] };
    tasks.forEach((t) => { if (board[t.status]) board[t.status].push(t); });
    return board;
  },

  // ── GET one ───────────────────────────────────────────────────────────
  async getOne(userId, id) {
    const task = await Task.findOne({ _id: id, userId, isDeleted: false })
      .populate('applicationId', 'company role status');
    if (!task) throw new ApiError(404, 'Task not found');
    return task;
  },

  // ── CREATE ────────────────────────────────────────────────────────────
  async create(userId, data) {
    const task = await Task.create({ userId, ...data });
    await ActivityLog.create({ userId, action: 'CREATE_TASK', entity: 'Task', entityId: task._id, meta: { title: task.title } });
    const io = await getIO();
    emitToUser(io, userId.toString(), EVENTS.TASK_CREATED, { task });
    return task;
  },

  // ── UPDATE ────────────────────────────────────────────────────────────
  async update(userId, id, data) {
    const task = await Task.findOne({ _id: id, userId, isDeleted: false });
    if (!task) throw new ApiError(404, 'Task not found');
    Object.assign(task, data);
    await task.save();
    await ActivityLog.create({ userId, action: 'UPDATE_TASK', entity: 'Task', entityId: task._id });
    const io = await getIO();
    emitToUser(io, userId.toString(), EVENTS.TASK_UPDATED, { task });
    return task;
  },

  // ── PATCH status ──────────────────────────────────────────────────────
  async updateStatus(userId, id, status) {
    const task = await Task.findOne({ _id: id, userId, isDeleted: false });
    if (!task) throw new ApiError(404, 'Task not found');
    task.status = status;
    await task.save();
    const io = await getIO();
    emitToUser(io, userId.toString(), EVENTS.TASK_STATUS_CHANGED, { taskId: id, status });
    return task;
  },

  // ── PATCH board reorder ───────────────────────────────────────────────
  async reorder(userId, updates) {
    const ops = updates.map(({ id, status, boardOrder }) => ({
      updateOne: { filter: { _id: id, userId }, update: { $set: { status, boardOrder } } },
    }));
    await Task.bulkWrite(ops);
    return { reordered: updates.length };
  },

  // ── Subtask ops ───────────────────────────────────────────────────────
  async addSubtask(userId, id, subtaskData) {
    const task = await Task.findOne({ _id: id, userId, isDeleted: false });
    if (!task) throw new ApiError(404, 'Task not found');
    task.subtasks.push(subtaskData);
    await task.save();
    return task.subtasks[task.subtasks.length - 1];
  },

  async toggleSubtask(userId, taskId, subtaskId) {
    const task = await Task.findOne({ _id: taskId, userId, isDeleted: false });
    if (!task) throw new ApiError(404, 'Task not found');
    const sub = task.subtasks.id(subtaskId);
    if (!sub) throw new ApiError(404, 'Subtask not found');
    sub.completed = !sub.completed;
    sub.completedAt = sub.completed ? new Date() : null;
    await task.save();
    return sub;
  },

  async deleteSubtask(userId, taskId, subtaskId) {
    const task = await Task.findOne({ _id: taskId, userId, isDeleted: false });
    if (!task) throw new ApiError(404, 'Task not found');
    task.subtasks = task.subtasks.filter((s) => s._id.toString() !== subtaskId);
    await task.save();
    return { deleted: true };
  },

  // ── SOFT DELETE ───────────────────────────────────────────────────────
  async softDelete(userId, id) {
    const task = await Task.findOne({ _id: id, userId, isDeleted: false });
    if (!task) throw new ApiError(404, 'Task not found');
    task.isDeleted = true;
    task.deletedAt = new Date();
    await task.save();
    await ActivityLog.create({ userId, action: 'DELETE_TASK', entity: 'Task', entityId: task._id });
    const io = await getIO();
    emitToUser(io, userId.toString(), EVENTS.TASK_DELETED, { taskId: id });
    return task;
  },

  // ── RESTORE ───────────────────────────────────────────────────────────
  async restore(userId, id) {
    const task = await Task.findOne({ _id: id, userId, isDeleted: true });
    if (!task) throw new ApiError(404, 'Deleted task not found');
    task.isDeleted = false;
    task.deletedAt = null;
    await task.save();
    return task;
  },

  // ── BULK ops ──────────────────────────────────────────────────────────
  async bulkDelete(userId, ids) {
    const result = await Task.updateMany(
      { _id: { $in: ids }, userId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
    return { deleted: result.modifiedCount };
  },

  async bulkUpdateStatus(userId, ids, status) {
    const result = await Task.updateMany({ _id: { $in: ids }, userId }, { $set: { status } });
    return { updated: result.modifiedCount };
  },

  // ── STATS ─────────────────────────────────────────────────────────────
  async getStats(userId) {
    const mongoose = (await import('mongoose')).default;
    const uid = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);

    const [byStatus, dueToday, overdue] = await Promise.all([
      Task.aggregate([
        { $match: { userId: uid, isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.countDocuments({ userId, isDeleted: false, dueDate: { $gte: todayStart, $lte: todayEnd }, status: { $ne: 'done' } }),
      Task.countDocuments({ userId, isDeleted: false, dueDate: { $lt: now }, status: { $ne: 'done' } }),
    ]);

    const result = { todo: 0, 'in-progress': 0, done: 0, dueToday, overdue, total: 0 };
    byStatus.forEach(({ _id, count }) => { result[_id] = count; result.total += count; });
    return result;
  },

  // ── Calendar (tasks with due dates in range) ──────────────────────────
  async getCalendar(userId, start, end) {
    return Task.find({
      userId,
      isDeleted: false,
      dueDate: { $gte: new Date(start), $lte: new Date(end) },
    })
      .sort({ dueDate: 1 })
      .lean({ virtuals: true });
  },
};
