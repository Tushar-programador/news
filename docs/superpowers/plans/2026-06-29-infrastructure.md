# TradePulse AI Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up the full TradePulse AI monorepo skeleton with MongoDB, Redis, BullMQ queues, Mongoose models, and a Fastify API with a live health endpoint — all containerized with Docker Compose.

**Architecture:** Turborepo monorepo with pnpm workspaces. Shared packages (`config`, `logger`, `shared`, `database`, `redis`) are consumed by two deployable apps (`api`, `worker`). All BullMQ queue processors are stubs in this milestone. The only non-stub route is `/health` which pings MongoDB and Redis live.

**Tech Stack:** Node.js 20, TypeScript 5 (strict), Turborepo 2, pnpm 9, Fastify 4, Mongoose 8, BullMQ 5, ioredis 5, Pino 8, Zod 3, Vitest 1, Docker Compose v2

## Global Constraints

- TypeScript `"strict": true` in every package and app
- All packages namespaced as `@tradepulse/<name>`
- Node.js >= 20, pnpm >= 9
- ESLint + Prettier enforced across the monorepo
- Every BullMQ queue: 3 retries with exponential backoff, `removeOnFail: false`
- MongoDB URI in Docker uses service name `mongo`; Redis URL uses service name `redis`

---

### Task 1: Root Monorepo Scaffolding

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `tsconfig.base.json`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `.eslintrc.js`
- Create: `.prettierrc`

**Interfaces:**
- Produces: workspace root that all packages extend; `tsconfig.base.json` inherited by every package

- [ ] **Step 1: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 2: Create root `package.json`**

```json
{
  "name": "tradepulse-ai",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\""
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0",
    "eslint": "^8.57.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "prettier": "^3.2.0",
    "vitest": "^1.6.0"
  },
  "engines": {
    "node": ">=20",
    "pnpm": ">=9"
  },
  "packageManager": "pnpm@9.0.0"
}
```

- [ ] **Step 3: Create `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {}
  }
}
```

- [ ] **Step 4: Create `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

- [ ] **Step 5: Create `.env.example`**

```
MONGODB_URI=mongodb://localhost:27017/tradepulse
REDIS_URL=redis://localhost:6379
PORT=3000
LOG_LEVEL=info
```

- [ ] **Step 6: Create `.gitignore`**

```
node_modules/
dist/
.env
*.local
.turbo/
```

- [ ] **Step 7: Create `.eslintrc.js`**

```js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
};
```

- [ ] **Step 8: Create `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

- [ ] **Step 9: Install root dependencies**

Run: `pnpm install`
Expected: `node_modules/` created at root, `pnpm-lock.yaml` generated

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "chore: initialize turborepo monorepo with pnpm workspaces"
```

---

### Task 2: packages/config — Environment Validation

**Files:**
- Create: `packages/config/package.json`
- Create: `packages/config/tsconfig.json`
- Create: `packages/config/src/index.ts`
- Create: `packages/config/src/index.test.ts`

**Interfaces:**
- Produces: `getConfig(): Config` — throws `ZodError` on startup if any required env var is missing

- [ ] **Step 1: Create `packages/config/package.json`**

```json
{
  "name": "@tradepulse/config",
  "version": "0.0.1",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "dotenv": "^16.4.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Create `packages/config/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src"]
}
```

- [ ] **Step 3: Write the failing test**

Create `packages/config/src/index.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('getConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    // clear module cache so each test gets a fresh import
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns config when all required env vars are set', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    process.env.REDIS_URL = 'redis://localhost:6379';
    process.env.PORT = '3000';
    process.env.LOG_LEVEL = 'info';

    const { getConfig } = await import('./index');
    const config = getConfig();

    expect(config.mongodbUri).toBe('mongodb://localhost:27017/test');
    expect(config.redisUrl).toBe('redis://localhost:6379');
    expect(config.port).toBe(3000);
    expect(config.logLevel).toBe('info');
  });

  it('throws when MONGODB_URI is missing', async () => {
    delete process.env.MONGODB_URI;
    process.env.REDIS_URL = 'redis://localhost:6379';

    const { getConfig } = await import('./index');
    expect(() => getConfig()).toThrow();
  });
});
```

Add `import { vi } from 'vitest';` at the top of the test file.

- [ ] **Step 4: Run test to verify it fails**

Run: `cd packages/config && pnpm test`
Expected: FAIL — "Cannot find module './index'"

- [ ] **Step 5: Implement `packages/config/src/index.ts`**

```typescript
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
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd packages/config && pnpm test`
Expected: PASS (2 tests)

- [ ] **Step 7: Build**

Run: `cd packages/config && pnpm build`
Expected: `dist/` created with `.js` and `.d.ts` files

- [ ] **Step 8: Commit**

```bash
git add packages/config/
git commit -m "feat: add packages/config with Zod env validation"
```

---

### Task 3: packages/logger and packages/shared

**Files:**
- Create: `packages/logger/package.json`
- Create: `packages/logger/tsconfig.json`
- Create: `packages/logger/src/index.ts`
- Create: `packages/logger/src/index.test.ts`
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`

**Interfaces:**
- Produces: `createLogger(name: string): pino.Logger` from `@tradepulse/logger`
- Produces: `RawNews`, `AIAnalysis`, `ImportanceLevel`, `QueueJobData` from `@tradepulse/shared`

- [ ] **Step 1: Create `packages/logger/package.json`**

```json
{
  "name": "@tradepulse/logger",
  "version": "0.0.1",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "pino": "^8.21.0",
    "pino-pretty": "^11.0.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^1.6.0",
    "@types/node": "^20.0.0"
  }
}
```

- [ ] **Step 2: Create `packages/logger/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src"]
}
```

- [ ] **Step 3: Write the failing test**

Create `packages/logger/src/index.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('createLogger', () => {
  it('creates a logger with info and error methods', async () => {
    process.env.LOG_LEVEL = 'silent';
    const { createLogger } = await import('./index');
    const logger = createLogger('test-service');
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `cd packages/logger && pnpm test`
Expected: FAIL — "Cannot find module './index'"

- [ ] **Step 5: Implement `packages/logger/src/index.ts`**

```typescript
import pino from 'pino';

export function createLogger(name: string): pino.Logger {
  return pino({
    name,
    level: process.env.LOG_LEVEL ?? 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
  });
}

export type Logger = pino.Logger;
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd packages/logger && pnpm test`
Expected: PASS (1 test)

- [ ] **Step 7: Create `packages/shared/package.json`**

```json
{
  "name": "@tradepulse/shared",
  "version": "0.0.1",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "lint": "eslint src --ext .ts"
  },
  "devDependencies": {
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 8: Create `packages/shared/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src"]
}
```

- [ ] **Step 9: Create `packages/shared/src/index.ts`**

```typescript
export type ImportanceLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RawNews {
  id: string;
  source: string;
  headline: string;
  body: string;
  url: string;
  publishedAt: Date;
  metadata: Record<string, unknown>;
}

export interface AIAnalysis {
  summary: string;
  importance: ImportanceLevel;
  category: string;
  bullish: string[];
  bearish: string[];
  confidence: number;
  reason: string;
}

export interface QueueJobData {
  news: RawNews;
}
```

- [ ] **Step 10: Build both packages**

Run: `pnpm --filter @tradepulse/logger build && pnpm --filter @tradepulse/shared build`
Expected: Both `dist/` directories created without errors

- [ ] **Step 11: Commit**

```bash
git add packages/logger/ packages/shared/
git commit -m "feat: add packages/logger (pino) and packages/shared (core types)"
```

---

### Task 4: packages/database — Mongoose Models and Connection

**Files:**
- Create: `packages/database/package.json`
- Create: `packages/database/tsconfig.json`
- Create: `packages/database/src/connection.ts`
- Create: `packages/database/src/connection.test.ts`
- Create: `packages/database/src/models/source.model.ts`
- Create: `packages/database/src/models/news.model.ts`
- Create: `packages/database/src/models/news.model.test.ts`
- Create: `packages/database/src/models/ai-analysis.model.ts`
- Create: `packages/database/src/models/notification.model.ts`
- Create: `packages/database/src/index.ts`

**Interfaces:**
- Produces: `connectDatabase(uri: string): Promise<void>`
- Produces: `disconnectDatabase(): Promise<void>`
- Produces: `SourceModel`, `NewsModel`, `AIAnalysisModel`, `NotificationModel` (Mongoose models)
- Produces: `ISource`, `INews`, `IAIAnalysis`, `INotification` (document interfaces)

- [ ] **Step 1: Create `packages/database/package.json`**

```json
{
  "name": "@tradepulse/database",
  "version": "0.0.1",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "mongoose": "^8.4.0",
    "@tradepulse/shared": "workspace:*",
    "@tradepulse/logger": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^1.6.0",
    "mongodb-memory-server": "^9.3.0",
    "@types/node": "^20.0.0"
  }
}
```

- [ ] **Step 2: Create `packages/database/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src"]
}
```

- [ ] **Step 3: Write failing test for connection**

Create `packages/database/src/connection.test.ts`:

```typescript
import { describe, it, expect, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('database connection', () => {
  let mongod: MongoMemoryServer;

  afterAll(async () => {
    if (mongod) await mongod.stop();
  });

  it('connects and disconnects without error', async () => {
    mongod = await MongoMemoryServer.create();
    const { connectDatabase, disconnectDatabase } = await import('./connection');
    await expect(connectDatabase(mongod.getUri())).resolves.toBeUndefined();
    await expect(disconnectDatabase()).resolves.toBeUndefined();
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `cd packages/database && pnpm test`
Expected: FAIL — "Cannot find module './connection'"

- [ ] **Step 5: Implement `packages/database/src/connection.ts`**

```typescript
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
```

- [ ] **Step 6: Write failing test for NewsModel**

Create `packages/database/src/models/news.model.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDatabase, disconnectDatabase } from '../connection';

describe('NewsModel', () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await connectDatabase(mongod.getUri());
  });

  afterAll(async () => {
    await disconnectDatabase();
    await mongod.stop();
  });

  it('creates a news document with required fields', async () => {
    const { NewsModel } = await import('./news.model');
    const doc = await NewsModel.create({
      headline: 'Fed holds rates',
      content: 'The Federal Reserve held rates steady.',
      url: 'https://example.com/news/1',
      publishedAt: new Date('2026-06-29T10:00:00Z'),
      importance: 'HIGH',
      category: 'Central Bank',
    });
    expect(doc._id).toBeDefined();
    expect(doc.headline).toBe('Fed holds rates');
    expect(doc.importance).toBe('HIGH');
  });

  it('rejects an invalid importance value', async () => {
    const { NewsModel } = await import('./news.model');
    await expect(
      NewsModel.create({
        headline: 'Test',
        content: 'Body',
        url: 'https://example.com/2',
        publishedAt: new Date(),
        importance: 'EXTREME',
      })
    ).rejects.toThrow();
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

Run: `cd packages/database && pnpm test`
Expected: FAIL — "Cannot find module './news.model'"

- [ ] **Step 8: Create `packages/database/src/models/source.model.ts`**

```typescript
import { Schema, model, Document } from 'mongoose';

export interface ISource extends Document {
  name: string;
  type: string;
  url: string;
  enabled: boolean;
  createdAt: Date;
}

const sourceSchema = new Schema<ISource>(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    url: { type: String, required: true },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SourceModel = model<ISource>('Source', sourceSchema);
```

- [ ] **Step 9: Create `packages/database/src/models/news.model.ts`**

```typescript
import { Schema, model, Document, Types } from 'mongoose';
import type { ImportanceLevel } from '@tradepulse/shared';

export interface INews extends Document {
  headline: string;
  content: string;
  url: string;
  publishedAt: Date;
  sourceId?: Types.ObjectId;
  importance: ImportanceLevel;
  category: string;
  createdAt: Date;
}

const newsSchema = new Schema<INews>(
  {
    headline: { type: String, required: true },
    content: { type: String, required: true },
    url: { type: String, required: true },
    publishedAt: { type: Date, required: true },
    sourceId: { type: Schema.Types.ObjectId, ref: 'Source' },
    importance: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
    },
    category: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const NewsModel = model<INews>('News', newsSchema);
```

- [ ] **Step 10: Create `packages/database/src/models/ai-analysis.model.ts`**

```typescript
import { Schema, model, Document, Types } from 'mongoose';
import type { ImportanceLevel } from '@tradepulse/shared';

export interface IAIAnalysis extends Document {
  newsId: Types.ObjectId;
  summary: string;
  importance: ImportanceLevel;
  category: string;
  bullish: string[];
  bearish: string[];
  confidence: number;
  reason: string;
  model: string;
  tokens: number;
}

const aiAnalysisSchema = new Schema<IAIAnalysis>({
  newsId: { type: Schema.Types.ObjectId, ref: 'News', required: true },
  summary: { type: String, required: true },
  importance: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
  category: { type: String, required: true },
  bullish: [{ type: String }],
  bearish: [{ type: String }],
  confidence: { type: Number, required: true, min: 0, max: 1 },
  reason: { type: String, required: true },
  model: { type: String, required: true },
  tokens: { type: Number, required: true },
});

export const AIAnalysisModel = model<IAIAnalysis>('AIAnalysis', aiAnalysisSchema);
```

- [ ] **Step 11: Create `packages/database/src/models/notification.model.ts`**

```typescript
import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  newsId: Types.ObjectId;
  channel: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  latencyMs?: number;
}

const notificationSchema = new Schema<INotification>(
  {
    newsId: { type: Schema.Types.ObjectId, ref: 'News', required: true },
    channel: { type: String, required: true },
    status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
    sentAt: { type: Date },
    latencyMs: { type: Number },
  },
  { timestamps: true }
);

export const NotificationModel = model<INotification>('Notification', notificationSchema);
```

- [ ] **Step 12: Create `packages/database/src/index.ts`**

```typescript
export { connectDatabase, disconnectDatabase } from './connection';
export { SourceModel } from './models/source.model';
export { NewsModel } from './models/news.model';
export { AIAnalysisModel } from './models/ai-analysis.model';
export { NotificationModel } from './models/notification.model';
export type { ISource } from './models/source.model';
export type { INews } from './models/news.model';
export type { IAIAnalysis } from './models/ai-analysis.model';
export type { INotification } from './models/notification.model';
```

- [ ] **Step 13: Run tests to verify they pass**

Run: `cd packages/database && pnpm test`
Expected: PASS (3 tests across 2 test files)

- [ ] **Step 14: Build**

Run: `cd packages/database && pnpm build`
Expected: `dist/` created without TypeScript errors

- [ ] **Step 15: Commit**

```bash
git add packages/database/
git commit -m "feat: add packages/database with Mongoose models and connection helper"
```

---

### Task 5: packages/redis — Redis Client and BullMQ Queue Definitions

**Files:**
- Create: `packages/redis/package.json`
- Create: `packages/redis/tsconfig.json`
- Create: `packages/redis/src/client.ts`
- Create: `packages/redis/src/queues.ts`
- Create: `packages/redis/src/queues.test.ts`
- Create: `packages/redis/src/index.ts`

**Interfaces:**
- Produces: `createRedisClient(url: string): Redis`
- Produces: `QUEUE_NAMES` — const record of all 6 queue name strings
- Produces: `createQueue(name: string, connection: Redis): Queue`
- Produces: `createWorker(name: string, processor: Processor, connection: Redis, opts?: Partial<WorkerOptions>): Worker`

- [ ] **Step 1: Create `packages/redis/package.json`**

```json
{
  "name": "@tradepulse/redis",
  "version": "0.0.1",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "bullmq": "^5.8.0",
    "ioredis": "^5.4.0",
    "@tradepulse/logger": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^1.6.0",
    "@types/node": "^20.0.0"
  }
}
```

- [ ] **Step 2: Create `packages/redis/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src"]
}
```

- [ ] **Step 3: Write the failing test**

Create `packages/redis/src/queues.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('QUEUE_NAMES', () => {
  it('defines all 6 required queue names', async () => {
    const { QUEUE_NAMES } = await import('./queues');
    expect(QUEUE_NAMES.COLLECT).toBe('news.collect');
    expect(QUEUE_NAMES.NORMALIZE).toBe('news.normalize');
    expect(QUEUE_NAMES.DEDUPLICATE).toBe('news.deduplicate');
    expect(QUEUE_NAMES.AI).toBe('news.ai');
    expect(QUEUE_NAMES.NOTIFY).toBe('news.notify');
    expect(QUEUE_NAMES.ARCHIVE).toBe('news.archive');
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `cd packages/redis && pnpm test`
Expected: FAIL — "Cannot find module './queues'"

- [ ] **Step 5: Create `packages/redis/src/client.ts`**

```typescript
import Redis from 'ioredis';

export function createRedisClient(url: string): Redis {
  return new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}
```

- [ ] **Step 6: Create `packages/redis/src/queues.ts`**

```typescript
import { Queue, Worker, type Processor, type WorkerOptions } from 'bullmq';
import type Redis from 'ioredis';

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
```

- [ ] **Step 7: Create `packages/redis/src/index.ts`**

```typescript
export { createRedisClient } from './client';
export { QUEUE_NAMES, createQueue, createWorker } from './queues';
```

- [ ] **Step 8: Run test to verify it passes**

Run: `cd packages/redis && pnpm test`
Expected: PASS (1 test)

- [ ] **Step 9: Build**

Run: `cd packages/redis && pnpm build`
Expected: `dist/` created without errors

- [ ] **Step 10: Commit**

```bash
git add packages/redis/
git commit -m "feat: add packages/redis with ioredis client and BullMQ queue definitions"
```

---

### Task 6: apps/api — Fastify Application with Health Route and Stub Routes

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/src/app.ts`
- Create: `apps/api/src/index.ts`
- Create: `apps/api/src/routes/health.ts`
- Create: `apps/api/src/routes/news.ts`
- Create: `apps/api/src/routes/sources.ts`
- Create: `apps/api/src/routes/notifications.ts`
- Create: `apps/api/src/routes/preferences.ts`
- Create: `apps/api/src/app.test.ts`

**Interfaces:**
- Consumes: `getConfig(): Config` from `@tradepulse/config`
- Consumes: `createLogger(name): Logger` from `@tradepulse/logger`
- Consumes: `connectDatabase(uri): Promise<void>` from `@tradepulse/database`
- Consumes: `createRedisClient(url): Redis` from `@tradepulse/redis`
- Produces: `buildApp(): FastifyInstance`

- [ ] **Step 1: Create `apps/api/package.json`**

```json
{
  "name": "@tradepulse/api",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "build": "tsc",
    "dev": "ts-node-dev --respawn src/index.ts",
    "start": "node dist/index.js",
    "test": "vitest run",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "fastify": "^4.27.0",
    "@fastify/sensible": "^5.6.0",
    "mongoose": "^8.4.0",
    "ioredis": "^5.4.0",
    "@tradepulse/config": "workspace:*",
    "@tradepulse/logger": "workspace:*",
    "@tradepulse/database": "workspace:*",
    "@tradepulse/redis": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "ts-node-dev": "^2.0.0",
    "vitest": "^1.6.0",
    "mongodb-memory-server": "^9.3.0",
    "@types/node": "^20.0.0"
  }
}
```

- [ ] **Step 2: Create `apps/api/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src"]
}
```

- [ ] **Step 3: Write the failing test**

Create `apps/api/src/app.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDatabase, disconnectDatabase } from '@tradepulse/database';

describe('API routes', () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    process.env.REDIS_URL = 'redis://localhost:6379';
    process.env.PORT = '3001';
    process.env.LOG_LEVEL = 'silent';
    await connectDatabase(mongod.getUri());
  });

  afterAll(async () => {
    await disconnectDatabase();
    await mongod.stop();
  });

  it('GET /health returns status, mongo, and redis fields', async () => {
    const { buildApp } = await import('./app');
    const app = buildApp();
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe('ok');
    expect(body).toHaveProperty('mongo');
    expect(body).toHaveProperty('redis');
    await app.close();
  });

  it('GET /api/news returns an empty array', async () => {
    const { buildApp } = await import('./app');
    const app = buildApp();
    const res = await app.inject({ method: 'GET', url: '/api/news' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual([]);
    await app.close();
  });

  it('POST /api/notify/test returns { queued: true }', async () => {
    const { buildApp } = await import('./app');
    const app = buildApp();
    const res = await app.inject({ method: 'POST', url: '/api/notify/test' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ queued: true });
    await app.close();
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `cd apps/api && pnpm test`
Expected: FAIL — "Cannot find module './app'"

- [ ] **Step 5: Create `apps/api/src/routes/health.ts`**

```typescript
import type { FastifyInstance } from 'fastify';
import mongoose from 'mongoose';
import type Redis from 'ioredis';

export async function healthRoutes(
  app: FastifyInstance,
  options: { redis: Redis }
): Promise<void> {
  app.get('/health', async () => {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'up' : 'down';

    let redisStatus = 'down';
    try {
      await options.redis.ping();
      redisStatus = 'up';
    } catch {
      redisStatus = 'down';
    }

    return { status: 'ok', mongo: mongoStatus, redis: redisStatus };
  });
}
```

- [ ] **Step 6: Create `apps/api/src/routes/news.ts`**

```typescript
import type { FastifyInstance } from 'fastify';

export async function newsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/news', async () => []);
  app.get('/api/news/search', async () => []);
  app.get('/api/news/:id', async () => ({}));
}
```

- [ ] **Step 7: Create `apps/api/src/routes/sources.ts`**

```typescript
import type { FastifyInstance } from 'fastify';

export async function sourcesRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/sources', async () => []);
  app.patch('/api/sources/:id', async () => ({}));
}
```

- [ ] **Step 8: Create `apps/api/src/routes/notifications.ts`**

```typescript
import type { FastifyInstance } from 'fastify';

export async function notificationsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/notifications', async () => []);
  app.post('/api/notify/test', async () => ({ queued: true }));
}
```

- [ ] **Step 9: Create `apps/api/src/routes/preferences.ts`**

```typescript
import type { FastifyInstance } from 'fastify';

export async function preferencesRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/preferences', async () => ({}));
  app.put('/api/preferences', async () => ({}));
}
```

- [ ] **Step 10: Create `apps/api/src/app.ts`**

```typescript
import Fastify, { type FastifyInstance } from 'fastify';
import sensible from '@fastify/sensible';
import { createRedisClient } from '@tradepulse/redis';
import { healthRoutes } from './routes/health';
import { newsRoutes } from './routes/news';
import { sourcesRoutes } from './routes/sources';
import { notificationsRoutes } from './routes/notifications';
import { preferencesRoutes } from './routes/preferences';

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: false });

  app.register(sensible);

  const redis = createRedisClient(process.env.REDIS_URL ?? 'redis://localhost:6379');

  app.register(healthRoutes, { redis });
  app.register(newsRoutes);
  app.register(sourcesRoutes);
  app.register(notificationsRoutes);
  app.register(preferencesRoutes);

  app.addHook('onClose', async () => {
    await redis.quit();
  });

  return app;
}
```

- [ ] **Step 11: Create `apps/api/src/index.ts`**

```typescript
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
```

- [ ] **Step 12: Run tests to verify they pass**

Run: `cd apps/api && pnpm test`
Expected: PASS (3 tests). Note: `redis` field in `/health` will be `'down'` since no Redis is running in tests — the test only checks the field exists, not its value.

- [ ] **Step 13: Build**

Run: `cd apps/api && pnpm build`
Expected: `dist/` created without TypeScript errors

- [ ] **Step 14: Commit**

```bash
git add apps/api/
git commit -m "feat: add apps/api with Fastify health route and stub API routes"
```

---

### Task 7: apps/worker — BullMQ Worker with Stub Processors

**Files:**
- Create: `apps/worker/package.json`
- Create: `apps/worker/tsconfig.json`
- Create: `apps/worker/src/processors/collect.processor.ts`
- Create: `apps/worker/src/processors/normalize.processor.ts`
- Create: `apps/worker/src/processors/normalize.processor.test.ts`
- Create: `apps/worker/src/processors/deduplicate.processor.ts`
- Create: `apps/worker/src/processors/ai.processor.ts`
- Create: `apps/worker/src/processors/notify.processor.ts`
- Create: `apps/worker/src/processors/archive.processor.ts`
- Create: `apps/worker/src/index.ts`

**Interfaces:**
- Consumes: `QUEUE_NAMES`, `createWorker`, `createRedisClient` from `@tradepulse/redis` — signatures as defined in Task 5
- Consumes: `getConfig(): Config` from `@tradepulse/config`
- Consumes: `connectDatabase(uri): Promise<void>` from `@tradepulse/database`
- Each processor signature: `(job: Job) => Promise<void>`

- [ ] **Step 1: Create `apps/worker/package.json`**

```json
{
  "name": "@tradepulse/worker",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "build": "tsc",
    "dev": "ts-node-dev --respawn src/index.ts",
    "start": "node dist/index.js",
    "test": "vitest run",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "bullmq": "^5.8.0",
    "@tradepulse/config": "workspace:*",
    "@tradepulse/logger": "workspace:*",
    "@tradepulse/database": "workspace:*",
    "@tradepulse/redis": "workspace:*",
    "@tradepulse/shared": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "ts-node-dev": "^2.0.0",
    "vitest": "^1.6.0",
    "@types/node": "^20.0.0"
  }
}
```

- [ ] **Step 2: Create `apps/worker/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src"]
}
```

- [ ] **Step 3: Write the failing test**

Create `apps/worker/src/processors/normalize.processor.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import type { Job } from 'bullmq';

describe('normalizeProcessor', () => {
  it('completes without throwing for a valid job', async () => {
    const { normalizeProcessor } = await import('./normalize.processor');

    const mockJob = {
      id: 'test-job-1',
      data: {
        news: {
          id: 'abc123',
          source: 'financialjuice',
          headline: 'Fed holds rates',
          body: 'The Federal Reserve held rates steady.',
          url: 'https://example.com/1',
          publishedAt: new Date(),
          metadata: {},
        },
      },
      log: async () => {},
    } as unknown as Job;

    await expect(normalizeProcessor(mockJob)).resolves.toBeUndefined();
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `cd apps/worker && pnpm test`
Expected: FAIL — "Cannot find module './normalize.processor'"

- [ ] **Step 5: Create all six stub processors**

Create `apps/worker/src/processors/collect.processor.ts`:

```typescript
import type { Job } from 'bullmq';
import { createLogger } from '@tradepulse/logger';

const logger = createLogger('worker:collect');

export async function collectProcessor(job: Job): Promise<void> {
  logger.info({ jobId: job.id }, 'collect stub — no-op');
}
```

Create `apps/worker/src/processors/normalize.processor.ts`:

```typescript
import type { Job } from 'bullmq';
import { createLogger } from '@tradepulse/logger';

const logger = createLogger('worker:normalize');

export async function normalizeProcessor(job: Job): Promise<void> {
  logger.info({ jobId: job.id }, 'normalize stub — no-op');
}
```

Create `apps/worker/src/processors/deduplicate.processor.ts`:

```typescript
import type { Job } from 'bullmq';
import { createLogger } from '@tradepulse/logger';

const logger = createLogger('worker:deduplicate');

export async function deduplicateProcessor(job: Job): Promise<void> {
  logger.info({ jobId: job.id }, 'deduplicate stub — no-op');
}
```

Create `apps/worker/src/processors/ai.processor.ts`:

```typescript
import type { Job } from 'bullmq';
import { createLogger } from '@tradepulse/logger';

const logger = createLogger('worker:ai');

export async function aiProcessor(job: Job): Promise<void> {
  logger.info({ jobId: job.id }, 'ai stub — no-op');
}
```

Create `apps/worker/src/processors/notify.processor.ts`:

```typescript
import type { Job } from 'bullmq';
import { createLogger } from '@tradepulse/logger';

const logger = createLogger('worker:notify');

export async function notifyProcessor(job: Job): Promise<void> {
  logger.info({ jobId: job.id }, 'notify stub — no-op');
}
```

Create `apps/worker/src/processors/archive.processor.ts`:

```typescript
import type { Job } from 'bullmq';
import { createLogger } from '@tradepulse/logger';

const logger = createLogger('worker:archive');

export async function archiveProcessor(job: Job): Promise<void> {
  logger.info({ jobId: job.id }, 'archive stub — no-op');
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd apps/worker && pnpm test`
Expected: PASS (1 test)

- [ ] **Step 7: Create `apps/worker/src/index.ts`**

```typescript
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
```

- [ ] **Step 8: Build**

Run: `cd apps/worker && pnpm build`
Expected: `dist/` created without TypeScript errors

- [ ] **Step 9: Commit**

```bash
git add apps/worker/
git commit -m "feat: add apps/worker with BullMQ worker and stub processors for all 6 queues"
```

---

### Task 8: Docker Compose and Dockerfiles

**Files:**
- Create: `docker/docker-compose.yml`
- Create: `docker/api.Dockerfile`
- Create: `docker/worker.Dockerfile`

**Interfaces:**
- Produces: `docker compose up --build` starts mongo, redis, api, worker
- Produces: `GET http://localhost:3000/health` → `{ "status": "ok", "mongo": "up", "redis": "up" }`

- [ ] **Step 1: Create `docker/api.Dockerfile`**

```dockerfile
FROM node:20-alpine AS base
RUN npm install -g pnpm@9

WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY turbo.json tsconfig.base.json ./

COPY packages/config/package.json packages/config/
COPY packages/logger/package.json packages/logger/
COPY packages/shared/package.json packages/shared/
COPY packages/database/package.json packages/database/
COPY packages/redis/package.json packages/redis/
COPY apps/api/package.json apps/api/

RUN pnpm install --frozen-lockfile

COPY packages/ packages/
COPY apps/api/ apps/api/

RUN pnpm --filter @tradepulse/config build \
 && pnpm --filter @tradepulse/logger build \
 && pnpm --filter @tradepulse/shared build \
 && pnpm --filter @tradepulse/database build \
 && pnpm --filter @tradepulse/redis build \
 && pnpm --filter @tradepulse/api build

EXPOSE 3000
CMD ["node", "apps/api/dist/index.js"]
```

- [ ] **Step 2: Create `docker/worker.Dockerfile`**

```dockerfile
FROM node:20-alpine AS base
RUN npm install -g pnpm@9

WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY turbo.json tsconfig.base.json ./

COPY packages/config/package.json packages/config/
COPY packages/logger/package.json packages/logger/
COPY packages/shared/package.json packages/shared/
COPY packages/database/package.json packages/database/
COPY packages/redis/package.json packages/redis/
COPY apps/worker/package.json apps/worker/

RUN pnpm install --frozen-lockfile

COPY packages/ packages/
COPY apps/worker/ apps/worker/

RUN pnpm --filter @tradepulse/config build \
 && pnpm --filter @tradepulse/logger build \
 && pnpm --filter @tradepulse/shared build \
 && pnpm --filter @tradepulse/database build \
 && pnpm --filter @tradepulse/redis build \
 && pnpm --filter @tradepulse/worker build

CMD ["node", "apps/worker/dist/index.js"]
```

- [ ] **Step 3: Create `docker/docker-compose.yml`**

```yaml
version: "3.9"

services:
  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: ..
      dockerfile: docker/api.Dockerfile
    ports:
      - "3000:3000"
    env_file:
      - ../.env
    environment:
      MONGODB_URI: mongodb://mongo:27017/tradepulse
      REDIS_URL: redis://redis:6379
    depends_on:
      mongo:
        condition: service_healthy
      redis:
        condition: service_healthy

  worker:
    build:
      context: ..
      dockerfile: docker/worker.Dockerfile
    env_file:
      - ../.env
    environment:
      MONGODB_URI: mongodb://mongo:27017/tradepulse
      REDIS_URL: redis://redis:6379
    depends_on:
      mongo:
        condition: service_healthy
      redis:
        condition: service_healthy

volumes:
  mongo_data:
```

- [ ] **Step 4: Create `.env` from example**

```bash
cp .env.example .env
```

The `MONGODB_URI` and `REDIS_URL` in `.env` are overridden by the `environment:` block in Docker Compose for container runs. The `.env` values are used for local development only.

- [ ] **Step 5: Start all services**

Run from the `docker/` directory:

```bash
cd docker && docker compose up --build -d
```

Expected: All 4 containers start. Check with:

```bash
docker compose ps
```

All services should show `healthy` or `running`.

- [ ] **Step 6: Verify the health endpoint**

```bash
curl http://localhost:3000/health
```

Expected output:

```json
{"status":"ok","mongo":"up","redis":"up"}
```

- [ ] **Step 7: Verify worker registered all 6 queues**

```bash
docker compose logs worker
```

Expected: A log line containing `"Worker started — 6 queues registered"`

- [ ] **Step 8: Commit**

```bash
cd ..
git add docker/
git commit -m "feat: add Docker Compose with mongo, redis, api, and worker services"
```

---

## Full Monorepo Verification

After all tasks are complete, run this from the repo root:

- [ ] `pnpm install` — resolves all workspace dependencies
- [ ] `turbo run build` — all packages and apps compile without TypeScript errors
- [ ] `turbo run test` — all tests pass
- [ ] `turbo run lint` — no ESLint errors
- [ ] `cd docker && docker compose up --build -d` — all 4 services start cleanly
- [ ] `curl http://localhost:3000/health` returns `{"status":"ok","mongo":"up","redis":"up"}`
