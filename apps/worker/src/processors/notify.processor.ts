import type { Job } from 'bullmq';
import { createLogger } from '@tradepulse/logger';

const logger = createLogger('worker:notify');

export async function notifyProcessor(job: Job): Promise<void> {
  logger.info({ jobId: job.id }, 'notify stub — no-op');
}
