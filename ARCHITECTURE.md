# Architecture

## Overview

React/Vite frontend communicating with a TypeScript/Express API backed by PostgreSQL. API is versioned under /api/v1.

## Frontend

- React 19 + TypeScript + Vite in apps/client.
- Tiptap (StarterKit + Underline) for bold, italic, underline, H1, H2, bullet and ordered lists.
- TanStack Query for server state and auto-save mutations (base URL /api/v1); local React state for editor/dialog.
- Zod schemas shared from @ajaia/schema; Tailwind + shadcn/ui + Lucide icons.

Tiptap JSON is the persisted document representation (editor.getJSON() on save, content: saved.content on load) so formatting and document structure survive reloads.

## Backend

Express provides REST endpoints for authentication, documents, file import and sharing. Scaffold layout is kept: app.ts (composition) + server.ts (boot), modules/setupRoutes.ts (mounts /healthcheck, /api/v1 router, 404 catch-all), modules/errorHandler.ts, routes/auth.ts + documents.ts + shares.ts, new services/documentService.ts + shareService.ts, utils/error.ts + responseBuilder.ts + logger.ts, plus helmet/cors/rate-limit/pino hardening.

Authorization is enforced server-side based on the authenticated user and document ownership/share records: WHERE owner_id = current_user OR EXISTS (SELECT 1 FROM document_shares WHERE document_id = documents.id AND user_id = current_user). Owner has full access including share/unshare and delete; shared users have read/write. Auth is a simple seeded cookie session (no JWT); the server resolves req.user.id from the session cookie.

Errors use { error: { code, message } } (DomainError carries code + status), including the catch-all 404.

## Persistence

PostgreSQL stores users, documents and document shares (packages/db with Knex migrations/seeds):

- users(id, email, name, created_at) — seeds alice@ajaia.test, bob@ajaia.test.
- documents(id, owner_id, title, content JSON, created_at, updated_at).
- document_shares(id, document_id, user_id, created_at, UNIQUE(document_id, user_id)).

## Sharing

Documents have one owner and may have multiple explicitly shared users. Shared users can edit in this implementation. Only the owner can add/remove shares; self-shares and duplicates are rejected.

## File import

POST /api/v1/documents/import accepts multipart .txt/.md (2 MB max, extension + MIME + non-empty validated). Content becomes a new editable document; Markdown is treated as text in v1.

## Tradeoffs

I chose seeded users + plain cookie session rather than the scaffold JWT/MONGO direction or full registration/password recovery/OAuth because authentication infrastructure was not the core product requirement, while server-side enforcement of req.user.id still demonstrates real access control.

I chose Tiptap rather than building a contenteditable editor because rich-text behavior, selection handling and document structure are difficult to implement reliably within the timebox.

I chose PostgreSQL + Knex because document ownership and sharing relationships benefit from relational constraints and straightforward authorization queries. I kept the scaffold /api/v1 prefix and modules/+utils/ layout to avoid churning existing server code.

Scaffold gaps being fixed: missing server tsconfig (@/* paths), setupRoutes import of missing @/utils/response (migrated to responseBuilder with spec error shape), routes/index.ts stub, and dep swap (remove wrong drizzle/nodejs; add knex, dotenv, cookie-parser, multer, test runner).
