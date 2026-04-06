# MIKOSHI: Fortress for Digital Souls

<img src="assets/mikoshi_hero.png" alt="MIKOSHI: Fortress for Digital Souls" width="720">

**Mikoshi** is a cloud backend for storing, sharing, and managing AI **Engrams**
(persona and memory).
Part of [Relic](https://github.com/ectplsm/relic) — an AI persona injection system.

## What is an Engram?

An Engram is a set of Markdown files that define an AI persona, compatible with [OpenClaw](https://github.com/openclaw/openclaw) workspaces:

```
SOUL.md          # Core behavioral directives
IDENTITY.md      # Persona identity and avatar
USER.md          # User-specific information
MEMORY.md        # Memory index
memory/          # Date-based memory entries
```

In Mikoshi's sync model:

- `SOUL.md` and `IDENTITY.md` are stored as plaintext — viewable, shareable, diffable
- `USER.md`, `MEMORY.md`, and `memory/*.md` are encrypted client-side before upload — Mikoshi never sees the contents
- `archive.md` is local-only and never uploaded

## Getting Started

### 1. Sign in

Go to [mikoshi.ectplsm.com](https://mikoshi.ectplsm.com) and sign in with Google. Choose a username on your first visit.

### 2. Install Relic

Engrams are created and managed locally with [Relic](https://github.com/ectplsm/relic):

```bash
npm install -g @ectplsm/relic
relic init
```

### 3. Create an Engram

Use Relic's MCP tools with your favorite AI coding CLI (Claude Code, Codex, Gemini CLI) to create an Engram interactively, or use the CLI directly:

```bash
relic create --id my-persona --name "My Persona"
```

### 4. Upload to Mikoshi

Generate an API key in **Settings** on the Mikoshi dashboard, then use Relic to upload:

```bash
# (Relic sync commands — coming soon)
```

### 5. Share

Set your Engram's visibility to **Public** or **Unlisted** from the dashboard. Others can view the persona files and clone your Engram into their own account.

## Features

- **Persona Storage** — Store Engrams with plaintext `SOUL.md` and `IDENTITY.md`
- **Encrypted Memory** — Upload distilled memory as an opaque encrypted bundle
- **Sync Status** — Compare local persona and memory hashes against cloud state
- **Drift Detection** — Persona overwrites use optimistic concurrency (409 on conflict)
- **Share** — Set visibility to Public, Unlisted, or Private
- **Clone** — Copy public Engrams from other users
- **Privacy** — Only persona files are visible to non-owners; memory is always private
- **API Keys** — SHA-256 hashed, shown only once on creation

## API

All endpoints require authentication via Bearer token (API key) or session cookie.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/engrams` | Create an Engram |
| `GET` | `/api/v1/engrams` | List your Engrams |
| `GET` | `/api/v1/engrams/:id` | Fetch Engram (privacy-filtered) |
| `PATCH` | `/api/v1/engrams/:id` | Update metadata |
| `DELETE` | `/api/v1/engrams/:id` | Delete Engram |
| `POST` | `/api/v1/engrams/:id/clone` | Clone a public/unlisted Engram |
| `PUT` | `/api/v1/engrams/:id/persona` | Replace persona files (drift detection) |
| `PUT` | `/api/v1/engrams/:id/memory` | Upload encrypted memory bundle |
| `GET` | `/api/v1/engrams/:id/memory` | Download encrypted memory bundle |
| `DELETE` | `/api/v1/engrams/:id/memory` | Delete encrypted memory bundle |
| `GET` | `/api/v1/engrams/:id/sync-status` | Fetch sync comparison tokens (owner-only) |
| `PATCH` | `/api/v1/me/profile` | Update username or display name |
| `GET` | `/api/v1/me/username-availability` | Check username availability |
| `POST` | `/api/v1/api-keys` | Create API key |
| `GET` | `/api/v1/api-keys` | List API keys |
| `DELETE` | `/api/v1/api-keys` | Delete API key |

## Related Projects

- **[Relic](https://github.com/ectplsm/relic)** — CLI tool and MCP server for injecting Engrams into AI shells (Claude, Gemini, etc.)
- **[OpenClaw](https://github.com/openclaw/openclaw)** — Engram file structure standard

## Glossary

| Term | Role | Description |
|------|------|-------------|
| **Relic** | Injector | CLI tool that injects personas into AI CLIs |
| **Mikoshi** | Backend | This project — cloud fortress for Engram storage |
| **Engram** | Data | AI persona dataset (Markdown files) |
| **Shell** | LLM | AI CLI (Claude, Gemini, etc.) that receives the Engram |
| **Construct** | Process | A running instance of an Engram loaded into a Shell |

## Self-Hosting

If you want to run your own Mikoshi instance:

### Prerequisites

- Node.js >= 20
- PostgreSQL
- Google OAuth credentials

### Setup

```bash
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL, AUTH_SECRET, Google OAuth credentials, etc.
npx prisma generate
npx prisma db push
npm run dev
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth | Auth.js v5 (Google OAuth) |
| Database | PostgreSQL + Prisma v7 |
| Validation | Zod v4 |

## License

[MIT](./LICENCE.md)
