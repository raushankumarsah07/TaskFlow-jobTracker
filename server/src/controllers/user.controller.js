/**
 * User Controller — profile, avatar, password
 */
import { userService } from '../services/user.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';
import path from 'path';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user._id);
  res.json({ success: true, data: { user } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  res.json({ success: true, message: 'Profile updated', data: { user } });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const avatarUrl = `/uploads/${path.basename(req.file.path)}`;
  const user = await userService.updateAvatar(req.user._id, avatarUrl);
  res.json({ success: true, message: 'Avatar updated', data: { user, avatarUrl } });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user._id, currentPassword, newPassword);
  res.json({ success: true, message: 'Password changed successfully' });
});
