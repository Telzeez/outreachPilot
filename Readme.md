Here's the practical setup:

## 1. Put the docs in your project
Create a new folder for the project (or open your existing repo in VS Code), and drop all six files at the **root** of the repo:
```
your-project/
├── AGENTS.md
├── PRD.md
├── TECHNICAL_DESIGN.md
├── IMPLEMENTATION_PLAN.md
├── TESTING_CICD.md
└── README.md
```
Root-level placement matters — coding agents look there first for project context.

## 2. Install the Claude Code extension
In VS Code: Extensions (Ctrl+Shift+X) → search "Claude Code" → install the one published by **Anthropic** (there are look-alikes, double-check the publisher). Sign in with any paid Claude plan (Pro/Max/Team/Enterprise) — no API key needed. Once installed, click the **Spark icon** in the editor toolbar or the Activity Bar to open the chat panel.

## 3. Point it at your docs
`AGENTS.md` is exactly the convention Claude Code uses for standing project instructions, so it'll pick that up automatically. For the others, just @-mention them the first time so they're loaded into context, e.g.:

```
@PRD.md @TECHNICAL_DESIGN.md @IMPLEMENTATION_PLAN.md 
Set up Phase 1, Task 1.1: scaffold the Next.js and NestJS apps per the technical design.
```

Then work through `IMPLEMENTATION_PLAN.md` one task at a time — that's literally why it's broken into checkboxes. A good pattern:
```
@IMPLEMENTATION_PLAN.md Do Task 1.2 next. Follow AGENTS.md rules.
```

## 4. Review before accepting
The extension shows inline diffs for every change — review and accept/reject rather than blanket auto-accepting, especially early on while the scaffolding is being laid down. You can toggle auto-accept later for trusted, repetitive steps.

## 5. Let it run tests/lint itself
Once you approve terminal access, it can run `npm run test`, `npm run lint`, etc. straight from `TESTING_CICD.md`'s commands — worth telling it explicitly to run those before marking a task done, since that's literally rule #1 in your CI doc.

One nice detail: if you ever end up with both a `CLAUDE.md` and `AGENTS.md`, Claude Code reads either, but keeping just `AGENTS.md` (as you have) avoids duplication/drift.