import { describe, it, expect } from 'vitest';
import type { Job } from 'bullmq';

describe('normalizeProcessor', () => {
  it('completes without throwing for a valid job', async () => {
    const { normalizeProcessor } = await import('./normalize.processor');

    const mockJob = {
      id: 'test-job-1',
      data: {
        news: {
          id: 'abc123',
          source: 'financialjuice',
          headline: 'Fed holds rates',
          body: 'The Federal Reserve held rates steady.',
          url: 'https://example.com/1',
          publishedAt: new Date(),
          metadata: {},
        },
      },
      log: async () => {},
    } as unknown as Job;

    await expect(normalizeProcessor(mockJob)).resolves.toBeUndefined();
  });
});
