import { User } from '../models/User.js';
import { Token } from '../models/Token.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { ApiError } from '../utils/ApiError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyRefreshToken,
  verifyResetToken,
} from '../utils/generateToken.js';
import { sendEmail } from '../utils/email.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const saveRefreshToken = async (userId, token) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await Token.create({ userId, token, type: 'refresh', expiresAt });
};

export const authService = {
  async register(name, email, password) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new ApiError(409, 'Email already registered');

    const user = await User.create({ name, email, password });
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    await saveRefreshToken(user._id, refreshToken);

    return { user, accessToken, refreshToken };
  },

  async login(email, password, ip) {
    const user = await User.findByEmail(email);
    if (!user || !user.isActive) throw new ApiError(401, 'Invalid credentials');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new ApiError(401, 'Invalid credentials');

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    await ActivityLog.create({ userId: user._id, action: 'LOGIN', ip });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    await saveRefreshToken(user._id, refreshToken);

    return { user, accessToken, refreshToken };
  },

  async logout(userId, refreshToken) {
    await Token.deleteOne({ userId, token: refreshToken, type: 'refresh' });
    await ActivityLog.create({ userId, action: 'LOGOUT' });
  },

  async refreshTokens(refreshToken) {
    if (!refreshToken) throw new ApiError(401, 'No refresh token');

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const stored = await Token.findOne({ userId: decoded.id, token: refreshToken, type: 'refresh' });
    if (!stored) throw new ApiError(401, 'Refresh token not found or already used');

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) throw new ApiError(401, 'User not found');

    // Rotate refresh token
    await Token.deleteOne({ _id: stored._id });
    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);
    await saveRefreshToken(user._id, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async forgotPassword(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return; // Don't reveal if email exists

    const resetToken = generateResetToken(user._id);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await Token.deleteMany({ userId: user._id, type: 'reset' });
    await Token.create({ userId: user._id, token: resetToken, type: 'reset', expiresAt });

    const resetLink = `${env.client.url}/reset-password?token=${resetToken}`;

    if (env.nodeEnv === 'development' || env.nodeEnv === 'test') {
      logger.info(`[DEV] Password reset link for ${email}: ${resetLink}`);
    }

    await sendEmail({
      to: email,
      subject: 'TaskFlow — Reset Your Password',
      html: `<p>Hi ${user.name},</p><p>Click the link below to reset your password (expires in 1 hour):</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you did not request this, ignore this email.</p>`,
    });

    return resetLink;
  },

  async resetPassword(resetToken, newPassword) {
    let decoded;
    try {
      decoded = verifyResetToken(resetToken);
    } catch {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    const stored = await Token.findOne({ userId: decoded.id, token: resetToken, type: 'reset' });
    if (!stored) throw new ApiError(400, 'Reset token already used or not found');

    const user = await User.findById(decoded.id);
    if (!user) throw new ApiError(404, 'User not found');

    user.password = newPassword;
    await user.save();

    await Token.deleteMany({ userId: user._id, type: 'reset' });
    await Token.deleteMany({ userId: user._id, type: 'refresh' });

    return user;
  },

  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  },
};
