---
description: Backend-specific instructions for Node.js/Express API with Prisma and TypeScript.
applyTo: backend/**
---

# Backend Instructions

## Code Style

- Use TypeScript for all new files in the backend directory.
- Follow existing naming conventions: camelCase for variables/functions, PascalCase for classes/types.
- Use async/await consistently for asynchronous operations.
- Prefer arrow functions for callbacks and short functions.

## Architecture

- Maintain the MVC pattern with controllers, routes, and models.
- Use middleware for cross-cutting concerns like authentication, validation, and error handling.
- Keep business logic in controllers, data access in models.

## Database

- Use Prisma ORM for all database operations.
- Follow the existing schema structure in `prisma/schema.prisma`.
- Use transactions for operations that modify multiple records.

## API Design

- Follow RESTful conventions for endpoints.
- Use consistent response formats with proper HTTP status codes.
- Validate input using existing validation middleware.
- Handle errors gracefully with appropriate error responses.

## Security

- Always validate and sanitize user input.
- Use existing authentication middleware for protected routes.
- Implement proper authorization checks based on user roles.

## Dependencies

- Prefer existing dependencies over adding new ones.
- Use npm/pnpm for package management as established in the project.
