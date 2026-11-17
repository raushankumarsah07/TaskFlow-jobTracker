import http from 'http';
import { createApp } from './app.js';
import { connectDB } from './src/config/db.js';
import { initSocket } from './src/config/socket.js';
import { env } from './src/config/env.js';
import { logger } from './src/utils/logger.js';
import fs from 'fs';

// Ensure upload and logs directories exist
['uploads', 'logs'].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const startServer = async () => {
  await connectDB();

  const app = createApp();
  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.port, () => {
    logger.info(`TaskFlow server running on port ${env.port} in ${env.nodeEnv} mode`);
    logger.info(`API Docs: http://localhost:${env.port}/api/docs`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    httpServer.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    process.exit(1);
  });
};

startServer();
