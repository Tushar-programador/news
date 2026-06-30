import type { FastifyInstance } from 'fastify';

export async function notificationsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/notifications', async () => []);
  app.post('/api/notify/test', async () => ({ queued: true }));
}
