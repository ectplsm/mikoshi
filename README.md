```
    __  ___ ____ __ __ ____  _____ __ __ ____
   /  |/  //  _// //_// __ \/ ___// // //  _/
  / /|_/ / / / / ,<  / / / /\__ \/ _  / / /
 / /  / /_/ / / /| |/ /_/ /___/ / // /_/ /
/_/  /_//___//_/ |_|\____//____/_//_//___/

           CLOUD DATA FORTRESS
           Engram Storage & Sharing Hub
```

**Mikoshi** is a cloud fortress for storing, sharing, and managing AI persona data (**Engrams**).
Part of [PROJECT RELIC](https://github.com/ectplsm/relic) — a cyberpunk AI agent management system.

## What is an Engram?

An Engram is a set of Markdown files that define an AI persona, compatible with [OpenClaw](https://github.com/openclaw/openclaw) workspaces:

```
SOUL.md          # Core behavioral directives
IDENTITY.md      # Persona identity and avatar
AGENTS.md        # Agent configuration
USER.md          # User-specific information
MEMORY.md        # Memory index
HEARTBEAT.md     # Periodic introspection
memory/          # Date-based memory entries
```

## Features

- **Upload** — Push Engrams via CLI ([Relic](https://github.com/ectplsm/relic)) or drag-and-drop Zip on the Web UI
- **Share** — Set visibility to Public, Unlisted, or Private
- **Clone** — Copy public Engrams from other users
- **Privacy** — Only `SOUL.md` and `IDENTITY.md` are visible to non-owners; all other files are always private
- **API Keys** — SHA-256 hashed, shown only once on creation
- **Avatar** — Auto-extracted from `IDENTITY.md` frontmatter and stored on Cloudflare R2 (original files are never modified)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth | Auth.js v5 (Google OAuth) |
| Database | PostgreSQL + Prisma v7 |
| Validation | Zod v4 |
| Image Storage | Cloudflare R2 |
| UI Design | Cyberpunk / CLI-style ASCII art |

## Getting Started

### Prerequisites

- Node.js >= 20
- PostgreSQL (or use `npx prisma dev` for a local instance)
- Google OAuth credentials (for authentication)

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, AUTH_SECRET, Google OAuth credentials, etc.

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Start dev server
npm run dev
```

Open http://localhost:3000.

## API

All endpoints require authentication via Bearer token (API key) or session cookie.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/engrams` | Upload Engram (multipart/form-data with .zip) |
| `GET` | `/api/v1/engrams` | List your Engrams |
| `GET` | `/api/v1/engrams/:id` | Fetch Engram (privacy-filtered) |
| `PATCH` | `/api/v1/engrams/:id` | Update metadata |
| `DELETE` | `/api/v1/engrams/:id` | Delete Engram |
| `POST` | `/api/v1/engrams/:id/clone` | Clone a public/unlisted Engram |
| `POST` | `/api/v1/api-keys` | Create API key |
| `GET` | `/api/v1/api-keys` | List API keys |
| `DELETE` | `/api/v1/api-keys` | Delete API key |

## Pages

| URL | Description |
|-----|-------------|
| `/` | Landing page |
| `/dashboard` | Engram management, upload, API keys (auth required) |
| `/e/:id` | Engram detail and file viewer |
| `/@:username` | Public user profile |

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

## License

MIT
