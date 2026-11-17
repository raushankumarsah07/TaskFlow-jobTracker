/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Analytics and dashboard data
 */
import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as ctrl from '../controllers/dashboard.controller.js';

const router = Router();
router.use(protect);

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Get dashboard summary (app stats, task stats, recent activity)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/summary', ctrl.getSummary);

/**
 * @swagger
 * /dashboard/timeline:
 *   get:
 *     summary: Applications created per day over last N days
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 30 }
 */
router.get('/timeline', ctrl.getApplicationTimeline);

/**
 * @swagger
 * /dashboard/weekly:
 *   get:
 *     summary: Weekly activity (apps + tasks per day of week)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/weekly', ctrl.getWeeklyActivity);

/**
 * @swagger
 * /dashboard/funnel:
 *   get:
 *     summary: Application conversion funnel
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/funnel', ctrl.getConversionFunnel);

/**
 * @swagger
 * /dashboard/streak:
 *   get:
 *     summary: Productivity streak
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/streak', ctrl.getProductivityStreak);

export default router;
