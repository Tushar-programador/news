import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDatabase, disconnectDatabase } from '../connection';

describe('NewsModel', () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await connectDatabase(mongod.getUri());
  });

  afterAll(async () => {
    await disconnectDatabase();
    await mongod.stop();
  });

  it('creates a news document with required fields', async () => {
    const { NewsModel } = await import('./news.model');
    const doc = await NewsModel.create({
      headline: 'Fed holds rates',
      content: 'The Federal Reserve held rates steady.',
      url: 'https://example.com/news/1',
      publishedAt: new Date('2026-06-29T10:00:00Z'),
      importance: 'HIGH',
      category: 'Central Bank',
    });
    expect(doc._id).toBeDefined();
    expect(doc.headline).toBe('Fed holds rates');
    expect(doc.importance).toBe('HIGH');
  });

  it('rejects an invalid importance value', async () => {
    const { NewsModel } = await import('./news.model');
    await expect(
      NewsModel.create({
        headline: 'Test',
        content: 'Body',
        url: 'https://example.com/2',
        publishedAt: new Date(),
        importance: 'EXTREME',
      })
    ).rejects.toThrow();
  });
});
