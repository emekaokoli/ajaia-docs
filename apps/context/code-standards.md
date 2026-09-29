# Code Standards

## General

- Keep modules small and single-purpose; thin routes, logic in services/.
- Fix root causes, do not layer workarounds.
- Do not mix unrelated concerns in one component or route (one feature unit at a time).
- No Redux/Zustand: TanStack Query owns server state, local React state owns editor/dialog.
- Scaffold layout (modules/ + utils/) is kept; do not reintroduce a parallel middleware/ tree unless session-auth needs it — then put auth.ts there and document it.

## TypeScript

- Strict mode throughout client, server, packages. Server needs a tsconfig.json with @/* path alias (currently missing — add before any other server work).
- No any; use explicit interfaces or narrowly scoped types.
- Validate unknown external input with Zod from @ajaia/schema at system boundaries before trusting it.

## Frontend (React + Vite)

- Default to plain components; add client interactivity state only where needed.
- Editor: Tiptap StarterKit + Underline only; persist editor.getJSON(), reload via content: saved.content.
- Auto-save: debounce typing 700-1000ms → PATCH /api/v1/documents/:id mutation; UI from mutation state (Saving / Saved / Unable to save). Never silently lose edits.
- Title edit: inline input, trim, 1-150 chars, non-empty, PATCH { title }.
- API base URL points at /api/v1.

## Styling

- Use CSS custom property tokens from ui-context.md; no hardcoded hex values.
- Follow the border-radius scale (md inline, lg cards, xl modals).
- shadcn/ui components stay generated; do not edit library internals.

## API Routes

- Order: validate + parse input (Zod) → enforce auth (session → req.user) → enforce ownership/share → run logic.
- Consistent error shape: { error: { code, message } }. DomainError carries code + statusCode; ResponseBuilder.failure must emit the spec shape (migrate from { message, issues }). Map 400 validation, 401/403 authz, 404 missing (including catch-all), 500 unexpected, plus network-failure UX.
- Share rules: reject self-share (400), duplicates (409 or 400), non-owner share/unshare (403), unknown doc/user (404).
- Mount all routers under /api/v1 via modules/setupRoutes.ts; fix the missing @/utils/response import to use responseBuilder.ts.

## Data and Storage

- Metadata in PostgreSQL; content column stores Tiptap JSON.
- Uploads (multer, .txt/.md, 2 MB, ext + MIME + non-empty) become a new document row; no persistent file/blob store in v1.
- Unique constraint UNIQUE(document_id, user_id) on document_shares.

## File Organization

- apps/client/src/pages/ — LoginPage, DocumentsPage, EditorPage.
- apps/client/src/components/ — Editor/, DocumentList/, ShareDialog/, Toolbar/; ui/ is generated.
- apps/client/src/api/ + hooks/ — query client (base /api/v1), document/share hooks.
- apps/server/src/app.ts, server.ts — composition + boot.
- apps/server/src/modules/ — setupRoutes.ts, errorHandler.ts.
- apps/server/src/routes/ — auth.ts, documents.ts, shares.ts (index.ts aggregates).
- apps/server/src/services/ (new) — documentService.ts, shareService.ts.
- apps/server/src/utils/ — error.ts, responseBuilder.ts, logger.ts.
- apps/server/src/middleware/ — session auth.ts goes here if not in utils; otherwise remove folder.
- packages/db/ — knex instance, migrations/, seeds/.
- packages/schema/src/ — zod schemas shared by client and server.
