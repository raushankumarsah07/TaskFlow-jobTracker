import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../../app.js';

let app;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName: `taskflow_auth_${Date.now()}` });
  app = createApp();
});

afterAll(async () => {
  try { await mongoose.connection.dropDatabase(); } catch (_) {}
  await mongoose.disconnect();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Auth API', () => {
  const validUser = { name: 'Test User', email: 'test@example.com', password: 'Test@1234' };

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/v1/auth/register').send(validUser);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      await request(app).post('/api/v1/auth/register').send(validUser);
      const res = await request(app).post('/api/v1/auth/register').send(validUser);
      expect(res.status).toBe(409);
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...validUser, email: 'notanemail' });
      expect(res.status).toBe(422);
    });

    it('should reject weak password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...validUser, password: 'weak' });
      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(validUser);
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: validUser.email, password: validUser.password });
      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: validUser.email, password: 'WrongPass1' });
      expect(res.status).toBe(401);
    });

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@example.com', password: 'Test@1234' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return user profile with valid token', async () => {
      const registerRes = await request(app).post('/api/v1/auth/register').send(validUser);
      const { accessToken } = registerRes.body.data;
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(validUser.email);
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      const loginRes = await request(app).post('/api/v1/auth/register').send(validUser);
      const { accessToken } = loginRes.body.data;
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should respond OK even for non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nobody@example.com' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Health check', () => {
    it('should return 200 on /health', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
