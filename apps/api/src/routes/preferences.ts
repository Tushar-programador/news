import type { FastifyInstance } from 'fastify';

export async function preferencesRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/preferences', async () => ({}));
  app.put('/api/preferences', async () => ({}));
}
