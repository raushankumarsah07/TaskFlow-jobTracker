/**
 * Dashboard Controller
 */
import { dashboardService } from '../services/dashboard.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSummary(req.user._id);
  res.json({ success: true, data });
});

export const getApplicationTimeline = asyncHandler(async (req, res) => {
  const data = await dashboardService.getApplicationTimeline(req.user._id, parseInt(req.query.days) || 30);
  res.json({ success: true, data: { timeline: data } });
});

export const getWeeklyActivity = asyncHandler(async (req, res) => {
  const data = await dashboardService.getWeeklyActivity(req.user._id);
  res.json({ success: true, data: { weekly: data } });
});

export const getConversionFunnel = asyncHandler(async (req, res) => {
  const data = await dashboardService.getConversionFunnel(req.user._id);
  res.json({ success: true, data: { funnel: data } });
});

export const getProductivityStreak = asyncHandler(async (req, res) => {
  const data = await dashboardService.getProductivityStreak(req.user._id);
  res.json({ success: true, data });
});
