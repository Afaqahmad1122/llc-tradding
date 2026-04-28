---
description: Frontend-specific instructions for Next.js React applications with TypeScript.
applyTo: frontend/**, admin/**
---

# Frontend Instructions

## Code Style

- Use TypeScript for all React components and utilities.
- Follow existing naming conventions: PascalCase for components, camelCase for variables/functions.
- Use functional components with hooks over class components.
- Prefer const over let, and let over var.

## React Patterns

- Use custom hooks for reusable logic (follow existing hooks in `hooks/`).
- Implement proper state management with existing patterns (stores, context).
- Use server components where appropriate in Next.js app directory.
- Follow component composition over inheritance.

## Styling

- Use existing UI component library and styling approach.
- Maintain consistent design system and component variants.
- Prefer CSS-in-JS or utility classes as established in the project.

## Data Fetching

- Use Next.js data fetching methods (server components, API routes).
- Implement proper loading states and error handling.
- Cache data appropriately to avoid unnecessary requests.

## Performance

- Optimize images and assets using Next.js built-in features.
- Implement code splitting and lazy loading where beneficial.
- Use React.memo and useMemo for expensive computations.

## Accessibility

- Follow WCAG guidelines for accessible components.
- Use semantic HTML elements appropriately.
- Ensure keyboard navigation and screen reader support.

## Dependencies

- Prefer existing dependencies over adding new ones.
- Use pnpm for package management as established in the project.
