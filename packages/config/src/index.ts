import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  MONGODB_URI: z.string().min(1),
  REDIS_URL: z.string().min(1),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'])
    .default('info'),
});

export interface Config {
  mongodbUri: string;
  redisUrl: string;
  port: number;
  logLevel: string;
}

export function getConfig(): Config {
  const parsed = envSchema.parse(process.env);
  return {
    mongodbUri: parsed.MONGODB_URI,
    redisUrl: parsed.REDIS_URL,
    port: parsed.PORT,
    logLevel: parsed.LOG_LEVEL,
  };
}
