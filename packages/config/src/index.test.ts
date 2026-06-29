import { vi } from 'vitest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('getConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    // clear module cache so each test gets a fresh import
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns config when all required env vars are set', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    process.env.REDIS_URL = 'redis://localhost:6379';
    process.env.PORT = '3000';
    process.env.LOG_LEVEL = 'info';

    const { getConfig } = await import('./index');
    const config = getConfig();

    expect(config.mongodbUri).toBe('mongodb://localhost:27017/test');
    expect(config.redisUrl).toBe('redis://localhost:6379');
    expect(config.port).toBe(3000);
    expect(config.logLevel).toBe('info');
  });

  it('throws when MONGODB_URI is missing', async () => {
    delete process.env.MONGODB_URI;
    process.env.REDIS_URL = 'redis://localhost:6379';

    const { getConfig } = await import('./index');
    expect(() => getConfig()).toThrow();
  });
});
