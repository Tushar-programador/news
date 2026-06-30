import type { Job } from 'bullmq';
import { createLogger } from '@tradepulse/logger';

const logger = createLogger('worker:ai');

export async function aiProcessor(job: Job): Promise<void> {
  logger.info({ jobId: job.id }, 'ai stub — no-op');
}
