import type { Job } from 'bullmq';
import { createLogger } from '@tradepulse/logger';

const logger = createLogger('worker:collect');

export async function collectProcessor(job: Job): Promise<void> {
  logger.info({ jobId: job.id }, 'collect stub — no-op');
}
