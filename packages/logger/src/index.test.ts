import { describe, it, expect } from 'vitest';

describe('createLogger', () => {
  it('creates a logger with info and error methods', async () => {
    process.env.LOG_LEVEL = 'silent';
    const { createLogger } = await import('./index');
    const logger = createLogger('test-service');
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
  });
});
