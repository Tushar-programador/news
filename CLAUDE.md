# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TradePulse AI** — a real-time AI-powered market intelligence platform that ingests financial news, deduplicates it, analyzes market impact with LLMs, and delivers WhatsApp alerts within 10 seconds of publication. See [prd.md](prd.md) for full requirements and [tdd.md](tdd.md) for technical design.

## Tech Stack

- **Backend:** Node.js, TypeScript (strict mode), Fastify
- **Frontend:** Next.js, React, Tailwind CSS, shadcn/ui
- **Database:** PostgreSQL (via Prisma ORM)
- **Queue:** Redis + BullMQ
- **AI:** OpenAI (primary), Gemini (fallback)
- **Logging:** Pino (structured, with request ID + latency on every request)
- **Deployment:** Docker Compose, Nginx, PM2, GitHub Actions → VPS

## Monorepo Structure

```
tradepulse-ai/
  apps/
    api/          # Fastify API server
    dashboard/    # Next.js frontend
    worker/       # BullMQ worker processes
  packages/
    collector/    # Source polling logic
    ai/           # LLM prompts and analysis (prompts/ subdirectory)
    notifier/     # Notification channel adapters
    database/     # Prisma schema and client
    redis/        # Redis/BullMQ setup
    shared/       # Shared types and utilities
    logger/       # Pino logger config
    config/       # Environment/config loader
  services/
    financialjuice/
    twitter/
    economic-calendar/
    whatsapp/
  docker/
  infra/
```

## Data Flow

```
Collector → Normalizer → Redis (news.collect → news.normalize → news.deduplicate → news.ai → news.notify → news.archive)
                                                      ↓                                  ↓
                                              Duplicate Detection              AI Analysis Service
                                                                                         ↓
                                                                              Notification Service → WhatsApp
                                                                                         ↓
                                                                              PostgreSQL + Dashboard
```

Every queue must have retries, a dead letter queue, and metrics.

## Core Interfaces

```ts
// Normalized news — all downstream services consume only this
interface RawNews {
  id: string;
  source: string;
  headline: string;
  body: string;
  url: string;
  publishedAt: Date;
  metadata: {};
}

// AI analysis output
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

## API Routes

- `GET /api/news` — latest news
- `GET /api/news/:id` — single news item
- `GET /api/news/search` — search
- `POST /api/notify/test` — test notification
- `GET /api/notifications` — notification history
- `GET /api/sources` / `PATCH /api/sources/:id` — source management
- `GET /api/preferences` / `PUT /api/preferences` — user preferences
- `GET /health` — health check with queue/DB/Redis status

## Environment Variables

```
DATABASE_URL=
REDIS_URL=
OPENAI_API_KEY=
GEMINI_API_KEY=
WHATSAPP_TOKEN=
JWT_SECRET=
LOG_LEVEL=
PORT=
```

## Coding Standards

- TypeScript strict mode throughout
- Repository pattern — no business logic in controllers
- Zod for all input validation
- Dependency injection
- Async error handling with custom error classes and circuit breakers
- ESLint + Prettier enforced

## Duplicate Detection

Three-level strategy:
1. SHA256 hash (exact match)
2. Text similarity
3. OpenAI embedding similarity (threshold: ≥ 0.92)

## Authentication

JWT + refresh tokens, roles: `admin` and `trader`.

## Development Roadmap

Milestones in order: Infrastructure → Collector (FinancialJuice) → Deduplication → AI Analysis → WhatsApp → Dashboard → Additional Sources → Monitoring → Production.
