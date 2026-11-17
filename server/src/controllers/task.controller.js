/**
 * Task Controller
 */
import { taskService } from '../services/task.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAll = asyncHandler(async (req, res) => {
  const result = await taskService.getAll(req.user._id, req.query);
  res.json({ success: true, ...result });
});

export const getBoard = asyncHandler(async (req, res) => {
  const board = await taskService.getBoard(req.user._id);
  res.json({ success: true, data: board });
});

export const getOne = asyncHandler(async (req, res) => {
  const task = await taskService.getOne(req.user._id, req.params.id);
  res.json({ success: true, data: { task } });
});

export const create = asyncHandler(async (req, res) => {
  const task = await taskService.create(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Task created', data: { task } });
});

export const update = asyncHandler(async (req, res) => {
  const task = await taskService.update(req.user._id, req.params.id, req.body);
  res.json({ success: true, message: 'Task updated', data: { task } });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const task = await taskService.updateStatus(req.user._id, req.params.id, req.body.status);
  res.json({ success: true, message: 'Status updated', data: { task } });
});

export const reorder = asyncHandler(async (req, res) => {
  const result = await taskService.reorder(req.user._id, req.body.updates);
  res.json({ success: true, message: 'Board reordered', data: result });
});

export const addSubtask = asyncHandler(async (req, res) => {
  const subtask = await taskService.addSubtask(req.user._id, req.params.id, req.body);
  res.status(201).json({ success: true, message: 'Subtask added', data: { subtask } });
});

export const toggleSubtask = asyncHandler(async (req, res) => {
  const sub = await taskService.toggleSubtask(req.user._id, req.params.id, req.params.subtaskId);
  res.json({ success: true, data: { subtask: sub } });
});

export const deleteSubtask = asyncHandler(async (req, res) => {
  await taskService.deleteSubtask(req.user._id, req.params.id, req.params.subtaskId);
  res.json({ success: true, message: 'Subtask deleted' });
});

export const softDelete = asyncHandler(async (req, res) => {
  await taskService.softDelete(req.user._id, req.params.id);
  res.json({ success: true, message: 'Task deleted (can be restored)' });
});

export const restore = asyncHandler(async (req, res) => {
  const task = await taskService.restore(req.user._id, req.params.id);
  res.json({ success: true, message: 'Task restored', data: { task } });
});

export const bulkDelete = asyncHandler(async (req, res) => {
  const result = await taskService.bulkDelete(req.user._id, req.body.ids);
  res.json({ success: true, message: `${result.deleted} tasks deleted`, data: result });
});

export const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const result = await taskService.bulkUpdateStatus(req.user._id, req.body.ids, req.body.status);
  res.json({ success: true, message: `${result.updated} tasks updated`, data: result });
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await taskService.getStats(req.user._id);
  res.json({ success: true, data: { stats } });
});

export const getCalendar = asyncHandler(async (req, res) => {
  const { start, end } = req.query;
  const tasks = await taskService.getCalendar(req.user._id, start, end);
  res.json({ success: true, data: { tasks } });
});
