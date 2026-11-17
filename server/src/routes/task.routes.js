/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task manager endpoints
 */
import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import * as ctrl from '../controllers/task.controller.js';

const router = Router();
router.use(protect);

const createValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 500 }),
  body('status').optional().isIn(['todo', 'in-progress', 'done']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('dueDate').optional().isISO8601(),
  body('labels').optional().isArray(),
  body('subtasks').optional().isArray(),
  body('applicationId').optional().isMongoId(),
];

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks (paginated, filtered)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [todo, in-progress, done] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [low, medium, high, urgent] }
 *       - in: query
 *         name: overdue
 *         schema: { type: string, enum: ["true", "false"] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 */
router.get('/', ctrl.getAll);

/**
 * @swagger
 * /tasks/board:
 *   get:
 *     summary: Get tasks grouped by status (Kanban board)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.get('/board', ctrl.getBoard);

/**
 * @swagger
 * /tasks/stats:
 *   get:
 *     summary: Get task statistics
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', ctrl.getStats);

/**
 * @swagger
 * /tasks/calendar:
 *   get:
 *     summary: Get tasks in a date range (for calendar view)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: end
 *         required: true
 *         schema: { type: string, format: date }
 */
router.get('/calendar', ctrl.getCalendar);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a single task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', ctrl.getOne);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status: { type: string }
 *               priority: { type: string }
 *               dueDate: { type: string, format: date-time }
 *               labels: { type: array, items: { type: string } }
 *               applicationId: { type: string }
 */
router.post('/', validate(createValidation), ctrl.create);

/**
 * @swagger
 * /tasks/bulk-delete:
 *   post:
 *     summary: Bulk delete tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/bulk-delete',
  validate([body('ids').isArray({ min: 1 })]),
  ctrl.bulkDelete
);

/**
 * @swagger
 * /tasks/bulk-status:
 *   post:
 *     summary: Bulk update task status
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/bulk-status',
  validate([
    body('ids').isArray({ min: 1 }),
    body('status').isIn(['todo', 'in-progress', 'done']),
  ]),
  ctrl.bulkUpdateStatus
);

/**
 * @swagger
 * /tasks/reorder:
 *   patch:
 *     summary: Reorder tasks on the board
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/reorder', validate([body('updates').isArray({ min: 1 })]), ctrl.reorder);

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', validate(createValidation), ctrl.update);

/**
 * @swagger
 * /tasks/{id}/status:
 *   patch:
 *     summary: Update task status
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id/status',
  validate([body('status').isIn(['todo', 'in-progress', 'done'])]),
  ctrl.updateStatus
);

/**
 * @swagger
 * /tasks/{id}/subtasks:
 *   post:
 *     summary: Add a subtask
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/subtasks',
  validate([body('title').trim().notEmpty()]),
  ctrl.addSubtask
);

/**
 * @swagger
 * /tasks/{id}/subtasks/{subtaskId}/toggle:
 *   patch:
 *     summary: Toggle subtask completion
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/subtasks/:subtaskId/toggle', ctrl.toggleSubtask);

/**
 * @swagger
 * /tasks/{id}/subtasks/{subtaskId}:
 *   delete:
 *     summary: Delete a subtask
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id/subtasks/:subtaskId', ctrl.deleteSubtask);

/**
 * @swagger
 * /tasks/{id}/restore:
 *   patch:
 *     summary: Restore a deleted task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/restore', ctrl.restore);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Soft-delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', ctrl.softDelete);

export default router;
