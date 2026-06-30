import type { Job } from 'bullmq';
import { createLogger } from '@tradepulse/logger';

const logger = createLogger('worker:normalize');

export async function normalizeProcessor(job: Job): Promise<void> {
  logger.info({ jobId: job.id }, 'normalize stub — no-op');
}
