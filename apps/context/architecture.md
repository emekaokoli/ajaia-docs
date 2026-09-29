# Architecture Context

## Stack

| Layer      | Technology                                    | Role                                         |
| ---------- | --------------------------------------------- | -------------------------------------------- |
| Framework  | React 19 + TypeScript + Vite                  | Frontend in apps/client                      |
| Routing    | TanStack Router                               | Typed client routes and navigation           |
| Editor     | Tiptap StarterKit + Underline                 | Rich text, JSON persistence                  |
| UI         | Tailwind + shadcn/ui, Lucide icons            | Design system, components/ui                 |
| Fetching   | TanStack Query                                | Server state, cache, and mutations           |
| Tables     | TanStack Table                                | Document collection rows and table state     |
| Forms      | React Hook Form + Zod resolver                | Form state and shared-schema validation      |
| Backend    | Node.js + Express 5 + TypeScript              | REST API in apps/server (mounted at /api/v1) |
| DB         | PostgreSQL                                    | users, documents, document_shares            |
| Queries    | Knex (target per spec)                        | Migrations, seeds, authz queries             |
| Validation | Zod via @ajaia/schema                         | Shared request/response schemas              |
| Auth       | Seeded users + signed httpOnly cookie session | req.user.id for authz (no JWT)               |
| Parsing    | .txt + .md only (multer)                      | Import creates new document                  |
| Hardening  | helmet, cors, express-rate-limit, pino        | Kept from scaffold                           |

Note: scaffold currently contains drizzle-orm/pg and a wrong blockchain drizzle dep in apps/server. Target is Knex + pg; remove the wrong dep during backend foundation. Scaffold JWT\_\*/MONGO_URI env vars are retired; Postgres + simple session is the documented path.

## System Boundaries

Scaffold layout is kept (per decision); spec module names are mapped onto it:

- apps/server/src/app.ts — owns app composition (json, cors, helmet, rate-limit, pino, routes, error handler).
- apps/server/src/server.ts — owns boot (listen, unhandledRejection).
- apps/server/src/modules/setupRoutes.ts — owns route mounting (/healthcheck, /api/v1/ router, catch-all 404).
- apps/server/src/modules/errorHandler.ts — owns error mapping (DomainError → spec error shape; see Invariants).
- apps/server/src/routes/ — owns HTTP routers: auth.ts, documents.ts, shares.ts (index.ts aggregates; current stub must be replaced).
- apps/server/src/services/ (new) — owns logic: documentService.ts, shareService.ts, import handling.
- apps/server/src/utils/ — owns cross-cutting helpers: error.ts (DomainError + code), responseBuilder.ts (spec-shape responses), logger.ts.
- apps/server/src/middleware/ — currently empty; session-auth middleware (auth.ts) goes here when built, or the folder is removed if auth lives in utils. Decide at implementation.
- packages/db/ — owns Knex instance, migrations, seeds. No HTTP.
- packages/schema/ — owns Zod schemas shared by client and server. No I/O.
- apps/client/src/router.tsx — owns the code-based TanStack Router tree for /login, /documents, and /documents/$documentId.
- apps/client/src/main.tsx — composes the TanStack Query client and router providers.

Known gap: setupRoutes.ts imports @/utils/response (ResponseUtils.notFound) which does not exist; fix by pointing it at responseBuilder.ts with the spec error shape. Path alias @/\* requires a tsconfig.json with paths (missing — must be added).

## Storage Model

- users: id, email, name, created_at. Seeds: alice@ajaia.test, bob@ajaia.test.
- documents: id, owner_id → users.id, title, content (Tiptap JSON, not HTML), created_at, updated_at.
- document_shares: id, document_id → documents.id, user_id → users.id, created_at, UNIQUE(document_id, user_id).
- No blob storage in v1; uploads are transient and become document rows.

## Auth and Access Model

- Simple seeded cookie session (no JWT, no OAuth, no passwords): POST /api/v1/auth/login validates seeded user → sets signed httpOnly session cookie (cookie-parser). POST /api/v1/auth/logout clears it. GET /api/v1/auth/me returns current user.
- Backend resolves req.user.id from the session. Never trust client-sent user ids.
- Rule: owner → full access; shared user → read/write; only owner may share/unshare.
- Every document query enforces: WHERE owner_id = current_user OR EXISTS (SELECT 1 FROM document_shares WHERE document_id = documents.id AND user_id = current_user).
- Endpoints (all under /api/v1): POST/POST/GET auth; GET/POST documents; GET/PATCH documents/:id (+ DELETE owner-only); POST documents/import; GET/POST/DELETE documents/:id/shares[/:userId].

## Invariants

1. Authorization is enforced server-side on every document/share route; frontend visibility is not access control.
2. Document content persists as Tiptap JSON via editor.getJSON() and reloads via content: saved.content; never serialize editor HTML for storage.
3. API errors use { error: { code, message } } with DOCUMENT_NOT_FOUND, FORBIDDEN, VALIDATION_ERROR, etc. (scaffold ResponseBuilder must be migrated to this shape; DomainError carries code + status).
4. Title: 1-150 chars after trim, non-empty. Import: extension + MIME + 2 MB + non-empty validated.
5. Versioning: /api/v1 prefix is kept; 404 catch-all returns the spec error shape.
6. No WebSockets, OT/CRDT, comments, version history, DOCX, or RBAC beyond owner/shared in v1.
7. TanStack Query is the client source of truth for remote data; do not duplicate it in component state or a global store.
8. Route state belongs in TanStack Router; document IDs are represented by the editor route parameter.
