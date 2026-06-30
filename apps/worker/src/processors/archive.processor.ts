import type { Job } from 'bullmq';
import { createLogger } from '@tradepulse/logger';

const logger = createLogger('worker:archive');

export async function archiveProcessor(job: Job): Promise<void> {
  logger.info({ jobId: job.id }, 'archive stub — no-op');
}
