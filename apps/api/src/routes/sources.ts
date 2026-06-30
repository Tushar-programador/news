import type { FastifyInstance } from 'fastify';

export async function sourcesRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/sources', async () => []);
  app.patch('/api/sources/:id', async () => ({}));
}
