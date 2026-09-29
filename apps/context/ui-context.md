# UI Context

## Theme

Light, clean document workspace. Minimal chrome so the editor is the focus. Four screens only: Login, Documents list, Editor (+ Share sidebar), Share dialog. No light/dark toggle in v1.

## Colors

All components use these tokens; no hardcoded hex values.

| Role            | CSS Variable     | Value   |
| --------------- | ---------------- | ------- |
| Page background | --bg-base        | #FFFFFF |
| Surface         | --bg-surface     | #F8FAFC |
| Primary text    | --text-primary   | #0F172A |
| Muted text      | --text-muted     | #64748B |
| Primary accent  | --accent-primary | #4F46E5 |
| Border          | --border-default | #E2E8F0 |
| Error           | --state-error    | #DC2626 |
| Success         | --state-success  | #16A34A |

## Typography

| Role      | Font                           | Variable    |
| --------- | ------------------------------ | ----------- |
| UI text   | Inter, system-ui, sans-serif   | --font-sans |
| Code/mono | ui-monospace, Menlo, monospace | --font-mono |

## Border Radius

| Context           | Class      |
| ----------------- | ---------- |
| Inline / small UI | rounded-md |
| Cards / panels    | rounded-lg |
| Modals / overlays | rounded-xl |

## Component Library

Tailwind + shadcn/ui. Generated components live in apps/client/src/components/ui/. Add via the shadcn CLI, never hand-copy library internals. App components: Editor/, DocumentList/, ShareDialog/, Toolbar/.

## Layout Patterns

- Login: centered card, Ajaia Docs title, [ Alice ] [ Bob ] buttons, Sign in. No registration/password reset.
- Documents: header with app name + current user; two sections My Documents / Shared with me; + New document and Import buttons. Render each collection with TanStack Table using Title, Last edited by / Shared by, and Updated columns; distinguish shared rows with a badge. On narrow screens, stack each row's fields without losing actions or labels.
- Editor: top bar (Back to Documents | inline title | Saved/Saving/Unable to save); toolbar [B][I][U][H1][H2][bullet][ordered]; content area; right Share sidebar (Owner / Can edit / Add person).
- Share dialog: centered overlay with backdrop blur; title Share document-name; seeded-user select; Share button; people-with-access list.
- States required everywhere: loading skeletons, empty states, error states with retry, disabled buttons while pending, title truncation, responsive stacking (sidebar below editor on narrow).

## Icons

Lucide React, stroke-based only. h-4 w-4 inline, h-5 w-5 for buttons.

## Client Interaction

- TanStack Router owns navigation for /login, /documents, and /documents/$documentId; use route links and typed route params rather than manual location changes.
- TanStack Query owns loading, error, cache, and mutation state for API data. Keep the existing Saved / Saving / Unable to save editor states.
- TanStack Table supplies the document-list row model. Do not add search, filtering, or sorting controls in v1 unless the product scope changes.
- React Hook Form owns submitted form state for login selection, sharing, title rename, and file import. Use the Zod resolver for schemas available from @ajaia/schema; show field errors and disable submit controls while pending.
