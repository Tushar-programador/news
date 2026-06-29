import mongoose from 'mongoose';
import { createLogger } from '@tradepulse/logger';

const logger = createLogger('database');

export async function connectDatabase(uri: string): Promise<void> {
  await mongoose.connect(uri);
  logger.info('MongoDB connected');
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}
