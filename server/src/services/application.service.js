/**
 * Application Service — full CRUD, Kanban reorder, status history, stats, CSV export
 * Emits Socket.IO events after every mutation for real-time sync.
 */
import { JobApplication } from '../models/JobApplication.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { ApiError } from '../utils/ApiError.js';
import { EVENTS } from '../sockets/events.js';
import { emitToUser } from '../utils/socketEmitter.js';

// Lazy-load io to avoid circular dependency at startup
const getIO = async () => (await import('../config/socket.js')).io;

// ── Helpers ────────────────────────────────────────────────────────────────
const buildFilter = (userId, query) => {
  const filter = { userId, isDeleted: false };
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.jobType) filter.jobType = query.jobType;
  if (query.company) filter.company = { $regex: query.company, $options: 'i' };
  if (query.tag) filter.tags = query.tag.toLowerCase();
  if (query.search) filter.$text = { $search: query.search };
  if (query.dateFrom || query.dateTo) {
    filter.appliedDate = {};
    if (query.dateFrom) filter.appliedDate.$gte = new Date(query.dateFrom);
    if (query.dateTo) filter.appliedDate.$lte = new Date(query.dateTo);
  }
  if (query.deadlineBefore) filter.deadline = { $lte: new Date(query.deadlineBefore) };
  return filter;
};

const SORT_FIELDS = ['createdAt', 'appliedDate', 'deadline', 'company', 'role', 'priority', 'status'];

export const applicationService = {
  // ── GET all (paginated, filtered, sorted) ─────────────────────────────
  async getAll(userId, query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    const skip = (page - 1) * limit;
    const sortField = SORT_FIELDS.includes(query.sortBy) ? query.sortBy : 'createdAt';
    const sortOrder = query.order === 'asc' ? 1 : -1;

    const filter = buildFilter(userId, query);
    const [data, total] = await Promise.all([
      JobApplication.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true }),
      JobApplication.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  // ── GET Kanban (grouped by status) ────────────────────────────────────
  async getKanban(userId) {
    const statuses = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'];
    const apps = await JobApplication.find({ userId, isDeleted: false })
      .sort({ kanbanOrder: 1, createdAt: -1 })
      .lean({ virtuals: true });
    const board = {};
    statuses.forEach((s) => (board[s] = []));
    apps.forEach((a) => {
      if (board[a.status]) board[a.status].push(a);
    });
    return board;
  },

  // ── GET one ───────────────────────────────────────────────────────────
  async getOne(userId, id) {
    const app = await JobApplication.findOne({ _id: id, userId, isDeleted: false });
    if (!app) throw new ApiError(404, 'Application not found');
    return app;
  },

  // ── CREATE ────────────────────────────────────────────────────────────
  async create(userId, data) {
    const app = await JobApplication.create({ userId, ...data });
    await ActivityLog.create({ userId, action: 'CREATE_APPLICATION', entity: 'JobApplication', entityId: app._id, meta: { company: app.company, role: app.role } });
    const io = await getIO();
    emitToUser(io, userId.toString(), EVENTS.APPLICATION_CREATED, { application: app });
    return app;
  },

  // ── UPDATE ────────────────────────────────────────────────────────────
  async update(userId, id, data) {
    const app = await JobApplication.findOne({ _id: id, userId, isDeleted: false });
    if (!app) throw new ApiError(404, 'Application not found');
    Object.assign(app, data);
    await app.save();
    await ActivityLog.create({ userId, action: 'UPDATE_APPLICATION', entity: 'JobApplication', entityId: app._id, meta: { company: app.company } });
    const io = await getIO();
    emitToUser(io, userId.toString(), EVENTS.APPLICATION_UPDATED, { application: app });
    return app;
  },

  // ── PATCH status ──────────────────────────────────────────────────────
  async updateStatus(userId, id, status, note = '') {
    const app = await JobApplication.findOne({ _id: id, userId, isDeleted: false });
    if (!app) throw new ApiError(404, 'Application not found');
    const prevStatus = app.status;
    app.status = status;
    if (note) app.statusHistory[app.statusHistory.length - 1].note = note;
    await app.save();
    await ActivityLog.create({
      userId,
      action: 'STATUS_CHANGE',
      entity: 'JobApplication',
      entityId: app._id,
      meta: { from: prevStatus, to: status },
    });
    const io = await getIO();
    emitToUser(io, userId.toString(), EVENTS.APPLICATION_STATUS_CHANGED, {
      application: app,
      prevStatus,
      newStatus: status,
    });
    return app;
  },

  // ── PATCH Kanban reorder ───────────────────────────────────────────────
  async reorder(userId, updates) {
    // updates: [{ id, status, kanbanOrder }]
    const ops = updates.map(({ id, status, kanbanOrder }) => ({
      updateOne: {
        filter: { _id: id, userId },
        update: { $set: { status, kanbanOrder } },
      },
    }));
    await JobApplication.bulkWrite(ops);
    const io = await getIO();
    emitToUser(io, userId.toString(), EVENTS.APPLICATION_REORDERED, { updates });
    return { reordered: updates.length };
  },

  // ── DELETE (soft) ─────────────────────────────────────────────────────
  async softDelete(userId, id) {
    const app = await JobApplication.findOne({ _id: id, userId, isDeleted: false });
    if (!app) throw new ApiError(404, 'Application not found');
    app.isDeleted = true;
    app.deletedAt = new Date();
    await app.save();
    await ActivityLog.create({ userId, action: 'DELETE_APPLICATION', entity: 'JobApplication', entityId: app._id });
    const io = await getIO();
    emitToUser(io, userId.toString(), EVENTS.APPLICATION_DELETED, { applicationId: id });
    return app;
  },

  // ── RESTORE (undo delete) ─────────────────────────────────────────────
  async restore(userId, id) {
    const app = await JobApplication.findOne({ _id: id, userId, isDeleted: true });
    if (!app) throw new ApiError(404, 'Deleted application not found');
    app.isDeleted = false;
    app.deletedAt = null;
    await app.save();
    return app;
  },

  // ── BULK DELETE ───────────────────────────────────────────────────────
  async bulkDelete(userId, ids) {
    const result = await JobApplication.updateMany(
      { _id: { $in: ids }, userId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
    return { deleted: result.modifiedCount };
  },

  // ── STATS for dashboard ────────────────────────────────────────────────
  async getStats(userId) {
    const stats = await JobApplication.aggregate([
      { $match: { userId: new (await import('mongoose')).default.Types.ObjectId(userId), isDeleted: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    const result = { Wishlist: 0, Applied: 0, Interview: 0, Offer: 0, Rejected: 0, total: 0 };
    stats.forEach(({ _id, count }) => { result[_id] = count; result.total += count; });
    result.successRate = result.total ? Math.round((result.Offer / result.total) * 100) : 0;
    return result;
  },

  // ── Timeline (apps per day for last N days) ────────────────────────────
  async getTimeline(userId, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const mongoose = (await import('mongoose')).default;
    return JobApplication.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } },
    ]);
  },

  // ── CSV Export ────────────────────────────────────────────────────────
  async exportCsv(userId, query) {
    const filter = buildFilter(userId, { ...query, limit: undefined, page: undefined });
    const apps = await JobApplication.find(filter).sort({ createdAt: -1 }).lean();
    const header = 'Company,Role,Location,JobType,Status,Priority,AppliedDate,Deadline,SalaryMin,SalaryMax,JobLink,Tags,Notes\n';
    const rows = apps.map((a) =>
      [
        `"${a.company}"`, `"${a.role}"`, `"${a.location || ''}"`,
        a.jobType, a.status, a.priority,
        a.appliedDate?.toISOString().split('T')[0] || '',
        a.deadline?.toISOString().split('T')[0] || '',
        a.salaryMin || '', a.salaryMax || '',
        `"${a.jobLink || ''}"`,
        `"${(a.tags || []).join(';')}"`,
        `"${(a.notes || '').replace(/"/g, "'")}"`,
      ].join(',')
    ).join('\n');
    return header + rows;
  },

  // ── Status history ────────────────────────────────────────────────────
  async getHistory(userId, id) {
    const app = await JobApplication.findOne({ _id: id, userId }).select('statusHistory company role');
    if (!app) throw new ApiError(404, 'Application not found');
    return app.statusHistory;
  },

  // ── Add interview ─────────────────────────────────────────────────────
  async addInterview(userId, id, data) {
    const app = await JobApplication.findOne({ _id: id, userId, isDeleted: false });
    if (!app) throw new ApiError(404, 'Application not found');
    app.interviews.push(data);
    await app.save();
    return app.interviews[app.interviews.length - 1];
  },
};
