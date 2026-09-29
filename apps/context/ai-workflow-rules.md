# AI Workflow Rules

## Approach

Build incrementally with a spec-driven workflow. apps/context/ defines what to build, how to build it, and current progress. Always implement against these specs; do not infer or invent behavior from scratch.

## Scoping Rules

- Work on one feature unit at a time.
- Prefer small, verifiable increments over large speculative changes.
- Do not combine unrelated system boundaries in a single implementation step.

## When to Split Work

Split an implementation step if it combines:

- UI changes and background/API changes.
- Multiple unrelated API routes (e.g. documents CRUD + shares + import in one step).
- Behavior not clearly defined in the context files.

If a change cannot be verified end to end quickly, the scope is too broad — split it.

Suggested build order: scaffold + migrations/seeds → auth + docs CRUD + authz → editor + autosave + rename → sharing → import → validation + sharing-auth test → deploy → polish → docs/video.

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files.
- If a requirement is ambiguous, resolve it in the relevant context file before implementing.
- If a requirement is missing, add it as an open question in apps/context/progress-tracker.md before continuing.

## Protected Files

Do not modify the following unless explicitly instructed:

- apps/client/src/components/ui/* — generated shadcn/ui components.
- Any third-party library internals or node_modules.
- Applied migrations (create a new migration instead).

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- System architecture or boundaries → architecture.md.
- Storage model decisions → architecture.md.
- Code conventions or standards → code-standards.md.
- Feature scope → project-overview.md.
- UI language or layout → ui-context.md.

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope.
2. No invariant defined in architecture.md was violated.
3. apps/context/progress-tracker.md reflects the completed work.
4. lint, typecheck, test, and build pass (pnpm --r run build at minimum).
