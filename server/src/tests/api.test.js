/**
 * Integration tests — Application & Task APIs
 * Uses real MongoDB (must be running on 27017)
 */
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../../app.js';

let app;
let accessToken;

const validUser = { name: 'API Tester', email: 'apitest@example.com', password: 'Test@1234' };

const validApp = {
  company: 'Acme Corp',
  role: 'Software Engineer',
  status: 'Applied',
  priority: 'high',
  jobType: 'remote',
  location: 'Remote',
  salaryMin: 100000,
  salaryMax: 150000,
  notes: 'Great opportunity',
  tags: ['react', 'node'],
};

const validTask = {
  title: 'Complete coding challenge',
  description: 'Finish the take-home project',
  status: 'todo',
  priority: 'high',
  labels: ['coding'],
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'taskflow_test' });
  app = createApp();

  // Register + login to get access token
  const res = await request(app).post('/api/v1/auth/register').send(validUser);
  accessToken = res.body.data?.accessToken;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

afterEach(async () => {
  // Only clean applications and tasks between tests
  const { JobApplication } = await import('../models/JobApplication.js');
  const { Task } = await import('../models/Task.js');
  await JobApplication.deleteMany({});
  await Task.deleteMany({});
});

const auth = () => ({ Authorization: `Bearer ${accessToken}` });

// ─────────────────────────── APPLICATIONS ───────────────────────────────────
describe('Applications API', () => {
  describe('POST /api/v1/applications', () => {
    it('should create an application', async () => {
      const res = await request(app).post('/api/v1/applications').set(auth()).send(validApp);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.application.company).toBe('Acme Corp');
      expect(res.body.data.application.statusHistory).toHaveLength(1);
    });

    it('should require company and role', async () => {
      const res = await request(app).post('/api/v1/applications').set(auth()).send({ status: 'Applied' });
      expect(res.status).toBe(422);
    });

    it('should reject invalid status', async () => {
      const res = await request(app).post('/api/v1/applications').set(auth()).send({ ...validApp, status: 'Ghosted' });
      expect(res.status).toBe(422);
    });

    it('should reject unauthenticated requests', async () => {
      const res = await request(app).post('/api/v1/applications').send(validApp);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/applications', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/applications').set(auth()).send(validApp);
      await request(app).post('/api/v1/applications').set(auth()).send({ ...validApp, company: 'Beta Inc', status: 'Wishlist' });
    });

    it('should return paginated applications', async () => {
      const res = await request(app).get('/api/v1/applications').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta.total).toBe(2);
    });

    it('should filter by status', async () => {
      const res = await request(app).get('/api/v1/applications?status=Applied').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.data.every((a) => a.status === 'Applied')).toBe(true);
    });

    it('should respect pagination', async () => {
      const res = await request(app).get('/api/v1/applications?limit=1&page=1').set(auth());
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.totalPages).toBe(2);
    });
  });

  describe('GET /api/v1/applications/kanban', () => {
    it('should return board grouped by status', async () => {
      await request(app).post('/api/v1/applications').set(auth()).send(validApp);
      const res = await request(app).get('/api/v1/applications/kanban').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('Applied');
      expect(res.body.data).toHaveProperty('Wishlist');
      expect(res.body.data.Applied).toHaveLength(1);
    });
  });

  describe('PATCH /api/v1/applications/:id/status', () => {
    it('should update status and add to history', async () => {
      const create = await request(app).post('/api/v1/applications').set(auth()).send(validApp);
      const id = create.body.data.application._id;
      const res = await request(app)
        .patch(`/api/v1/applications/${id}/status`)
        .set(auth())
        .send({ status: 'Interview', note: 'Phone screen scheduled' });
      expect(res.status).toBe(200);
      expect(res.body.data.application.status).toBe('Interview');
      expect(res.body.data.application.statusHistory.length).toBeGreaterThan(1);
    });
  });

  describe('DELETE + RESTORE /api/v1/applications/:id', () => {
    it('should soft delete and restore', async () => {
      const create = await request(app).post('/api/v1/applications').set(auth()).send(validApp);
      const id = create.body.data.application._id;

      const del = await request(app).delete(`/api/v1/applications/${id}`).set(auth());
      expect(del.status).toBe(200);

      // Should not appear in list
      const list = await request(app).get('/api/v1/applications').set(auth());
      expect(list.body.data).toHaveLength(0);

      // Restore
      const restore = await request(app).patch(`/api/v1/applications/${id}/restore`).set(auth());
      expect(restore.status).toBe(200);
      expect(restore.body.data.application.isDeleted).toBe(false);
    });
  });

  describe('GET /api/v1/applications/stats', () => {
    it('should return aggregated stats', async () => {
      await request(app).post('/api/v1/applications').set(auth()).send(validApp);
      const res = await request(app).get('/api/v1/applications/stats').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.data.stats).toHaveProperty('total');
      expect(res.body.data.stats.total).toBe(1);
    });
  });

  describe('GET /api/v1/applications/export', () => {
    it('should return CSV content', async () => {
      await request(app).post('/api/v1/applications').set(auth()).send(validApp);
      const res = await request(app).get('/api/v1/applications/export').set(auth());
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/csv/);
      expect(res.text).toContain('Acme Corp');
    });
  });
});

// ─────────────────────────── TASKS ──────────────────────────────────────────
describe('Tasks API', () => {
  describe('POST /api/v1/tasks', () => {
    it('should create a task', async () => {
      const res = await request(app).post('/api/v1/tasks').set(auth()).send(validTask);
      expect(res.status).toBe(201);
      expect(res.body.data.task.title).toBe('Complete coding challenge');
      expect(res.body.data.task.status).toBe('todo');
    });

    it('should require title', async () => {
      const res = await request(app).post('/api/v1/tasks').set(auth()).send({ priority: 'high' });
      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/v1/tasks', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/tasks').set(auth()).send(validTask);
      await request(app).post('/api/v1/tasks').set(auth()).send({ ...validTask, title: 'Review offer', status: 'in-progress' });
    });

    it('should list tasks', async () => {
      const res = await request(app).get('/api/v1/tasks').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('should filter by status', async () => {
      const res = await request(app).get('/api/v1/tasks?status=todo').set(auth());
      expect(res.body.data.every((t) => t.status === 'todo')).toBe(true);
    });
  });

  describe('Task subtasks', () => {
    it('should add, toggle, and delete subtasks', async () => {
      const create = await request(app).post('/api/v1/tasks').set(auth()).send(validTask);
      const id = create.body.data.task._id;

      // Add subtask
      const add = await request(app).post(`/api/v1/tasks/${id}/subtasks`).set(auth()).send({ title: 'Read docs' });
      expect(add.status).toBe(201);
      const subId = add.body.data.subtask._id;

      // Toggle
      const toggle = await request(app).patch(`/api/v1/tasks/${id}/subtasks/${subId}/toggle`).set(auth());
      expect(toggle.status).toBe(200);
      expect(toggle.body.data.subtask.completed).toBe(true);

      // Delete
      const del = await request(app).delete(`/api/v1/tasks/${id}/subtasks/${subId}`).set(auth());
      expect(del.status).toBe(200);
    });
  });

  describe('Task board view', () => {
    it('should return board grouped by status', async () => {
      await request(app).post('/api/v1/tasks').set(auth()).send(validTask);
      const res = await request(app).get('/api/v1/tasks/board').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('todo');
      expect(res.body.data).toHaveProperty('in-progress');
      expect(res.body.data).toHaveProperty('done');
      expect(res.body.data.todo).toHaveLength(1);
    });
  });

  describe('Task status update', () => {
    it('should mark task as done and set completedAt', async () => {
      const create = await request(app).post('/api/v1/tasks').set(auth()).send(validTask);
      const id = create.body.data.task._id;
      const res = await request(app).patch(`/api/v1/tasks/${id}/status`).set(auth()).send({ status: 'done' });
      expect(res.status).toBe(200);
      expect(res.body.data.task.status).toBe('done');
      expect(res.body.data.task.completedAt).toBeTruthy();
    });
  });

  describe('Task stats', () => {
    it('should return task statistics', async () => {
      await request(app).post('/api/v1/tasks').set(auth()).send(validTask);
      const res = await request(app).get('/api/v1/tasks/stats').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.data.stats.total).toBe(1);
      expect(res.body.data.stats.todo).toBe(1);
    });
  });
});

// ─────────────────────────── DASHBOARD ──────────────────────────────────────
describe('Dashboard API', () => {
  it('should return summary', async () => {
    const res = await request(app).get('/api/v1/dashboard/summary').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('apps');
    expect(res.body.data).toHaveProperty('tasks');
  });
});
