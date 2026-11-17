/**
 * Reminder Cron Job
 * Runs every 15 minutes, checks upcoming deadlines and interview schedules,
 * pushes real-time + persistent notifications via Socket.IO.
 */
import cron from 'node-cron';
import { JobApplication } from '../models/JobApplication.js';
import { Task } from '../models/Task.js';
import { logger } from '../utils/logger.js';
import { pushNotification } from '../utils/socketEmitter.js';

/** Hours ahead to warn about deadlines */
const DEADLINE_WARN_HOURS = [24, 2]; // warn at 24h and 2h before
/** Hours ahead to warn about interviews */
const INTERVIEW_WARN_HOURS = [24, 1]; // warn at 24h and 1h before

/**
 * Build a time range window centred around `hoursAhead` ± 7.5 minutes
 * (matches the 15-minute cron cadence).
 */
const windowAround = (hoursAhead) => {
  const now = Date.now();
  const target = now + hoursAhead * 60 * 60 * 1000;
  return {
    $gte: new Date(target - 7.5 * 60 * 1000),
    $lte: new Date(target + 7.5 * 60 * 1000),
  };
};

/** Check job application deadlines */
const checkDeadlines = async (io) => {
  for (const hours of DEADLINE_WARN_HOURS) {
    const window = windowAround(hours);
    const apps = await JobApplication.find({
      isDeleted: false,
      status: { $nin: ['Offer', 'Rejected'] },
      deadline: window,
    }).select('userId company role deadline');

    for (const app of apps) {
      logger.info(`[Reminder] Deadline in ${hours}h: ${app.company} - ${app.role} (user: ${app.userId})`);
      await pushNotification(io, app.userId.toString(), {
        title: `⏰ Deadline in ${hours === 1 ? '1 hour' : `${hours} hours`}`,
        message: `Your application to ${app.company} for "${app.role}" is due soon.`,
        type: 'reminder',
        link: `/applications/${app._id}`,
        meta: { applicationId: app._id, deadline: app.deadline, hours },
      });
    }
  }
};

/** Check upcoming interview schedules */
const checkInterviews = async (io) => {
  for (const hours of INTERVIEW_WARN_HOURS) {
    const window = windowAround(hours);

    // Find applications that have an upcoming interview in this window
    const apps = await JobApplication.find({
      isDeleted: false,
      'interviews.scheduledAt': window,
      'interviews.completed': false,
    }).select('userId company role interviews');

    for (const app of apps) {
      const upcoming = app.interviews.filter((iv) => {
        if (iv.completed || !iv.scheduledAt) return false;
        const t = iv.scheduledAt.getTime();
        const target = Date.now() + hours * 60 * 60 * 1000;
        return Math.abs(t - target) <= 7.5 * 60 * 1000;
      });

      for (const iv of upcoming) {
        logger.info(`[Reminder] Interview in ${hours}h: ${app.company} - ${iv.round} (user: ${app.userId})`);
        await pushNotification(io, app.userId.toString(), {
          title: `🎙️ Interview in ${hours === 1 ? '1 hour' : `${hours} hours`}`,
          message: `${iv.round || 'Interview'} with ${app.company} is coming up. ${iv.meetingLink ? `Link: ${iv.meetingLink}` : ''}`,
          type: 'reminder',
          link: `/applications/${app._id}`,
          meta: { applicationId: app._id, interviewId: iv._id, scheduledAt: iv.scheduledAt, hours },
        });
      }
    }
  }
};

/** Check overdue tasks */
const checkOverdueTasks = async (io) => {
  // Only run once per hour (at :00) — check for tasks that became overdue in the last 15 mins
  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
  const now = new Date();

  const tasks = await Task.find({
    isDeleted: false,
    status: { $ne: 'done' },
    dueDate: { $gte: fifteenMinsAgo, $lte: now },
  }).select('userId title dueDate');

  for (const task of tasks) {
    logger.info(`[Reminder] Task overdue: ${task.title} (user: ${task.userId})`);
    await pushNotification(io, task.userId.toString(), {
      title: '⚠️ Task Overdue',
      message: `"${task.title}" was due and hasn't been completed yet.`,
      type: 'warning',
      link: `/tasks/${task._id}`,
      meta: { taskId: task._id, dueDate: task.dueDate },
    });
  }
};

/**
 * Start all cron jobs.
 * @param {import('socket.io').Server} io
 */
export const startReminderJobs = (io) => {
  // Every 15 minutes — deadline + interview reminders
  cron.schedule('*/15 * * * *', async () => {
    logger.info('[Cron] Running reminder check...');
    try {
      await checkDeadlines(io);
      await checkInterviews(io);
      await checkOverdueTasks(io);
    } catch (err) {
      logger.error(`[Cron] Reminder error: ${err.message}`);
    }
  });

  // Daily at 8:00 AM — morning digest (upcoming deadlines in the next 7 days)
  cron.schedule('0 8 * * *', async () => {
    logger.info('[Cron] Running morning digest...');
    try {
      const in7days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const apps = await JobApplication.find({
        isDeleted: false,
        status: { $nin: ['Offer', 'Rejected'] },
        deadline: { $gte: new Date(), $lte: in7days },
      }).select('userId company role deadline');

      // Group by user
      const byUser = {};
      apps.forEach((a) => {
        const uid = a.userId.toString();
        if (!byUser[uid]) byUser[uid] = [];
        byUser[uid].push(a);
      });

      for (const [uid, userApps] of Object.entries(byUser)) {
        const appList = userApps.map((a) => `• ${a.company} - ${a.role}`).join('\n');
        await pushNotification(io, uid, {
          title: '📅 Upcoming Deadlines This Week',
          message: `You have ${userApps.length} application deadline(s) this week:\n${appList}`,
          type: 'info',
          link: '/applications',
        });
      }
    } catch (err) {
      logger.error(`[Cron] Morning digest error: ${err.message}`);
    }
  });

  logger.info('[Cron] Reminder jobs scheduled (every 15 min + daily 8 AM digest)');
};
