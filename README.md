# Ajaia Docs

A small, polished document product focused on the core loop:

> Create → Edit → Save → Share → Reopen

Not a Google Docs clone. A reviewer can go from login to shared editing in under two minutes.

API is versioned under /api/v1. Auth is a simple seeded cookie session (no JWT).

## Docs

- Product + process specs: apps/context/
  - apps/context/project-overview.md — goals, flow, features, scope
  - apps/context/architecture.md — stack, boundaries, storage, auth model
  - apps/context/ui-context.md — theme, tokens, layouts
  - apps/context/code-standards.md — conventions
  - apps/context/ai-workflow-rules.md — how work is scoped and verified
  - apps/context/progress-tracker.md — current phase and decisions
- ARCHITECTURE.md — one-page system overview
- AI_WORKFLOW.md — where AI helped vs where ownership stayed human
- SUBMISSION.md — live URL, accounts, review flow

## Stack

| Layer    | Choice |
| -------- | ------ |
| Frontend | React 19 + TypeScript + Vite, Tiptap (StarterKit + Underline), Tailwind + shadcn/ui, TanStack Query |
| Backend  | Node.js + Express 5 + TypeScript (routes under /api/v1, helmet/cors/rate-limit/pino kept) |
| DB       | PostgreSQL + Knex, Zod via @ajaia/schema |
| Auth     | Seeded users + signed httpOnly cookie session |

## Monorepo

```text
apps/client   — React app (Login, Documents, Editor pages)
apps/server   — Express API (app.ts, server.ts, modules/, routes/, services/, utils/)
packages/db   — Knex instance, migrations, seeds
packages/schema — shared Zod schemas
apps/context  — product and process specs
```

## Quickstart

```bash
pnpm install
# start Postgres and set DATABASE_URL + SESSION_SECRET in apps/server/.env (server root, not src/)
pnpm --filter @ajaia/db migrate:latest
pnpm --filter @ajaia/db seed:run
pnpm dev
```

Build everything: `pnpm --r run build`. Client builds with `tsc -b && vite build`.

Note: backend compile blockers are open (missing server tsconfig @/* paths, setupRoutes imports missing @/utils/response, routes/index.ts is a stub). Deps still to swap (remove drizzle/nodejs; add knex, dotenv, cookie-parser, multer, test runner). See apps/context/progress-tracker.md.

## Test accounts

- Alice — alice@ajaia.test
- Bob — bob@ajaia.test

Seeded login only; no registration or password reset.

## Suggested review flow

1. Sign in as Alice.
2. Create a document.
3. Rename it (1-150 chars).
4. Add bold, italic, underline, H1/H2, bullet + ordered lists.
5. Wait for Saved, refresh, verify formatting persists.
6. Share with Bob (owner-only, no self/duplicate shares).
7. Sign out, sign in as Bob.
8. Open from Shared with Me, edit, refresh.
9. Import a .txt or .md file (max 2 MB) and verify it opens as a document.

## API surface (all under /api/v1)

```text
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
GET    /api/v1/documents
POST   /api/v1/documents
GET    /api/v1/documents/:id
PATCH  /api/v1/documents/:id
POST   /api/v1/documents/import   (multipart .txt/.md)
GET    /api/v1/documents/:id/shares
POST   /api/v1/documents/:id/shares
DELETE /api/v1/documents/:id/shares/:userId
```

Errors look like `{ error: { code, message } }` (400 validation, 401/403 authz, 404 missing including catch-all, 500 unexpected). Save failures surface as Unable to save and never silently drop edits.

## Scope decisions

Focused on the core document workflow: create → edit → persist → share → reopen.

Did not implement:

- Real-time multi-user editing
- Comments
- Version history
- Offline editing
- DOCX import
- Complex permission roles
- Enterprise authentication
- Document search

These are valuable, but would have reduced reliability and polish of the core workflow in the timebox.

## If I had another 2-4 hours

1. Add document version history.
2. Add Markdown/DOCX import with proper format conversion.
3. Add richer sharing permissions.
4. Add real-time presence/collaboration indicators.
