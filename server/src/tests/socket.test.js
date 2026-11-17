/**
 * Socket.IO integration tests
 * Runs in its own DB (taskflow_socket_test_<random>) so it never clashes
 * with parallel test suites sharing the same connection.
 */
import { createServer } from 'http';
import { io as ioClient } from 'socket.io-client';
import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../../app.js';
import { initSocket } from '../../src/config/socket.js';

// Use a unique DB name per run to avoid collection conflicts
const DB_NAME = `taskflow_socket_${Date.now()}`;

let httpServer, app, port, accessToken;

const user = { name: 'Socket Tester', email: 'socket@taskflow.com', password: 'Test@1234' };

beforeAll(async () => {
  // Separate connection so socket tests don't share mongoose state
  await mongoose.connect(process.env.MONGO_URI, { dbName: DB_NAME });
  app = createApp();
  httpServer = createServer(app);
  initSocket(httpServer);
  await new Promise((res) => httpServer.listen(0, '127.0.0.1', res));
  port = httpServer.address().port;

  // Fresh user registration (DB is brand new)
  const reg = await request(app).post('/api/v1/auth/register').send(user);
  accessToken = reg.body.data?.accessToken;
  if (!accessToken) throw new Error(`Register failed: ${JSON.stringify(reg.body)}`);
}, 20000);

afterAll(async () => {
  try { await mongoose.connection.dropDatabase(); } catch (_) {}
  httpServer.close();
  await mongoose.disconnect();
}, 25000);

// ── Helper ────────────────────────────────────────────────────────────────────
const connectSocket = (token, preListen) =>
  new Promise((resolve, reject) => {
    const socket = ioClient(`http://127.0.0.1:${port}`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: false,
      timeout: 4000,
    });
    if (preListen) preListen(socket, () => resolve(socket));
    socket.on('connect', () => { if (!preListen) resolve(socket); });
    socket.on('connect_error', (err) => reject(new Error(err.message)));
  });

const disconnect = (socket) =>
  new Promise((res) => {
    if (!socket || !socket.connected) return res();
    socket.once('disconnect', res);
    socket.disconnect();
  });

// ─────────────────────────── TESTS ───────────────────────────────────────────
describe('Socket.IO Authentication', () => {
  it('should connect with a valid JWT', async () => {
    const socket = await connectSocket(accessToken);
    expect(socket.connected).toBe(true);
    await disconnect(socket);
  }, 8000);

  it('should reject connection without token', async () => {
    await expect(connectSocket('')).rejects.toThrow();
  }, 8000);

  it('should reject connection with invalid token', async () => {
    await expect(connectSocket('bad.token.here')).rejects.toThrow();
  }, 8000);
});

describe('Socket.IO Presence', () => {
  it('should receive presence:onlineUsers on connect', async () => {
    // Attach listener BEFORE the connect event resolves (preListen pattern)
    let receivedData;
    await new Promise((resolve, reject) => {
      connectSocket(accessToken, (socket, done) => {
        socket.once('presence:onlineUsers', (data) => {
          receivedData = data;
          done(); // triggers the outer resolve
        });
        socket.once('connect_error', reject);
        // Also disconnect after getting the event
        socket.once('presence:onlineUsers', async () => {
          await disconnect(socket);
          resolve();
        });
      });
    });
    expect(receivedData).toHaveProperty('onlineUsers');
    expect(Array.isArray(receivedData.onlineUsers)).toBe(true);
  }, 10000);
});

describe('Socket.IO Real-time Events', () => {
  it('should receive application:created after REST POST', async () => {
    const socket = await connectSocket(accessToken);
    const eventData = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout waiting for event')), 5000);
      socket.once('application:created', (data) => { clearTimeout(timer); resolve(data); });
      request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ company: 'SocketCorp', role: 'Engineer', status: 'Applied' })
        .catch(reject);
    });
    expect(eventData.application.company).toBe('SocketCorp');
    await disconnect(socket);
  }, 12000);

  it('should receive task:created after REST POST', async () => {
    const socket = await connectSocket(accessToken);
    const eventData = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), 5000);
      socket.once('task:created', (data) => { clearTimeout(timer); resolve(data); });
      request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Realtime Task', priority: 'high' })
        .catch(reject);
    });
    expect(eventData.task.title).toBe('Realtime Task');
    await disconnect(socket);
  }, 12000);

  it('should receive application:statusChanged after PATCH', async () => {
    const appRes = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ company: 'StatusCo', role: 'Dev', status: 'Wishlist' });
    const appId = appRes.body.data.application._id;

    const socket = await connectSocket(accessToken);
    const eventData = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), 5000);
      socket.once('application:statusChanged', (data) => { clearTimeout(timer); resolve(data); });
      request(app)
        .patch(`/api/v1/applications/${appId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'Applied' })
        .catch(reject);
    });
    expect(eventData.newStatus).toBe('Applied');
    await disconnect(socket);
  }, 12000);

  it('should receive application:deleted after DELETE', async () => {
    const appRes = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ company: 'DeleteCo', role: 'QA', status: 'Wishlist' });
    const appId = appRes.body.data.application._id;

    const socket = await connectSocket(accessToken);
    const eventData = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), 5000);
      socket.once('application:deleted', (data) => { clearTimeout(timer); resolve(data); });
      request(app)
        .delete(`/api/v1/applications/${appId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .catch(reject);
    });
    expect(eventData.applicationId).toBe(appId);
    await disconnect(socket);
  }, 12000);

  it('should receive task:statusChanged after PATCH', async () => {
    const taskRes = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'StatusTask', priority: 'low' });
    const taskId = taskRes.body.data.task._id;

    const socket = await connectSocket(accessToken);
    const eventData = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), 5000);
      socket.once('task:statusChanged', (data) => { clearTimeout(timer); resolve(data); });
      request(app)
        .patch(`/api/v1/tasks/${taskId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'done' })
        .catch(reject);
    });
    expect(eventData.status).toBe('done');
    await disconnect(socket);
  }, 12000);
});

describe('Socket.IO Ping', () => {
  it('should respond to ping with a timestamp', async () => {
    const socket = await connectSocket(accessToken);
    const pong = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('ping timeout')), 4000);
      socket.emit('ping', (data) => { clearTimeout(timer); resolve(data); });
    });
    expect(typeof pong.ts).toBe('number');
    await disconnect(socket);
  }, 8000);
});
