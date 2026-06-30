import type { FastifyInstance } from 'fastify';
import mongoose from 'mongoose';
import type Redis from 'ioredis';

export async function healthRoutes(
  app: FastifyInstance,
  options: { redis: Redis }
): Promise<void> {
  app.get('/health', async () => {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'up' : 'down';

    let redisStatus = 'down';
    try {
      await options.redis.ping();
      redisStatus = 'up';
    } catch {
      redisStatus = 'down';
    }

    return { status: 'ok', mongo: mongoStatus, redis: redisStatus };
  });
}
