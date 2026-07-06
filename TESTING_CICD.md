# Testing & CI/CD Framework: OutreachPilot

## 1. Testing Frameworks
* **Unit Testing:** Vitest for utility functions, adapters (`BoardSource`, `EnrichmentProvider`, `AiDraftService`), and NestJS services.
* **Component Testing:** React Testing Library for frontend components, especially the Review Queue item (edit/approve/reject states).
* **End-to-End (E2E):** Playwright for critical paths — login, the full lead lifecycle (ingest → draft → review → approve → send), and the pipeline-stage transitions.

## 2. Execution Commands
* Run Unit Tests: `npm run test`
* Run E2E Tests: `npm run test:e2e`
* Run Linter: `npm run lint`

## 3. Critical-Path Test Priorities
* **Approval gate:** an automated test must assert that no `OutreachMessage` can transition to `SENT` without first passing through `APPROVED` — this is the single most important invariant in the system and should have a dedicated test, not just incidental coverage.
* **Adapter contracts:** each `BoardSource` and `EnrichmentProvider` implementation should have a contract test verifying it conforms to the shared interface, so swapping providers never silently breaks ingestion.
* **Rate-limit/ToS compliance:** ingestion workers should have tests confirming they respect configured polling intervals and don't hammer external APIs.

## 4. Pre-Commit / CI Rules
* The agent must verify that the build succeeds locally before marking a task complete.
* Continuous Integration pipeline rules:
  * Code must have 0 TypeScript compiler warnings across both `apps/web` and `apps/api`.
  * All unit and E2E tests must pass before code can be merged into the `main` production branch.
  * Any change touching `outreach` (draft generation, review queue, send worker) requires the approval-gate test to run and pass explicitly.
