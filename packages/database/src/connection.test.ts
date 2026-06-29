import { describe, it, expect, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('database connection', () => {
  let mongod: MongoMemoryServer;

  afterAll(async () => {
    if (mongod) await mongod.stop();
  });

  it('connects and disconnects without error', async () => {
    mongod = await MongoMemoryServer.create();
    const { connectDatabase, disconnectDatabase } = await import('./connection');
    await expect(connectDatabase(mongod.getUri())).resolves.toBeUndefined();
    await expect(disconnectDatabase()).resolves.toBeUndefined();
  });
});
