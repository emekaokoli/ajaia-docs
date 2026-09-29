# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Monorepo build setup repaired; server scaffold now compiles.

## Current Goal

- Replace the route stub, then implement Knex migrations/seeds and auth + documents CRUD with server-side authorization.

## Completed

- Root CLAUDE.md paths fixed to apps/context/.
- Populated all 6 apps/context files from assessment spec.
- Created root README.md, ARCHITECTURE.md, AI_WORKFLOW.md, SUBMISSION.md.
- Locked decisions: Knex per spec, signed httpOnly cookie session (no JWT), full reviewer README, Markdown-as-text import.
- Resync round: adopted spec error shape { error: { code, message } }; kept /api/v1 prefix; kept scaffold modules/+utils/ layout; retired JWT/MONGO env direction.
- Reviewed updated server scaffold (app.ts, server.ts, modules/, routes/index stub, utils/, empty middleware/).
- Added package-local TypeScript configs/dependencies and recursive build/dev wiring; aligned DB dependencies with Knex; added the server alias config and corrected its missing 404 helper import.

## In Progress

- Monorepo build configuration.

## Next Up

1. Replace routes/index.ts stub with real routers under /api/v1.
2. Add remaining backend dependencies (cookie-parser, multer, test runner); move .env to server root and use DATABASE_URL + SESSION_SECRET.
3. packages/db Knex migrations + seeds (users, documents, document_shares); session-auth middleware resolving seeded Alice/Bob.
4. Auth + documents CRUD with authz predicate; sharing; import; Zod validation.
5. Sharing-authorization integration test (Alice creates, shares Bob, Bob reads, Charlie blocked).
6. Deploy and verify reviewer journey on deployed app.

## Open Questions

- Postgres host/connection for local dev and deployment target (fastest reliable platform TBD).
- Deploy URLs and VIDEO_URL.txt content pending.
- middleware/ folder: keep for session auth.ts or delete if auth lives in utils — decide at implementation.
- Markdown import: confirmed simpler treat-as-text unless a reliable parser is already known.

## Architecture Decisions

- Knex over scaffold drizzle-orm: spec mandates Knex and gives direct control of authz queries; scaffold drizzle dep in apps/server is the wrong (blockchain) package and must go.
- Seeded Alice/Bob + plain cookie session over JWT: JWT_*/MONGO_URI env retired; auth infra is not the core requirement while server still enforces req.user.id.
- Spec error shape over scaffold { message, issues }: reviewer contract wins; migrate ResponseBuilder + DomainError (add code).
- Keep /api/v1 prefix over spec /api: scaffold mount wins; all specs and README updated to /api/v1.
- Keep scaffold modules/+utils/ layout over spec services/+middleware/ tree: map services/ as new subdir, middleware/ holds session auth or is removed.
- Tiptap JSON as persisted content over HTML: formatting/structure must survive reloads.
- TanStack Query only, no Redux/Zustand: server state vs local editor/dialog state is sufficient.
- Cut realtime/OT, comments, versions, DOCX, search, RBAC: protect core-loop reliability in the timebox.

## Session Notes

- Scaffold gaps blocking compile: no tsconfig (alias @/), setupRoutes imports missing @/utils/response, routes/index.ts is a noop stub, server .env mislocated at src/.env.
- Client still default Vite template missing Tiptap/Tailwind/shadcn/Query deps; packages/db and packages/schema/src empty.
- Next session: server compile fix + deps + Knex scaffold.
