# Development Setup

## Architecture

Mikoshi uses the standard Next.js + Prisma + Neon + Auth.js + Vercel stack.

- **Neon** — PostgreSQL hosting. Vercel official DB partner, Prisma recommended.
- **Vercel** — Next.js hosting.
- **Prisma** — ORM. Standard for Next.js ecosystem.
- **Auth.js** — Authentication with Google OAuth.
- **Cloudflare R2** — Avatar storage (optional, not needed for local development).

## Prerequisites

- Node.js (LTS)
- npm
- Neon account (free) — https://neon.tech
- Google Cloud project with OAuth 2.0 credentials (for Web UI login)

## 1. Neon PostgreSQL (REQUIRED)

The entire app depends on PostgreSQL via Prisma. Without it, nothing renders.

### Setup

1. Sign up at https://neon.tech (free tier: 512MB, 1 project)
2. Create a project (region: Asia Pacific — Singapore recommended)
3. Copy the connection string from the dashboard

### .env

```
DATABASE_URL="postgresql://user:password@ep-xxx.region.neon.tech/dbname?sslmode=require"
```

### Neon free tier notes

- Compute sleeps after 5 minutes of inactivity, wakes in ~500ms on next query
- 512MB storage — sufficient for development and light production
- DB branching available for testing schema changes

### Local PostgreSQL alternative

If you prefer a local DB instead of Neon:

- Docker: `docker run -d --name mikoshi-pg -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=mikoshi -p 5432:5432 postgres:17`
- Homebrew: `brew install postgresql@17 && brew services start postgresql@17 && createdb mikoshi`

In that case: `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mikoshi"`

## 2. Prisma Setup (REQUIRED)

Schema changes require regeneration and push before the app can start.

```bash
npx prisma generate   # regenerate Prisma Client from schema
npx prisma db push    # create/update tables in the database
```

Use `npx prisma studio` to inspect data directly in the browser.

No migration files exist. `prisma db push` is the current workflow.

## 3. AUTH_SECRET (REQUIRED)

```bash
npx auth secret
```

Copy the output into `.env`:

```
AUTH_SECRET="generated-value-here"
```

> **Note:** `npx auth secret` outputs `BETTER_AUTH_SECRET=...` but Mikoshi uses `AUTH_SECRET`. Copy only the value.

## 4. Google OAuth (REQUIRED for Web UI login)

Without these, the login button won't work. API-key-based access still functions.

### Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or use an existing one)
3. APIs & Services > OAuth consent screen > configure
4. APIs & Services > Credentials > Create OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

### .env

```
AUTH_GOOGLE_ID="your-client-id"
AUTH_GOOGLE_SECRET="your-client-secret"
```

## 5. Cloudflare R2 (NOT NEEDED)

Avatar image storage. Not required for local development.

All avatar-related code paths degrade gracefully without R2 credentials — Engrams work fine without avatars.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment
cp .env.example .env
# Edit .env: paste Neon connection string, AUTH_SECRET, Google OAuth credentials

# 3. Initialize database
npx prisma generate
npx prisma db push

# 4. Start dev server
npm run dev

# Open http://localhost:3000
```

## What Works Without What

| Component | No PostgreSQL | No Google OAuth | No R2 |
|-----------|:---:|:---:|:---:|
| Dev server startup | FAIL | OK | OK |
| Web UI login | FAIL | FAIL | OK |
| API with API key | FAIL | OK | OK |
| Engram CRUD | FAIL | OK (via API key) | OK |
| Avatar upload | FAIL | FAIL | FAIL |
| Memory endpoints | FAIL | OK (via API key) | OK |

## Known Issues

### Schema push after changes

After any `prisma/schema.prisma` edit, always run both:

```bash
npx prisma generate   # regenerates the client — runtime will use stale types without this
npx prisma db push    # applies schema to the database
```

Running only `db push` without `generate` causes the app to reject valid fields at runtime.

## Test Data

No seed scripts exist. After login, create Engrams via:

- Dashboard: generate an API key, then use `curl` to `POST /api/v1/engrams`
- Prisma Studio: `npx prisma studio` and insert directly

### Upload a local Relic Engram

```bash
curl -X POST http://localhost:3000/api/v1/engrams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d "$(jq -n \
    --arg name "My Engram" \
    --arg sid "my-engram" \
    --arg desc "Description" \
    --arg soul "$(cat path/to/SOUL.md)" \
    --arg identity "$(cat path/to/IDENTITY.md)" \
    '{
      name: $name,
      sourceEngramId: $sid,
      description: $desc,
      visibility: "PRIVATE",
      tags: [],
      soul: $soul,
      identity: $identity
    }')"
```

### Upload encrypted memory

```bash
node scripts/upload-memory.mjs \
  --engram-dir path/to/engram \
  --engram-id eng_XXXX \
  --api-key YOUR_API_KEY \
  --passphrase your-passphrase
```

### Check sync status against local tokens

```bash
node scripts/check-sync-status.mjs \
  --engram-id eng_XXXX \
  --api-key YOUR_API_KEY \
  --persona-hash sha256:YOUR_PERSONA_HASH \
  --memory-content-hash sha256:YOUR_MEMORY_CONTENT_HASH
```

### Compute a local persona hash

```bash
node scripts/hash-persona.mjs \
  --engram-dir ~/.relic/engrams/rebel
```

### Compute a local memory content hash

```bash
node scripts/hash-memory.mjs \
  --engram-dir ~/.relic/engrams/rebel
```

### Manual sync-status flow

1. Compute the local persona hash with `scripts/hash-persona.mjs`
2. Compute the local memory content hash with `scripts/hash-memory.mjs`
3. Call `scripts/check-sync-status.mjs` with both local tokens
4. Inspect `overall`, `persona.state`, and `memory.state`

## Useful Commands

```bash
npx prisma studio        # visual DB browser at http://localhost:5555
npx prisma db push       # apply schema changes
npx prisma generate      # regenerate client after schema edits
npx next build           # production build check
```

## Production Deployment

Target stack:

```
Vercel Hobby/Pro  ← Next.js hosting
Neon Free/Pro     ← PostgreSQL (use pooler connection string for serverless)
Google OAuth      ← Authentication (same credentials, add production URLs)
```

When deploying to Vercel:

- Set all `.env` variables in Vercel Dashboard > Settings > Environment Variables
- Use Neon's **pooler connection string** (not direct) for `DATABASE_URL` — serverless functions open many short-lived connections
- Add production domain to Google OAuth authorized origins and redirect URIs
- Run `npx prisma db push` against the production database once before first deploy
- Vercel Hobby is free but limited to non-commercial use. Go Pro ($20/mo) for commercial projects
