# Implementation Plan: OutreachPilot

## Phase 1: Foundation & Setup
- [x] Task 1.1: Scaffold Next.js (App Router, TypeScript, Tailwind) frontend and NestJS backend as separate apps in a single repo (npm/pnpm workspaces).
- [x] Task 1.2: Configure PostgreSQL and Drizzle (or Prisma) schema per Technical Design; verify connectivity from NestJS.
- [x] Task 1.3: Set up Redis + BullMQ and confirm a trivial job runs end-to-end.
- [x] Task 1.4: Implement auth (Auth.js or Lucia) with login/signup pages.

## Phase 2: Data Ingestion
- [ ] Task 2.1: Build the `boards` module — integrate one public job-board API (e.g. Remote OK) as a scheduled BullMQ job that upserts Company + Lead records.
- [ ] Task 2.2: Add manual lead entry and CSV import for reverse-outreach targets.
- [ ] Task 2.3: Build the `EnrichmentProvider` adapter and wire up one contact-enrichment provider (e.g. Hunter.io) behind it.

## Phase 3: AI Drafting & Review Queue
- [ ] Task 3.1: Build `AiDraftService` with a swappable LLM backend; generate a draft outreach message per new lead using a template + company signal.
- [ ] Task 3.2: Build the Review Queue UI — list of `PENDING_REVIEW` messages with inline edit, approve, and reject actions.
- [ ] Task 3.3: Enforce the approval gate: the send worker only reads `APPROVED` messages, never generates or sends directly.

## Phase 4: Sending & Pipeline Tracking
- [ ] Task 4.1: Implement Nodemailer-based sending via user's own SMTP/OAuth credentials; move message to `SENT` and lead to `CONTACTED` on success.
- [ ] Task 4.2: Add basic reply/open tracking (tracking pixel or IMAP reply check) to auto-advance a lead to `REPLIED`.
- [ ] Task 4.3: Build the pipeline board UI (New → Contacted → Replied → Call Booked → Won/Lost) with drag/status updates.

## Phase 5: Dashboard, Polish & Deployment
- [ ] Task 5.1: Build the dashboard: weekly outreach volume, response rate, leads by source, progress vs. weekly target.
- [ ] Task 5.2: Add the weekly digest email summarizing pipeline status.
- [ ] Task 5.3: Perform a clean local production build (frontend + backend), check for TypeScript errors, then deploy (Vercel + small VPS/Fly.io/Railway for API, Postgres, Redis).
