import { authService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const sendTokenResponse = (res, statusCode, { user, accessToken, refreshToken }) => {
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  res.status(statusCode).json({
    success: true,
    message: 'Success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
    },
  });
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await authService.register(name, email, password);
  sendTokenResponse(res, 201, result);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password, req.ip);
  sendTokenResponse(res, 200, result);
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (req.user && refreshToken) {
    await authService.logout(req.user._id, refreshToken);
  }
  res.clearCookie('refreshToken', { ...COOKIE_OPTIONS, maxAge: 0 });
  res.json({ success: true, message: 'Logged out successfully' });
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const tokens = await authService.refreshTokens(refreshToken);
  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);
  res.json({ success: true, data: { accessToken: tokens.accessToken } });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  res.json({ success: true, message: 'Password reset successfully. Please log in.' });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  res.json({ success: true, data: { user } });
});
