# AI Workflow

I used AI tools primarily as an implementation accelerator and review aid.

## Where AI helped

- Initial project scaffolding.
- Generating repetitive TypeScript/API boilerplate.
- Drafting database migrations.
- Exploring Tiptap configuration.
- Generating initial validation schemas.
- Reviewing API edge cases.
- Creating test cases.
- Reviewing error handling and type issues.

## Where I retained ownership

I made the product scope, architecture, data model, authorization model and implementation tradeoffs.

I reviewed generated code before integrating it and changed or rejected output when it did not fit the application architecture or requirements.

## Examples of rejected/changed output

AI-generated implementations tended to introduce unnecessary abstractions or overcomplicate authentication and document state management. I simplified those implementations to keep the application aligned with the assessment timebox (TanStack Query + local state instead of global stores; thin routes + services instead of deep layers).

I also verified authorization behavior independently (sharing test: Alice creates, shares with Bob, Bob reads, Charlie is blocked) rather than assuming frontend visibility rules were sufficient.

## Verification

I used TypeScript compilation, linting, automated tests and manual end-to-end testing against the deployed application.

The final verification flow covered document creation, rich-text persistence, refresh/reopen behavior, file import, sharing and access control.
