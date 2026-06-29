# TradePulse AI — Infrastructure Design

**Date:** 2026-06-29
**Milestone:** 1 — Infrastructure Foundation
**Status:** Approved

---

## Overview

Set up the full monorepo skeleton, Docker Compose environment, BullMQ queue topology, Mongoose models, and a Fastify API skeleton with a live `/health` endpoint. All queue processors and API route handlers are stubs in this milestone — real logic lands in subsequent milestones.

---

## Decisions

| Concern | Choice | Reason |
|---|---|---|
| Monorepo | Turborepo + pnpm workspaces | Industry standard, excellent build caching |
| Database | MongoDB 7 + Mongoose | Flexible schema, mature ODM |
| Queue | BullMQ on Redis 7 | Reliable job queue with retries + DLQ |
| API | Fastify + TypeScript strict | Fast, schema-friendly, low overhead |
| Worker | Single process, all queues | Simpler for MVP; split later if needed |
| Auth | Not in this milestone | Added in a later milestone |

---

## Monorepo Structure

```
tradepulse-ai/
  apps/
    api/          # Fastify API server
    dashboard/    # Next.js (scaffolded only, not implemented)
    worker/       # BullMQ worker — all queues in one process
  packages/
    database/     # Mongoose models + connection helper
    redis/        # BullMQ queue definitions + Redis client
    shared/       # Shared TypeScript types (RawNews, AIAnalysis, etc.)
    logger/       # Pino logger config
    config/       # dotenv + Zod env validation
  docker/
    docker-compose.yml
    .env.example
  turbo.json
  pnpm-workspace.yaml
```

`packages/` are internal — never deployed standalone. `apps/` are the deployable processes.

---

## Docker Compose

Services:

| Service | Image | Port | Notes |
|---|---|---|---|
| mongo | mongo:7 | 27017 | volume-mounted data |
| redis | redis:7-alpine | 6379 | |
| api | apps/api build | 3000 | depends on mongo + redis |
| worker | apps/worker build | — | depends on mongo + redis |

`dashboard` runs locally via `pnpm dev` — excluded from Docker in this milestone.

A single `.env` file at the root is shared across all services via `env_file`. `packages/config` validates it with Zod on startup — missing vars cause an immediate crash with a clear error message.

### Required Environment Variables

```
MONGODB_URI=mongodb://mongo:27017/tradepulse
REDIS_URL=redis://redis:6379
PORT=3000
LOG_LEVEL=info
```

---

## BullMQ Queue Topology

Defined in `packages/redis`. All queues consumed by the single `apps/worker` process.

```
news.collect → news.normalize → news.deduplicate → news.ai → news.notify → news.archive
```

Each queue:
- **Retries:** 3, exponential backoff
- **Dead letter queue:** `<name>.failed`
- **Concurrency:** 5 (per queue, adjustable)

Processors in this milestone are stubs: receive job → log → pass to next queue.

---

## MongoDB Models (Mongoose)

All defined in `packages/database`.

### Source
```ts
{
  name: string;
  type: string;       // "rss" | "twitter" | "scraper"
  url: string;
  enabled: boolean;
  createdAt: Date;
}
```

### News
```ts
{
  headline: string;
  content: string;
  url: string;
  publishedAt: Date;
  sourceId: ObjectId;
  importance: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category: string;
  createdAt: Date;
}
```

### AIAnalysis
```ts
{
  newsId: ObjectId;
  summary: string;
  importance: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category: string;
  bullish: string[];
  bearish: string[];
  confidence: number;
  reason: string;
  model: string;
  tokens: number;
}
```

### Notification
```ts
{
  newsId: ObjectId;
  channel: string;    // "whatsapp" | "telegram" | "discord"
  status: string;     // "pending" | "sent" | "failed"
  sentAt: Date;
  latencyMs: number;
}
```

---

## Fastify API Skeleton

All routes defined in `apps/api`. Route handlers return stubs except `/health`.

```
GET  /health              → { status: "ok", mongo: "up", redis: "up" }

GET  /api/news            → []
GET  /api/news/:id        → {}
GET  /api/news/search     → []

GET  /api/sources         → []
PATCH /api/sources/:id    → {}

GET  /api/notifications   → []
POST /api/notify/test     → { queued: true }

GET  /api/preferences     → {}
PUT  /api/preferences     → {}
```

`/health` performs live pings to MongoDB and Redis and reflects their actual status. All routes are typed with shared types from `packages/shared`.

---

## Shared Types (packages/shared)

```ts
interface RawNews {
  id: string;
  source: string;
  headline: string;
  body: string;
  url: string;
  publishedAt: Date;
  metadata: Record<string, unknown>;
}

interface AIAnalysis {
  summary: string;
  importance: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category: string;
  bullish: string[];
  bearish: string[];
  confidence: number;
  reason: string;
}
```

---

## Definition of Done for This Milestone

- [ ] `pnpm install` succeeds from root
- [ ] `turbo build` compiles all packages and apps without TypeScript errors
- [ ] `docker compose up` starts all four services cleanly
- [ ] `GET /health` returns `{ status: "ok", mongo: "up", redis: "up" }`
- [ ] BullMQ worker connects and registers processors for all 6 queues
- [ ] All stub API routes return expected empty responses
- [ ] ESLint passes across the monorepo
