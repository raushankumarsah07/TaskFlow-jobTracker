/**
 * Application Controller
 */
import { applicationService } from '../services/application.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAll = asyncHandler(async (req, res) => {
  const result = await applicationService.getAll(req.user._id, req.query);
  res.json({ success: true, ...result });
});

export const getKanban = asyncHandler(async (req, res) => {
  const board = await applicationService.getKanban(req.user._id);
  res.json({ success: true, data: board });
});

export const getOne = asyncHandler(async (req, res) => {
  const app = await applicationService.getOne(req.user._id, req.params.id);
  res.json({ success: true, data: { application: app } });
});

export const create = asyncHandler(async (req, res) => {
  const app = await applicationService.create(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Application created', data: { application: app } });
});

export const update = asyncHandler(async (req, res) => {
  const app = await applicationService.update(req.user._id, req.params.id, req.body);
  res.json({ success: true, message: 'Application updated', data: { application: app } });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const app = await applicationService.updateStatus(req.user._id, req.params.id, status, note);
  res.json({ success: true, message: 'Status updated', data: { application: app } });
});

export const reorder = asyncHandler(async (req, res) => {
  const result = await applicationService.reorder(req.user._id, req.body.updates);
  res.json({ success: true, message: 'Board reordered', data: result });
});

export const softDelete = asyncHandler(async (req, res) => {
  await applicationService.softDelete(req.user._id, req.params.id);
  res.json({ success: true, message: 'Application deleted (can be restored)' });
});

export const restore = asyncHandler(async (req, res) => {
  const app = await applicationService.restore(req.user._id, req.params.id);
  res.json({ success: true, message: 'Application restored', data: { application: app } });
});

export const bulkDelete = asyncHandler(async (req, res) => {
  const result = await applicationService.bulkDelete(req.user._id, req.body.ids);
  res.json({ success: true, message: `${result.deleted} applications deleted`, data: result });
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await applicationService.getStats(req.user._id);
  res.json({ success: true, data: { stats } });
});

export const getTimeline = asyncHandler(async (req, res) => {
  const timeline = await applicationService.getTimeline(req.user._id, parseInt(req.query.days) || 30);
  res.json({ success: true, data: { timeline } });
});

export const exportCsv = asyncHandler(async (req, res) => {
  const csv = await applicationService.exportCsv(req.user._id, req.query);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="applications.csv"');
  res.send(csv);
});

export const getHistory = asyncHandler(async (req, res) => {
  const history = await applicationService.getHistory(req.user._id, req.params.id);
  res.json({ success: true, data: { history } });
});

export const addInterview = asyncHandler(async (req, res) => {
  const interview = await applicationService.addInterview(req.user._id, req.params.id, req.body);
  res.status(201).json({ success: true, message: 'Interview scheduled', data: { interview } });
});
