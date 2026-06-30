import type { FastifyInstance } from 'fastify';

export async function newsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/news', async () => []);
  app.get('/api/news/search', async () => []);
  app.get('/api/news/:id', async () => ({}));
}
