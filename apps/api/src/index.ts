import { getConfig } from '@tradepulse/config';
import { createLogger } from '@tradepulse/logger';
import { connectDatabase } from '@tradepulse/database';
import { buildApp } from './app';

async function main(): Promise<void> {
  const config = getConfig();
  const logger = createLogger('api');

  await connectDatabase(config.mongodbUri);

  const app = buildApp();
  await app.listen({ port: config.port, host: '0.0.0.0' });
  logger.info(`API listening on port ${config.port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
