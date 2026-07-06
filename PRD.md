# Product Requirements Document: OutreachPilot – Automated Client Outreach for Web Developers

## 1. Project Overview
* **Objective:** Automate the manual, repetitive parts of remote client/job hunting for web developers and small agencies — discovering opportunities, researching companies, finding decision-makers, drafting personalized outreach — while keeping a human-in-the-loop review step before anything is sent.
* **Target Audience:** Freelance web developers, small dev agencies, and indie hackers offering web development services who currently do manual outreach (job boards, LinkedIn research, cold email) to land clients.
* **Core Value Proposition:** Turns a multi-hour manual workflow (search boards → research companies → find contacts → write custom emails → track replies) into a queue of ready-to-review outreach the user can approve in minutes instead of hours.

## 2. Core MVP Features
* **Opportunity Aggregation:** Pull listings from open job boards / public APIs (e.g. Remote OK's public JSON feed, We Work Remotely RSS) filtered to web-dev-relevant keywords ("React", "Next.js", "Full Stack", etc.).
* **Reverse Outreach Targets:** User can add target companies manually or via CSV import — companies with no open role, approached proactively (per the "reverse job search" strategy).
* **Contact Discovery:** Enrich companies with decision-maker contact info via pluggable provider adapters (e.g. Hunter.io, Apollo.io free/paid tiers). No direct LinkedIn scraping — that violates ToS and risks account bans.
* **AI Draft Generation:** Generate a personalized outreach message per lead using an LLM, combining a reusable template with a specific observation about the company (e.g. site performance issue, outdated stack, missing feature).
* **Human Review Queue:** Every AI-drafted message lands in a "Pending Review" queue. The user edits, approves, or rejects before send. This is a hard requirement, not a toggle — nothing auto-sends without explicit approval.
* **Send & Track:** Approved messages go out through the user's own connected email (SMTP or Gmail/Outlook OAuth), with open and reply tracking.
* **Lightweight CRM Pipeline:** Track each lead through stages: New → Contacted → Replied → Call Booked → Won/Lost.
* **Dashboard:** Weekly outreach volume, response rate, leads by source, progress against a weekly outreach target (e.g. "10–15 companies this week").

## 3. Scope & Non-Goals for Phase 1
* **In Scope:** Single-user accounts, one connected email sender per account, board-sourced + manually added leads, review-before-send only, a simple weekly digest email summarizing pipeline status.
* **Out of Scope for Phase 1:** Multi-seat team accounts, LinkedIn automation/scraping of any kind, fully automated sending without review, third-party CRM integrations (HubSpot, Pipedrive), SMS/social outreach channels, analytics export/reporting API.

## 4. Key Non-Functional Requirements
* **Approval gate is non-negotiable:** no message leaves the system without an explicit user click.
* **ToS-respecting data sources only:** every board/enrichment integration must use a public API, RSS feed, or a provider whose ToS explicitly allows this use — no scraping sites that disallow it.
* **Data minimization:** store only the contact fields needed for outreach; support deletion of a lead's contact data on request.
* **Lightweight infra:** avoid heavy or duplicated data stores; one Postgres instance should comfortably serve the MVP.
