import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
// xss-clean is deprecated; we use a simple sanitizer instead
const xssClean = () => (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') return obj.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) obj[key] = sanitize(obj[key]);
    }
    return obj;
  };
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  next();
};
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './src/config/env.js';
import { globalLimiter } from './src/middleware/rateLimiter.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { logger } from './src/utils/logger.js';
import apiRoutes from './src/routes/index.js';
import { swaggerSpec, swaggerUiSetup, swaggerUi } from './src/config/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = () => {
  const app = express();

  // Security
  app.use(helmet({ crossOriginEmbedderPolicy: false }));
  app.use(
    cors({
      origin: env.client.url,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parsing & sanitization
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use(mongoSanitize());
  app.use(xssClean());
  app.use(compression());

  // Rate limiting
  app.use('/api/', globalLimiter);

  // Logging
  if (env.nodeEnv !== 'test') {
    app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));
  }

  // Static uploads
  app.use('/uploads', express.static(path.join(__dirname, env.upload.dir)));

  // API Docs
  app.use('/api/docs', swaggerUi.serve, swaggerUiSetup);

  // Routes
  app.use('/api/v1', apiRoutes);

  // Health check
  app.get('/health', (req, res) =>
    res.json({
      success: true,
      message: 'TaskFlow API is running',
      timestamp: new Date().toISOString(),
    })
  );

  // 404
  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};
