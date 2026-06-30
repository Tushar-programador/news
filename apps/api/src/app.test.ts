import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDatabase, disconnectDatabase } from '@tradepulse/database';

describe('API routes', () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.REDIS_URL = 'redis://localhost:6379';
    process.env.PORT = '3001';
    process.env.LOG_LEVEL = 'silent';
    await connectDatabase(mongod.getUri());
  });

  afterAll(async () => {
    await disconnectDatabase();
    await mongod.stop();
  });

  it('GET /health returns status, mongo, and redis fields', async () => {
    const { buildApp } = await import('./app');
    const app = buildApp();
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe('ok');
    expect(body).toHaveProperty('mongo');
    expect(body).toHaveProperty('redis');
    await app.close();
  });

  it('GET /api/news returns an empty array', async () => {
    const { buildApp } = await import('./app');
    const app = buildApp();
    const res = await app.inject({ method: 'GET', url: '/api/news' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual([]);
    await app.close();
  });

  it('POST /api/notify/test returns { queued: true }', async () => {
    const { buildApp } = await import('./app');
    const app = buildApp();
    const res = await app.inject({ method: 'POST', url: '/api/notify/test' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ queued: true });
    await app.close();
  });
});
