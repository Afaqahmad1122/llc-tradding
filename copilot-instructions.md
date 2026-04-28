description: Workspace-wide instructions for llc-trading.

# llc-trading Agent Instructions

- Apply these guidelines across backend, frontend, and admin work in this repository.
- Prefer existing repository conventions and architecture over introducing new frameworks or patterns.
- Keep changes minimal and incremental; avoid broad refactors unless the user explicitly asks.
- Use TypeScript in code files when the surrounding project already uses `.ts` / `.tsx`.
- Preserve existing folder organization and naming conventions for routes, controllers, hooks, and components.
- Follow the project's current error handling and validation patterns rather than inventing new ones.
- Use modern, stable APIs and avoid experimental platform features unless the user requests them.
- Ask for clarification before making assumptions about styling, formatting, or architecture changes.

## Backend guidance

- Maintain the backend route/controller structure in `backend/`.
- Reuse existing middleware and helper utilities for auth, validation, and error handling.
- Keep endpoint behavior consistent with current contract expectations.

## Frontend guidance

- Follow the Next.js conventions used in `frontend/` and `admin/`, especially the `app/` directory structure.
- Use framework-native routing, components, and data-fetching patterns already present in the codebase.
- Prefer composable, reusable UI components and avoid one-off hardcoded layouts.
