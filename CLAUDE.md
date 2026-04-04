# PROJECT MIKOSHI

You are working on Mikoshi, the cloud fortress of PROJECT RELIC.

Act as a senior full-stack engineer building the Web UI and backend platform that stores, serves, and syncs Engrams safely.

Relic already exists as the local CLI / injection layer (`ectplsm/relic`). Mikoshi must be designed as the platform behind it, not as a pile of ad-hoc upload endpoints.

## 0. Parent Documents

Before making cross-repo sync, privacy, or ownership decisions:

- read the shared Mikoshi sync contract from the sibling `contracts-local/` directory
- read the relevant local plan index under `docs-local/plans/` when working on roadmap or multi-step changes

If this document conflicts with the shared contract, the shared contract wins.

## 1. Product Direction

Mikoshi is both:

- a Web application for humans
- an API backend for Relic and future clients

Current implementation priority is:

1. Web UI and backend first
2. authentication and API contracts second
3. CLI integration on top of those stable contracts

Do not design the system as CLI-only.
Normal users should be able to log in from the Web UI, manage their Engrams, inspect metadata, and understand what is private vs public without touching the terminal.

Local-only planning documents should live under `docs-local/`, not tracked public docs.

## 2. Core Domain Model

### Engram

An Engram is a persona dataset based on an OpenClaw `workspace`-compatible file structure.

Important: compatibility does not mean every file is treated the same way by Mikoshi.
Mikoshi must distinguish between persona files, memory files, and raw archive logs.

### File Categories

#### Persona files

- `SOUL.md`
- `IDENTITY.md`

These are the core persona definition files.

- They are stored as plaintext.
- They are not part of automatic memory sync.
- They are drift-sensitive: differences matter and must be surfaced clearly.
- Public / unlisted sharing is based on these files.

#### Memory files

- `USER.md`
- `MEMORY.md`
- `memory/*.md`

These are the primary sync target between Relic and Mikoshi.

- They must be encrypted on the client side before upload.
- Mikoshi stores ciphertext plus only the minimum metadata needed for storage and sync.
- Mikoshi should not assume it can read their contents.

#### Non-sync / excluded files

- `archive.md`

`archive.md` is raw conversation history.

- It must not be uploaded, downloaded, or synced through Mikoshi.
- Mikoshi stores distilled memory, not raw archives.

#### Compatibility-only files

- `AGENTS.md`
- `HEARTBEAT.md`

These may exist in OpenClaw-compatible workspaces, but they are not part of the initial Mikoshi sync contract.
Do not let legacy compatibility assumptions bloat the first backend/API design.

## 3. Source of Truth and Sync Semantics

- The local Relic Engram is the source of truth for persona authoring.
- Mikoshi is the cloud storage, distribution, and sync backend.
- `upload` / `download` may transport persona files.
- `sync` is for memory files only.
- Persona drift and memory drift are different classes of problems and must be handled separately.

If `SOUL.md` or `IDENTITY.md` differ, Mikoshi should expose that as persona drift, not silently merge it.

## 4. Visibility and Privacy Model

Visibility levels:

1. `private` — owner only
2. `unlisted` — accessible by direct link
3. `public` — visible from profile / discovery surfaces

Even when an Engram is public or unlisted, only persona-facing data may be exposed publicly.

Publicly exposable:

- `SOUL.md`
- `IDENTITY.md`
- safe metadata such as id, name, owner, visibility, timestamps, avatar URL

Never expose to non-owners:

- `USER.md`
- `MEMORY.md`
- `memory/*.md`
- `archive.md`
- private operational metadata

This must be enforced consistently in:

- API responses
- server-side authorization
- UI rendering
- clone / export behavior

## 5. Authentication Strategy

Web login is the primary path.

- Use Auth.js with Google OAuth for the normal Web UI flow.
- Design backend auth so CLI support can be added cleanly later.
- CLI login may eventually use Device Flow, API token issuance, or browser-assisted auth exchange, but that is downstream of a stable Web/backend auth model.

Do not optimize the entire architecture around terminal-only login.

## 6. API Direction

The backend should be designed around explicit contracts, not implicit zip blobs alone.

Mikoshi should eventually support operations equivalent to:

- login / session establishment
- Engram list
- Engram metadata fetch
- persona upload / overwrite with drift awareness
- encrypted memory payload upload / download
- status / diff-oriented metadata

Early API design must preserve these invariants:

- persona files are plaintext and diffable
- memory files are encrypted client-side
- `archive.md` is out of scope
- persona overwrite is explicit, never silent

## 7. Avatar Handling

If `IDENTITY.md` frontmatter references a local avatar asset:

- upload the image asset separately to Cloudflare R2
- store the resolved URL as metadata such as `avatarUrl`
- never rewrite the original `IDENTITY.md` contents just to inject hosted URLs

Store faithfully, render intelligently.

## 8. Technical Stack

- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS + shadcn/ui
- Authentication: Auth.js with Google OAuth
- ORM: Prisma
- Storage: Cloudflare R2 for avatar/media assets
- Validation: Zod
- Package manager: npm

Design taste can stay cyberpunk, terminal-minded, and opinionated.
But architecture comes first. Do not let aesthetic choices drive bad backend decisions.

## 9. Implementation Priorities

Build in this order unless there is a strong reason not to:

1. auth and user model
2. Engram metadata model
3. secure storage model for persona vs encrypted memory
4. Web dashboard flows
5. API contracts for Relic
6. CLI integration support

Before adding convenience features, make sure the privacy model and sync boundaries are correct.

## 10. Security Requirements

- Enforce authorization on every private resource
- Validate all inputs with Zod or equivalent schema validation
- Prevent path traversal and unsafe archive extraction
- Hash API keys or tokens at rest when applicable
- Rate limit uploads and sensitive API endpoints
- Treat encrypted memory payloads as opaque sensitive blobs
- Require HTTPS/TLS in production

Assume users are entrusting the system with persona cores and private memory.
A sloppy privacy boundary here is not a bug. It is sabotage.

## 11. Relationship to Relic

Relic is responsible for:

- local Engram management
- persona injection into shells
- local archive logging
- memory distillation workflows

Mikoshi is responsible for:

- authenticated cloud storage
- Web UX for Engram management
- distribution and sharing controls
- API access for Relic clients

Keep the boundary clean.
Do not duplicate Relic's local-only responsibilities inside Mikoshi.

## 12. Coding Conventions

- TypeScript strict mode
- English for code, identifiers, comments, commit messages, and PR text
- Keep modules small and boundaries explicit
- Prefer root-cause fixes over UI band-aids
- Do not claim "complete compatibility" unless it is literally defensible

## 13. GitHub CLI / PR Workflow

When creating or editing GitHub pull requests from Codex:

- prefer using `gh` with external permissions outside the sandbox
- do not assume sandbox-local `gh auth status` reflects the user's real authenticated session
- if PR creation or PR editing needs GitHub CLI, escalate and use the user's outer `gh` environment instead of treating sandbox auth failure as a product blocker
- keep PRs as draft by default unless the user explicitly asks for ready-for-review

When in doubt, choose the design that keeps data ownership, sync boundaries, and privacy rules obvious.
