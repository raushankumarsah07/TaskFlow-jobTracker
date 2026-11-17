import dotenv from 'dotenv';
dotenv.config();

const required = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'MONGO_URI'];
required.forEach((key) => {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`);
});

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5001,
  mongoUri: process.env.MONGO_URI,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
    resetSecret: process.env.JWT_RESET_SECRET || 'reset_secret',
    resetExpires: process.env.JWT_RESET_EXPIRES || '1h',
  },
  client: {
    url: process.env.CLIENT_URL || 'http://localhost:3000',
    cookieDomain: process.env.COOKIE_DOMAIN || 'localhost',
  },
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024,
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'TaskFlow <noreply@taskflow.com>',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
  logLevel: process.env.LOG_LEVEL || 'info',
};
