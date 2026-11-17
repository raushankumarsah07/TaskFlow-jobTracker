/**
 * User Service — profile, avatar, change password
 */
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export const userService = {
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  },

  async updateProfile(userId, data) {
    const allowed = ['name', 'avatar'];
    const update = {};
    allowed.forEach((k) => { if (data[k] !== undefined) update[k] = data[k]; });
    const user = await User.findByIdAndUpdate(userId, update, { new: true, runValidators: true });
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  },

  async updateAvatar(userId, avatarPath) {
    const user = await User.findByIdAndUpdate(userId, { avatar: avatarPath }, { new: true });
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new ApiError(404, 'User not found');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new ApiError(400, 'Current password is incorrect');
    user.password = newPassword;
    await user.save();
    return { success: true };
  },
};
