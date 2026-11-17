/**
 * API v1 Router — mounts all sub-routers
 */
import { Router } from 'express';
import authRoutes from './auth.routes.js';
import applicationRoutes from './application.routes.js';
import taskRoutes from './task.routes.js';
import notificationRoutes from './notification.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/applications', applicationRoutes);
router.use('/tasks', taskRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);

export default router;
