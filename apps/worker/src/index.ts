import { getConfig } from '@tradepulse/config';
import { createLogger } from '@tradepulse/logger';
import { connectDatabase } from '@tradepulse/database';
import { createRedisClient, QUEUE_NAMES, createWorker } from '@tradepulse/redis';
import { collectProcessor } from './processors/collect.processor';
import { normalizeProcessor } from './processors/normalize.processor';
import { deduplicateProcessor } from './processors/deduplicate.processor';
import { aiProcessor } from './processors/ai.processor';
import { notifyProcessor } from './processors/notify.processor';
import { archiveProcessor } from './processors/archive.processor';

async function main(): Promise<void> {
  const config = getConfig();
  const logger = createLogger('worker');

  await connectDatabase(config.mongodbUri);
  const redis = createRedisClient(config.redisUrl);

  const workers = [
    createWorker(QUEUE_NAMES.COLLECT, collectProcessor, redis),
    createWorker(QUEUE_NAMES.NORMALIZE, normalizeProcessor, redis),
    createWorker(QUEUE_NAMES.DEDUPLICATE, deduplicateProcessor, redis),
    createWorker(QUEUE_NAMES.AI, aiProcessor, redis),
    createWorker(QUEUE_NAMES.NOTIFY, notifyProcessor, redis),
    createWorker(QUEUE_NAMES.ARCHIVE, archiveProcessor, redis),
  ];

  logger.info(`Worker started — ${workers.length} queues registered`);

  const shutdown = async (): Promise<void> => {
    logger.info('Shutting down worker...');
    await Promise.all(workers.map((w) => w.close()));
    await redis.quit();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
