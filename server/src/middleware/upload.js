import multer from 'multer';
import path from 'path';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, env.upload.dir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${req.user?.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new ApiError(400, 'Only image files are allowed'), false);
};

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.upload.maxSize },
}).single('avatar');
