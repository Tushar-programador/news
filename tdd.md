# TradePulse AI

## Technical Design Document (TDD) v1.0

**Project:** TradePulse AI

**Author:** Tushar Kalra

**Version:** 1.0

**Language:** TypeScript

**Architecture:** Event-Driven Microservices

---

# 1. System Overview

TradePulse AI is a distributed event-driven application that continuously ingests financial news, normalizes and deduplicates it, enriches it with AI, and delivers real-time notifications through multiple channels.

Target latency:

**News Published → WhatsApp Delivered < 10 seconds**

---

# 2. High-Level Architecture

```
                    Scheduler
                        │
                        ▼
               Collector Service
                        │
                        ▼
               Normalization Layer
                        │
                        ▼
                 Redis Queue (BullMQ)
                        │
      ┌─────────────────┴─────────────────┐
      ▼                                   ▼
Duplicate Detection               AI Analysis Service
      │                                   │
      └─────────────────┬─────────────────┘
                        ▼
               Notification Service
          ┌─────────────┼──────────────┐
          ▼             ▼              ▼
      WhatsApp      Dashboard      WebSocket
                        │
                        ▼
                  PostgreSQL
```

---

# 3. Monorepo Structure

```
tradepulse-ai/

apps/
 ├── api/
 ├── dashboard/
 ├── worker/

packages/
 ├── collector/
 ├── ai/
 ├── notifier/
 ├── database/
 ├── redis/
 ├── shared/
 ├── logger/
 ├── config/

services/
 ├── financialjuice/
 ├── twitter/
 ├── economic-calendar/
 ├── whatsapp/

docker/

docs/

infra/
```

---

# 4. Services

## Collector Service

Responsibilities

* Poll news sources
* Authenticate if required
* Retry on failures
* Publish raw events to Redis

Input

None

Output

```
RawNewsEvent
```

---

## Normalizer

Converts every source into one schema.

Example

```ts
interface RawNews {

 id:string;

 source:string;

 headline:string;

 body:string;

 url:string;

 publishedAt:Date;

 metadata:{}
}
```

No downstream service should depend on source-specific formats.

---

## Duplicate Detection

Methods

Level 1

SHA256 Hash

Level 2

Text Similarity

Level 3

OpenAI Embedding Similarity

Threshold

0.92+

Output

```
MergedNewsEvent
```

---

## AI Service

Receives

```
Raw News
```

Returns

```ts
interface AIAnalysis{

summary:string;

importance:"LOW"|"MEDIUM"|"HIGH"|"CRITICAL";

category:string;

bullish:string[];

bearish:string[];

confidence:number;

reason:string;

}
```

Prompt Templates stored under

```
packages/ai/prompts/
```

---

## Notification Service

Consumes

```
AIAnalysis
```

Checks

User Rules

↓

Formats Message

↓

Delivers

Channels

WhatsApp

Telegram

Discord

Push

Email

---

# 5. Redis Queues

```
news.collect

↓

news.normalize

↓

news.deduplicate

↓

news.ai

↓

news.notify

↓

news.archive
```

Every queue

Retries

Dead Letter Queue

Metrics

---

# 6. PostgreSQL Schema

## sources

```
id

name

type

enabled

createdAt
```

---

## news

```
id

headline

content

summary

importance

category

publishedAt

createdAt
```

---

## news_sources

```
newsId

sourceId
```

---

## ai_analysis

```
newsId

summary

reason

confidence

bullish

bearish

tokens

model
```

---

## notifications

```
id

newsId

channel

status

sentAt

latency
```

---

## users

```
id

phone

timezone

createdAt
```

---

## preferences

```
minimumImportance

keywords

assets

categories

quietHours

channels
```

---

# 7. API Design

## News

GET

```
/api/news
```

Latest News

GET

```
/api/news/:id
```

Search

GET

```
/api/news/search
```

---

## Notifications

POST

```
/api/notify/test
```

GET

```
/api/notifications
```

---

## Sources

GET

```
/api/sources
```

PATCH

```
/api/sources/:id
```

Enable

Disable

---

## Preferences

GET

```
/api/preferences
```

PUT

```
/api/preferences
```

---

# 8. Folder Structure

```
apps/api/src/

controllers/

services/

repositories/

middlewares/

routes/

jobs/

queues/

workers/

utils/

config/

types/
```

---

# 9. Coding Standards

TypeScript Strict Mode

ESLint

Prettier

Zod Validation

Repository Pattern

Dependency Injection

No Business Logic inside Controllers

Async Error Handling

Structured Logging (Pino)

---

# 10. Error Handling

Global Error Handler

Custom Errors

Retry Logic

Rate Limit Errors

Queue Failures

Dead Letter Queue

Circuit Breakers

---

# 11. Authentication

Dashboard

JWT

Refresh Tokens

Role Based Access

Admin

Trader

Future

OAuth

Google

GitHub

---

# 12. Logging

Pino

Every request gets

Request ID

Processing Time

Status Code

Source

Latency

---

# 13. Monitoring

Health Endpoint

```
/health
```

Metrics

Queue Size

Processing Time

Notification Latency

OpenAI Usage

Redis Health

Database Health

---

# 14. Deployment

Docker Compose

Services

API

Worker

Redis

PostgreSQL

Dashboard

Reverse Proxy

Nginx

CI/CD

GitHub Actions

Deploy

VPS

---

# 15. Environment Variables

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

---

# 16. AI Prompt Strategy

Summarization Prompt

Impact Analysis Prompt

Duplicate Detection Prompt

Risk Assessment Prompt

Daily Briefing Prompt

Morning Report Prompt

---

# 17. Development Roadmap

Milestone 1

Project Setup

Monorepo

Docker

CI

Database

Redis

Milestone 2

Collector Service

FinancialJuice

Deduplication

Milestone 3

AI Analysis

Importance

Summary

Asset Impact

Milestone 4

WhatsApp Integration

Retry

Templates

Milestone 5

Dashboard

Authentication

Live Feed

Filters

Milestone 6

Additional Sources

Reuters

Bloomberg

CoinDesk

Economic Calendar

Milestone 7

Production

Monitoring

Backups

Scaling

Caching

---

# 18. Future Architecture

* Event streaming (Kafka/NATS)
* Multi-region deployment
* AI model routing
* Webhook ingestion
* Mobile push service
* Real-time analytics
* Portfolio-aware recommendations
* Plugin architecture for new data sources
* Enterprise multi-tenant support

---

# 19. Definition of Done

A feature is complete only if:

* Unit tests pass
* Integration tests pass
* API documented
* Logging added
* Metrics exposed
* Error handling implemented
* Docker build succeeds
* CI passes
* No TypeScript errors
* Code reviewed

---

# 20. Initial Development Priority

1. Infrastructure (Docker, PostgreSQL, Redis, API)
2. Collector Service
3. Normalization Pipeline
4. Deduplication
5. AI Analysis
6. WhatsApp Notifications
7. Dashboard
8. Additional Sources
9. Monitoring & Observability
10. Production Deployment
