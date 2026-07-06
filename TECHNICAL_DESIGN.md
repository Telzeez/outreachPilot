# Technical Design Document: OutreachPilot

## 1. Technology Stack
* **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS + shadcn/ui.
* **Backend:** NestJS (modular monolith to start), TypeScript, REST API.
* **Database:** PostgreSQL — single instance, no polyglot persistence for the MVP.
* **ORM:** Drizzle ORM (open source, lightweight, no heavy codegen runtime) — Prisma is an acceptable fallback if the team prefers its DX, but Drizzle keeps the query layer thinner.
* **Queue / Background Jobs:** BullMQ + Redis, used for board polling, contact enrichment, and the email-send worker. Redis footprint is small — this is not "another heavy database," it's an ephemeral job queue.
* **Job Board Ingestion:** Prefer public JSON/RSS APIs (e.g. Remote OK's public feed). For boards without an API, use Playwright (open source) as a scheduled worker — respecting robots.txt and rate limits.
* **Contact Enrichment:** Adapter pattern so providers (Hunter.io, Apollo.io) are swappable; no hard dependency on one vendor.
* **AI Drafting:** LLM calls go through a single `AiDraftService` interface, so the backing model (Claude/OpenAI API, or a self-hosted open-source model via Ollama running Llama/Mistral) can be swapped without touching business logic.
* **Email Sending:** Nodemailer (open source) using the user's own SMTP credentials or Gmail/Outlook OAuth — never a shared sending domain, to protect deliverability and avoid spam-policy issues.
* **Auth:** Auth.js (NextAuth) or Lucia — both open source, both lightweight.
* **Hosting:** Next.js on Vercel; NestJS + Postgres + Redis on a small VPS or Railway/Fly.io instance. Keep infra minimal — no Kubernetes, no managed data warehouse for the MVP.

## 2. Architecture & File Structure
```text
apps/
├── web/                     # Next.js frontend
│   ├── app/
│   │   ├── (auth)/          # Login / signup
│   │   ├── (dashboard)/     # Review queue, pipeline, dashboard
│   │   └── api/             # Route handlers that proxy to NestJS where needed
│   ├── components/
│   │   ├── ui/              # shadcn atoms
│   │   └── shared/          # Composite components (LeadCard, ReviewQueueItem)
│   └── lib/                 # API client, fetchers
└── api/                     # NestJS backend
    ├── src/
    │   ├── modules/
    │   │   ├── boards/       # Job board ingestion workers
    │   │   ├── companies/    # Company + enrichment logic
    │   │   ├── leads/        # Lead pipeline state
    │   │   ├── outreach/     # Draft generation + review queue + send
    │   │   └── auth/
    │   ├── queue/            # BullMQ processors
    │   └── prisma-or-drizzle/# DB client + schema
```

## 3. Database Schema (illustrative)
```text
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  emailProvider String?  // 'smtp' | 'gmail' | 'outlook'
  createdAt     DateTime @default(now())
}

model Company {
  id          String   @id @default(cuid())
  name        String
  website     String?
  source      String   // 'board' | 'manual' | 'csv'
  notes       String?
  createdAt   DateTime @default(now())
}

model Contact {
  id         String   @id @default(cuid())
  companyId  String
  name       String?
  role       String?
  email      String
  source     String   // 'hunter' | 'apollo' | 'manual'
}

model Lead {
  id         String   @id @default(cuid())
  companyId  String
  contactId  String?
  userId     String
  stage      Stage    @default(NEW)
  createdAt  DateTime @default(now())
}

enum Stage {
  NEW
  CONTACTED
  REPLIED
  CALL_BOOKED
  WON
  LOST
}

model OutreachMessage {
  id         String   @id @default(cuid())
  leadId     String
  draft      String
  status     MsgStatus @default(PENDING_REVIEW)
  sentAt     DateTime?
}

enum MsgStatus {
  PENDING_REVIEW
  APPROVED
  REJECTED
  SENT
}
```

## 4. Key Design Constraints
* The `OutreachMessage.status` field is the enforcement point for the approval gate — the send worker must only ever pick up rows with `status = APPROVED`.
* All external data-source adapters implement a common interface (`BoardSource`, `EnrichmentProvider`) so new sources can be added without touching core logic.
* Keep the number of running services small: web, api, postgres, redis. Resist adding a search engine, a second database, or a message broker beyond Redis/BullMQ until there's a proven need.
