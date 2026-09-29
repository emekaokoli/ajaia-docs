# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Server boots with session auth; DB package built but migrations unapplied (no working DATABASE_URL yet).

## Current Goal

- Get a working DATABASE_URL, run migrate + seed, then implement documents/shares/import routes and the sharing-auth test.

## Completed

- Root CLAUDE.md paths fixed to apps/context/.
- Populated all 6 apps/context files from assessment spec.
- Created root README.md, ARCHITECTURE.md, AI_WORKFLOW.md, SUBMISSION.md.
- Locked decisions: Knex per spec, signed httpOnly cookie session (no JWT), full reviewer README, Markdown-as-text import.
- Resync round: adopted spec error shape { error: { code, message } }; kept /api/v1 prefix; kept scaffold modules/+utils/ layout; retired JWT/MONGO env direction.
- Reviewed updated server scaffold.
- Server compile fix round: tsconfig.json (@/* paths), spec error shape migration, setupRoutes fix, real router structure, dep swap, .env move; typecheck + build + boot verified.
- @ajaia/schema: Zod schemas (login, create/update document, share, params, tiptap doc, title rules) + SEED_USERS + import constants; runtime-verified (parse accepts/rejects correctly).
- @ajaia/db: unified env on DATABASE_URL/DATABASE_TEST_URL, fixed knexfile dirs (src/migrations, src/seeds) + test seeds typo, 3 migrations (users, documents, document_shares with UNIQUE), user seeds from SEED_USERS; typecheck + build pass.
- Session auth: middleware/auth.ts (loadUser + requireAuth + Request.user typing), cookie-parser wired in app.ts, real auth routes (login/logout/me); verified live: me 401 no-cookie, login 400 bad body, catch-all 404 — all in spec error shape.

## In Progress

- Blocked on DB credentials for migrate/seed/run verification.

## Next Up

1. Obtain working DATABASE_URL (local PG is up on 5432 but postgres/postgres and guesses fail) → run migrate:latest + seed:run, verify login as Alice sets cookie and me returns user.
2. services/ + documents CRUD with authz predicate → shares → import (multer) with Zod validation.
3. Sharing-authorization integration test (vitest + supertest; allow esbuild build script).
4. Client: Tiptap editor + lists + share dialog + autosave; then deploy + reviewer journey.

## Open Questions

- DATABASE_URL needed: PG up at localhost:5432, password unknown. Tried postgres/postgres, no-password, ajaia/ajaia — all fail. Ask owner for the connection string.
- Deployment target, deploy URLs, VIDEO_URL.txt pending.
- middleware/ kept for session auth.ts (decision made at implementation).
- Markdown import: treat-as-text.

## Architecture Decisions

- Knex over scaffold drizzle-orm: wrong (blockchain) package removed.
- Seeded Alice/Bob + plain cookie session over JWT: JWT_*/MONGO_URI retired.
- Spec error shape over scaffold { message, issues }: migrated; verified live.
- Keep /api/v1 prefix and scaffold modules/+utils/ layout.
- tsconfig-paths + tsc-alias for @/* alias; dropped deprecated baseUrl (TS6); added @types/express v5.
- CJS unification: @ajaia/db and @ajaia/schema switched from type:module to commonjs after require(ESM) named-export crash on knex import; server stays CJS. Client (Vite) unaffected.
- Fixed UUID seeds shared via @ajaia/schema SEED_USERS so sessions/tests are stable.
- timestamp(useTz) over timestamptz + positional index names for Knex 3 types.
- Tiptap JSON persisted; TanStack Query only; cuts stand (no realtime/comments/versions/DOCX/search/RBAC).

## Session Notes

- File tools (read/write/edit/glob) throw Bun is not defined; all file ops via PowerShell with BOM-free UTF8 writes (pnpm rejects BOM in package.json).
- PG reachable at localhost:5432 but unauthenticated; migrate/seed/login-happy-path unverified pending creds.
- Next session: DB creds → migrate/seed → documents/shares/import → test → client.