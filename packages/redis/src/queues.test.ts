import { describe, it, expect } from 'vitest';

describe('QUEUE_NAMES', () => {
  it('defines all 6 required queue names', async () => {
    const { QUEUE_NAMES } = await import('./queues');
    expect(QUEUE_NAMES.COLLECT).toBe('news.collect');
    expect(QUEUE_NAMES.NORMALIZE).toBe('news.normalize');
    expect(QUEUE_NAMES.DEDUPLICATE).toBe('news.deduplicate');
    expect(QUEUE_NAMES.AI).toBe('news.ai');
    expect(QUEUE_NAMES.NOTIFY).toBe('news.notify');
    expect(QUEUE_NAMES.ARCHIVE).toBe('news.archive');
  });
});
