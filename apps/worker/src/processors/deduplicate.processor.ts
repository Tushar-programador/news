import type { Job } from 'bullmq';
import { createLogger } from '@tradepulse/logger';

const logger = createLogger('worker:deduplicate');

export async function deduplicateProcessor(job: Job): Promise<void> {
  logger.info({ jobId: job.id }, 'deduplicate stub — no-op');
}
