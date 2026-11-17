import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const generateAccessToken = (userId, role = 'user') => {
  return jwt.sign({ id: userId, role }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpires,
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpires,
  });
};

export const generateResetToken = (userId) => {
  return jwt.sign({ id: userId }, env.jwt.resetSecret, {
    expiresIn: env.jwt.resetExpires,
  });
};

export const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret);
export const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);
export const verifyResetToken = (token) => jwt.verify(token, env.jwt.resetSecret);
