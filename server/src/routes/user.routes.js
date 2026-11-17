/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile management
 */
import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { uploadAvatar as multerUpload } from '../middleware/upload.js';
import * as ctrl from '../controllers/user.controller.js';

const router = Router();
router.use(protect);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile', ctrl.getProfile);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update profile (name)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 */
router.put(
  '/profile',
  validate([body('name').optional().trim().isLength({ min: 1, max: 100 })]),
  ctrl.updateProfile
);

/**
 * @swagger
 * /users/avatar:
 *   post:
 *     summary: Upload a new avatar image
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar: { type: string, format: binary }
 */
router.post('/avatar', multerUpload, ctrl.uploadAvatar);

/**
 * @swagger
 * /users/change-password:
 *   post:
 *     summary: Change password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 */
router.post(
  '/change-password',
  validate([
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must be at least 8 chars with upper, lower, number'),
  ]),
  ctrl.changePassword
);

export default router;
