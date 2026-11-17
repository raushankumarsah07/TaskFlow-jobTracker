/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Job application tracker endpoints
 */
import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import * as ctrl from '../controllers/application.controller.js';

const router = Router();

// All application routes require auth
router.use(protect);

// ── Validation rules ───────────────────────────────────────────────────────
const createValidation = [
  body('company').trim().notEmpty().withMessage('Company is required').isLength({ max: 200 }),
  body('role').trim().notEmpty().withMessage('Role is required').isLength({ max: 200 }),
  body('status').optional().isIn(['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('jobType').optional().isIn(['remote', 'hybrid', 'onsite']),
  body('salaryMin').optional().isNumeric(),
  body('salaryMax').optional().isNumeric(),
  body('appliedDate').optional().isISO8601(),
  body('deadline').optional().isISO8601(),
  body('jobLink').optional().isURL().withMessage('Must be a valid URL'),
  body('tags').optional().isArray(),
  body('contacts').optional().isArray(),
];

const statusValidation = [
  body('status').isIn(['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected']).withMessage('Invalid status'),
];

const interviewValidation = [
  body('round').trim().notEmpty().withMessage('Round name is required'),
  body('scheduledAt').optional().isISO8601(),
  body('meetingLink').optional().isURL(),
];

/**
 * @swagger
 * /applications:
 *   get:
 *     summary: Get all applications (paginated, filtered, sorted)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Wishlist, Applied, Interview, Offer, Rejected] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [low, medium, high] }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *       - in: query
 *         name: company
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated list of applications
 */
router.get('/', ctrl.getAll);

/**
 * @swagger
 * /applications/kanban:
 *   get:
 *     summary: Get applications grouped by Kanban status
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kanban board object { Wishlist[], Applied[], Interview[], Offer[], Rejected[] }
 */
router.get('/kanban', ctrl.getKanban);

/**
 * @swagger
 * /applications/stats:
 *   get:
 *     summary: Get application statistics
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', ctrl.getStats);

/**
 * @swagger
 * /applications/timeline:
 *   get:
 *     summary: Applications created per day over last N days
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 30 }
 */
router.get('/timeline', ctrl.getTimeline);

/**
 * @swagger
 * /applications/export:
 *   get:
 *     summary: Export applications as CSV
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get('/export', ctrl.exportCsv);

/**
 * @swagger
 * /applications/{id}:
 *   get:
 *     summary: Get a single application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.get('/:id', ctrl.getOne);

/**
 * @swagger
 * /applications/{id}/history:
 *   get:
 *     summary: Get status change history for an application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/history', ctrl.getHistory);

/**
 * @swagger
 * /applications:
 *   post:
 *     summary: Create a new application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [company, role]
 *             properties:
 *               company: { type: string }
 *               role: { type: string }
 *               status: { type: string }
 *               priority: { type: string }
 *               jobType: { type: string }
 *               location: { type: string }
 *               jobLink: { type: string }
 *               salaryMin: { type: number }
 *               salaryMax: { type: number }
 *               appliedDate: { type: string, format: date }
 *               deadline: { type: string, format: date }
 *               notes: { type: string }
 *               tags: { type: array, items: { type: string } }
 */
router.post('/', validate(createValidation), ctrl.create);

/**
 * @swagger
 * /applications/bulk-delete:
 *   post:
 *     summary: Bulk soft-delete multiple applications
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
router.post('/bulk-delete', validate([body('ids').isArray({ min: 1 })]), ctrl.bulkDelete);

/**
 * @swagger
 * /applications/reorder:
 *   patch:
 *     summary: Reorder Kanban cards (drag-and-drop)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/reorder', validate([body('updates').isArray({ min: 1 })]), ctrl.reorder);

/**
 * @swagger
 * /applications/{id}:
 *   put:
 *     summary: Update an application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', validate(createValidation), ctrl.update);

/**
 * @swagger
 * /applications/{id}/status:
 *   patch:
 *     summary: Update application status
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/status', validate(statusValidation), ctrl.updateStatus);

/**
 * @swagger
 * /applications/{id}/interviews:
 *   post:
 *     summary: Schedule an interview for an application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/interviews', validate(interviewValidation), ctrl.addInterview);

/**
 * @swagger
 * /applications/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/restore', ctrl.restore);

/**
 * @swagger
 * /applications/{id}:
 *   delete:
 *     summary: Soft-delete an application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', ctrl.softDelete);

export default router;
