# Ajaia Docs — Project Overview

## Overview

Ajaia Docs is a small, polished document product for creating, editing, persisting, and sharing rich-text documents. It targets a reviewer who must complete the full loop in under two minutes: login, view document lists, create a document, format content, auto-save, rename, share with another seeded user, logout, login as recipient, and read/edit the shared document. It is deliberately not a Google Docs clone.

API is versioned under /api/v1 (scaffold mount kept). Auth is a simple seeded cookie session (no JWT, no OAuth).

## Goals

1. Reviewer completes Create → Edit → Save → Share → Reopen end to end without guidance.
2. Formatting and structure survive persistence and refresh via Tiptap JSON.
3. Authorization is enforced server-side, never as a UI convention.
4. Auto-save with clear Saved / Saving / Unable to save states; edits are never silently lost.
5. File import (.txt / .md, 2 MB max) creates an editable document.
6. One meaningful sharing-authorization integration test passes; deployed app verified manually.

## Core User Flow

1. Login as seeded user (Alice or Bob, no registration).
2. Document list shows My Documents and Shared with Me.
3. Create document (+ New document, or Import file).
4. Write + format content (B / I / U / H1 / H2 / bullet / ordered).
5. Auto-save debounced 700-1000ms via PATCH /api/v1/documents/:id.
6. Rename via inline title edit (1-150 chars, trim, non-empty).
7. Share with another seeded user via Share dialog.
8. Logout.
9. Login as recipient.
10. Open shared document from Shared with Me and read/edit.

## Features

### Documents

- Create, rename, reopen documents with Tiptap JSON content.
- My Documents vs Shared with Me lists, visually distinct.
- Auto-save with mutation-state indicator; manual save shortcut if trivial.
- Title inline edit persisted with PATCH { title }.

### Sharing

- Share dialog with seeded-user picker; people-with-access list (Owner / Can edit).
- Prevent self-share, duplicate shares, non-owner sharing with 400/403/404.

### File import

- Import .txt / .md via POST /api/v1/documents/import (multipart/form-data).
- Validate extension, MIME type, size (2 MB), empty files; return created document and open editor.
- Markdown treated as text initially (no reliable parser required).

## Scope

### In Scope

- Seeded login (Alice, Bob), server cookie session.
- Documents CRUD + shares CRUD + import (all under /api/v1).
- Tiptap editor with 7 formats; JSON persistence.
- Zod validation, consistent { error: { code, message } } shape, 404/403/400/500 + network handling.
- One sharing-authorization integration test.
- Deployment + 3-5 min walkthrough video.

### Out of Scope

- Real-time multi-user editing, presence, OT/CRDT, WebSockets.
- Comments, version history, offline editing, document search.
- DOCX import, complex permission roles, enterprise auth (OAuth/password reset, JWT).

## Success Criteria

1. Alice creates, formats, refreshes: formatting remains.
2. Alice shares with Bob; Bob sees, opens, edits from Shared with Me; Charlie (or unshared user) gets 403/404 with the spec error shape.
3. Import of .txt/.md creates and opens an editable document.
4. Save failures show Unable to save and do not lose edits.
5. lint + typecheck + test + build pass; deployed app passes the reviewer journey.
