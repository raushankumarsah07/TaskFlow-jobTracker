/**
 * Dashboard Service — MongoDB aggregation pipelines for analytics
 */
import { JobApplication } from '../models/JobApplication.js';
import { Task } from '../models/Task.js';
import { ActivityLog } from '../models/ActivityLog.js';
import mongoose from 'mongoose';

export const dashboardService = {
  async getSummary(userId) {
    const uid = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);

    const [appStats, taskStats, recentActivity] = await Promise.all([
      // Application aggregation
      JobApplication.aggregate([
        { $match: { userId: uid, isDeleted: false } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // Task aggregation
      Task.aggregate([
        { $match: { userId: uid, isDeleted: false } },
        {
          $facet: {
            byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
            dueToday: [
              { $match: { dueDate: { $gte: todayStart, $lte: todayEnd }, status: { $ne: 'done' } } },
              { $count: 'count' },
            ],
            overdue: [
              { $match: { dueDate: { $lt: todayStart }, status: { $ne: 'done' } } },
              { $count: 'count' },
            ],
          },
        },
      ]),

      // Recent activity (last 10 entries)
      ActivityLog.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    // Format app stats
    const apps = { Wishlist: 0, Applied: 0, Interview: 0, Offer: 0, Rejected: 0, total: 0 };
    appStats.forEach(({ _id, count }) => { apps[_id] = count; apps.total += count; });
    apps.successRate = apps.total ? Math.round((apps.Offer / apps.total) * 100) : 0;

    // Format task stats
    const taskFacet = taskStats[0] || {};
    const tasks = { todo: 0, 'in-progress': 0, done: 0, dueToday: 0, overdue: 0 };
    (taskFacet.byStatus || []).forEach(({ _id, count }) => { tasks[_id] = count; });
    tasks.dueToday = taskFacet.dueToday?.[0]?.count || 0;
    tasks.overdue = taskFacet.overdue?.[0]?.count || 0;

    return { apps, tasks, recentActivity };
  },

  async getApplicationTimeline(userId, days = 30) {
    const uid = new mongoose.Types.ObjectId(userId);
    const since = new Date();
    since.setDate(since.getDate() - days);

    return JobApplication.aggregate([
      { $match: { userId: uid, isDeleted: false, createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
      { $project: { date: '$_id.date', status: '$_id.status', count: 1, _id: 0 } },
    ]);
  },

  async getWeeklyActivity(userId) {
    const uid = new mongoose.Types.ObjectId(userId);
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const [apps, tasks] = await Promise.all([
      JobApplication.aggregate([
        { $match: { userId: uid, isDeleted: false, createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dayOfWeek: '$createdAt' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Task.aggregate([
        { $match: { userId: uid, isDeleted: false, createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dayOfWeek: '$createdAt' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = days.map((name, i) => ({
      day: name,
      applications: apps.find((a) => a._id === i + 1)?.count || 0,
      tasks: tasks.find((t) => t._id === i + 1)?.count || 0,
    }));
    return result;
  },

  async getConversionFunnel(userId) {
    const uid = new mongoose.Types.ObjectId(userId);
    const statuses = ['Wishlist', 'Applied', 'Interview', 'Offer'];
    const pipeline = [
      { $match: { userId: uid, isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ];
    const data = await JobApplication.aggregate(pipeline);
    const map = {};
    data.forEach(({ _id, count }) => (map[_id] = count));
    return statuses.map((s) => ({ stage: s, count: map[s] || 0 }));
  },

  async getProductivityStreak(userId) {
    // Count how many consecutive days the user has had activity
    const logs = await ActivityLog.find({ userId })
      .sort({ createdAt: -1 })
      .select('createdAt')
      .lean();

    if (!logs.length) return { streak: 0, longestStreak: 0 };

    const toDay = (d) => new Date(d).toISOString().split('T')[0];
    const days = [...new Set(logs.map((l) => toDay(l.createdAt)))];

    let streak = 0;
    let today = toDay(new Date());
    for (const day of days) {
      if (day === today) { streak++; }
      else {
        const prev = new Date(today);
        prev.setDate(prev.getDate() - 1);
        if (day === toDay(prev)) { streak++; today = day; }
        else break;
      }
    }
    return { streak, lastActive: days[0] };
  },
};
