/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notifications
 */
import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as ctrl from '../controllers/notification.controller.js';

const router = Router();
router.use(protect);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications for current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unread
 *         schema: { type: string, enum: ["true", "false"] }
 */
router.get('/', ctrl.getAll);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/read-all', ctrl.markAllRead);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/read', ctrl.markRead);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', ctrl.deleteOne);

export default router;
