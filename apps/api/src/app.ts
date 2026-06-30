import Fastify, { type FastifyInstance } from 'fastify';
import sensible from '@fastify/sensible';
import { createRedisClient } from '@tradepulse/redis';
import { healthRoutes } from './routes/health';
import { newsRoutes } from './routes/news';
import { sourcesRoutes } from './routes/sources';
import { notificationsRoutes } from './routes/notifications';
import { preferencesRoutes } from './routes/preferences';

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: false });

  app.register(sensible);

  const redis = createRedisClient(process.env.REDIS_URL ?? 'redis://localhost:6379');

  app.register(healthRoutes, { redis });
  app.register(newsRoutes);
  app.register(sourcesRoutes);
  app.register(notificationsRoutes);
  app.register(preferencesRoutes);

  app.addHook('onClose', async () => {
    await redis.quit();
  });

  return app;
}
