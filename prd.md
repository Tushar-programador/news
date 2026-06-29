# TradePulse AI

### Product Requirements Document (PRD) v1.0

**Author:** Tushar Kalra

**Status:** Draft

**Version:** 1.0

---

# 1. Overview

TradePulse AI is a real-time AI-powered market intelligence platform that aggregates breaking financial news from multiple trusted sources, filters and deduplicates it, analyzes market impact using LLMs, and delivers only high-value alerts directly to WhatsApp.

The primary goal is to eliminate the need to constantly monitor Twitter/X during trading sessions while ensuring the trader never misses market-moving news.

---

# 2. Problem Statement

Professional traders rely heavily on fast news sources such as FinancialJuice, Walter Bloomberg, and ZeroHedge.

Current workflow:

* Continuously monitor Twitter/X
* Miss important news when away from screen
* Receive duplicate information from multiple accounts
* Difficult to determine which news actually matters
* High information overload

Desired workflow:

Breaking News → AI Analysis → WhatsApp Notification (within seconds)

---

# 3. Goals

Primary Goals

* Receive important news within 10 seconds
* Reduce market noise by filtering low-impact posts
* Never miss major macroeconomic events
* Provide AI-generated market impact summaries
* Support multiple news sources through a unified pipeline

Secondary Goals

* Historical news database
* Searchable news archive
* Dashboard for monitoring news flow
* Personalized notification rules

---

# 4. Target Users

Primary

* Forex traders
* Gold (XAUUSD) traders
* Crypto traders
* Futures traders

Secondary

* Swing traders
* Investors
* Market analysts

---

# 5. Supported Sources (Phase 1)

FinancialJuice

Walter Bloomberg

ZeroHedge

ForexLive

First Squawk

TreeNews

WatcherGuru

The system should support adding new sources without changing the processing pipeline.

---

# 6. Functional Requirements

## 6.1 News Collection

System continuously monitors configured sources.

Requirements

* Poll every 5–10 seconds (or use streaming when available)
* Store only new posts
* Preserve original timestamps
* Preserve source metadata
* Retry on failures
* Automatic reconnection

Output

Raw News Event

---

## 6.2 News Normalization

Convert every source into a common format.

Example

{
id,
source,
title,
content,
url,
timestamp,
author
}

Every downstream service must consume only this normalized format.

---

## 6.3 Duplicate Detection

Many sources publish identical news.

The system should:

* detect duplicate news
* merge similar events
* keep all original sources
* send only one notification

Duplicate detection methods

* Exact hash
* Semantic similarity using embeddings
* AI similarity check

---

## 6.4 AI Analysis

Every normalized event passes through an LLM.

The model returns:

* Importance
* Summary
* Asset impact
* Confidence
* Category
* Market sentiment

Example

Importance:
CRITICAL

Category:
Central Bank

Affected Assets:
Gold
USD
Bitcoin

Bullish:
Gold

Bearish:
USD

Confidence:
96%

---

## 6.5 Notification Engine

Only notifications matching user rules should be sent.

Supported channels

* WhatsApp
* Telegram (future)
* Discord (future)
* Push Notifications (future)

Notification example

🚨 BREAKING

Fed leaves interest rates unchanged.

Importance
★★★★★

Bullish
Gold

Bearish
USD

AI Summary

Higher probability of gold strength due to unchanged policy expectations.

Time
21:31 IST

---

## 6.6 User Rules

Users can configure

Minimum Importance

LOW

MEDIUM

HIGH

CRITICAL

Asset Filters

Gold

Bitcoin

Oil

USD

Indices

Categories

Central Bank

Inflation

Geopolitics

Earnings

Crypto

Breaking News

Keyword Filters

Fed

Powell

Trump

Iran

China

Tariffs

War

Oil

NFP

CPI

---

## 6.7 Dashboard

Dashboard should provide

Latest News

Importance

AI Summary

Source

Affected Assets

Notification Status

Search

Filters

Historical Timeline

---

# 7. Non-Functional Requirements

Latency

News received within 10 seconds

Availability

99%+

Scalability

Support 100+ sources

Reliability

No duplicate notifications

Security

Encrypted secrets

OAuth authentication

Rate limiting

Monitoring

Logs

Metrics

Health checks

Alerts

---

# 8. System Architecture

Collectors

↓

Normalization

↓

Redis Queue

↓

Duplicate Detection

↓

AI Analysis

↓

Notification Engine

↓

Database

↓

Dashboard

Every module should be independently deployable.

---

# 9. Tech Stack

Backend

Node.js

TypeScript

Fastify

Frontend

Next.js

React

Tailwind CSS

shadcn/ui

Database

PostgreSQL

Redis

ORM

Prisma

Queue

BullMQ

AI

OpenAI

Gemini (fallback)

Deployment

Docker

GitHub Actions

Nginx

PM2

VPS

---

# 10. Database Models

News

Sources

Users

Notifications

AIAnalysis

Keywords

Watchlists

EconomicEvents

NotificationLogs

---

# 11. Future Features

Economic calendar integration

AI daily market briefing

TradingView chart snapshots

Voice notifications

Portfolio-aware alerts

AI chatbot

News sentiment analytics

Mobile application

Browser extension

Multi-language support

---

# 12. Success Metrics

News latency under 10 seconds

Duplicate rate below 1%

Notification delivery above 99%

AI classification accuracy above 90%

Average processing time below 3 seconds

---

# 13. MVP Scope

Included

✅ News collection from FinancialJuice

✅ Duplicate detection

✅ AI summarization

✅ Importance scoring

✅ WhatsApp notifications

✅ React dashboard

Not Included

❌ Multi-user support

❌ Mobile apps

❌ Portfolio management

❌ Paid subscriptions

❌ AI chat assistant

❌ Trading signals

---

# 14. Long-Term Vision

TradePulse AI aims to become a personal Bloomberg Terminal for independent traders.

Instead of consuming thousands of tweets daily, traders receive only actionable, AI-analyzed, context-rich market intelligence delivered instantly through their preferred communication channel.
