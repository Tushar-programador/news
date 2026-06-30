import { Queue, Worker, type Processor, type WorkerOptions } from 'bullmq';
import { Redis } from 'ioredis';

export const QUEUE_NAMES = {
  COLLECT: 'news.collect',
  NORMALIZE: 'news.normalize',
  DEDUPLICATE: 'news.deduplicate',
  AI: 'news.ai',
  NOTIFY: 'news.notify',
  ARCHIVE: 'news.archive',
} as const;

const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 1000 },
  removeOnFail: false,
};

export function createQueue(name: string, connection: Redis): Queue {
  return new Queue(name, { connection, defaultJobOptions: DEFAULT_JOB_OPTIONS });
}

export function createWorker(
  name: string,
  processor: Processor,
  connection: Redis,
  opts?: Partial<WorkerOptions>
): Worker {
  return new Worker(name, processor, { connection, concurrency: 5, ...opts });
}
