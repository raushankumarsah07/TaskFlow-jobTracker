import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/generateToken.js';
import { User } from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) throw new ApiError(401, 'Not authenticated. Please log in.');

  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.id).select('-password');
  if (!user || !user.isActive) throw new ApiError(401, 'User not found or inactive.');
  if (user.changedPasswordAfter(decoded.iat))
    throw new ApiError(401, 'Password recently changed. Please log in again.');

  req.user = user;
  next();
});
