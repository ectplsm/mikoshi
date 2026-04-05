# Development Rules — Mikoshi

Rules for AI agents and human contributors working on this codebase.
For project overview, architecture, and API reference, see `README.md`.

## Parent Documents

Before making cross-repo sync, privacy, or ownership decisions:

- read the shared Mikoshi sync contract from the sibling `contracts-local/` directory
- read the relevant local plan index under `docs-local/plans/` when working on roadmap or multi-step changes

If this document conflicts with the shared contract, the shared contract wins.

## Coding Conventions

- TypeScript strict mode
- English for code, identifiers, comments, commit messages, and PR text
- Keep modules small and boundaries explicit
- Prefer root-cause fixes over UI band-aids
- Do not claim "complete compatibility" unless it is literally defensible

## Commit Rules

- Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, etc.)
- Subject line under 72 characters
- Blank line after subject, then a short explanatory body
- Subject-only commits are acceptable when the change is trivially obvious

## PR Workflow

- Default base branch: `main`
- Keep PRs as draft unless the user explicitly asks for ready-for-review
- PR title and body in English
- Never auto-merge — wait for explicit approval

When using `gh` CLI:

- Prefer the user's outer `gh` environment over sandbox-local auth
- If sandbox `gh auth status` fails, escalate instead of treating it as a blocker

## Privacy and Data Boundaries

These are hard constraints. Violating them is not a bug — it is sabotage.

**Never expose to non-owners:**

- `USER.md`, `MEMORY.md`, `memory/*.md`
- `archive.md`
- private operational metadata

This must hold across API responses, server-side authorization, UI rendering, and clone/export behavior.

**Sync boundaries:**

- Local Relic Engram is the source of truth for persona authoring
- Mikoshi is the cloud storage, distribution, and sync backend
- `sync` is for encrypted memory only — persona overwrites must be explicit
- `archive.md` is never uploaded, downloaded, or synced
- If persona files diverge between local and cloud, surface it as drift — never merge silently

## Security Requirements

- Enforce authorization on every private resource
- Validate all inputs with Zod
- Prevent path traversal and unsafe extraction
- Hash API keys at rest
- Rate limit uploads and sensitive endpoints
- Treat encrypted memory payloads as opaque blobs
- Require HTTPS/TLS in production

## Relic Boundary

Relic handles: local Engram management, persona injection, archive logging, memory distillation.

Mikoshi handles: authenticated cloud storage, Web UX, distribution/sharing, API access.

Do not duplicate Relic's local-only responsibilities inside Mikoshi.

## Onboarding Gate

Pages that require authentication must use `requireUsername()` from `src/lib/require-username.ts` instead of raw `auth()` checks.
This redirects unauthenticated users to `/` and users without a confirmed username to `/onboarding`.
Apply this to every new protected page.

## Local Plans

Multi-step work that should survive beyond a single session goes in `docs-local/plans/`.
This directory is gitignored — never commit it.

- `docs-local/plans/` — active and blocked plans only
- `docs-local/plans/archive/` — completed or superseded plans

Priority order: shared contracts in `contracts-local/` > `CLAUDE.md` > local plans.
If a plan conflicts with a shared contract or this file, update the plan.

Plan format:

- Start with purpose and scope
- Name parent documents near the top
- Distinguish settled rules from open questions
- Mark status clearly: active, blocked, superseded, or complete
- Archive completed/superseded plans instead of deleting them
