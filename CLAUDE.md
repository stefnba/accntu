# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Accntu is a modern personal finance management application built with Next.js 15, TypeScript, and PostgreSQL. It follows a strict feature-based architecture with consistent patterns across all features.

## Development Commands

### Core Development
- `bun dev` - Start development server
- `bun build` - Build production application
- `bun start` - Start production server
- `bun test` - Run Vitest tests
- `bun lint` - Run ESLint (must pass before commits)

### Database Operations
- `bun db:push` - Push schema changes to database
- `bun db:studio` - Open Drizzle Studio for database management
- `bun db:generate` - Generate database migrations
- `bun db:migrate` - Run database migrations
- `bun db:seed` - Seed database with initial data
- `bun db:reset` - Reset database completely

### Docker
- `docker-compose up -d db` - Start PostgreSQL database
- `docker-compose build` - Build Docker image
- `docker-compose up -d` - Start all services

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Drizzle ORM
- **API**: Hono framework (not Next.js server actions)
- **UI**: shadcn/ui components with Tailwind CSS 4
- **State**: Zustand (global), nuqs (URL), TanStack Query (server)
- **Auth**: Better Auth with social providers
- **Package Manager**: Bun

## Architecture

### Feature-Based Structure
Every feature follows this exact pattern:

**Simple Features:**
```
src/features/[feature-name]/
├── server/
│   ├── db/
│   │   ├── schema.ts          # Database schemas with embedded relations
│   │   └── queries.ts         # Database queries
│   └── endpoints.ts           # Hono API endpoints
├── components/                # Feature-specific React components
├── api.ts                     # Client-side API hooks
├── schemas.ts                 # Zod validation schemas
└── hooks.ts                   # Feature hooks
```

**Complex Features (Multiple Related Entities):**
```
src/features/[feature-name]/
├── server/
│   ├── db/
│   │   ├── queries/
│   │   │   ├── entity-one.ts  # Pure data access queries
│   │   │   └── entity-two.ts  # Pure data access queries
│   │   ├── services/
│   │   │   ├── entity-one.ts  # Business logic & validation
│   │   │   └── entity-two.ts  # Business logic & validation
│   │   └── schema.ts          # Database schemas with relations
│   ├── endpoints/
│   │   ├── entity-one.ts      # HTTP handling only
│   │   └── entity-two.ts      # HTTP handling only
│   └── endpoints.ts           # Main router
├── components/                # Feature-specific React components
├── api.ts                     # Client-side API hooks
├── schemas.ts                 # Zod validation schemas
└── hooks.ts                   # Feature hooks
```

### Key Patterns

**Database Schemas:**
- Use CUID2 for primary keys with `createId()`
- Include `userId` for user-scoped data
- Add `createdAt`/`updatedAt` timestamps
- Implement soft deletes with `isActive` boolean
- Embed relations directly in schema files
- **Modern Drizzle**: Column names no longer required - use `text()` instead of `text('column_name')`
- **Critical**: All schemas must be exported from `src/server/db/schemas/index.ts` for relations to work

**API Endpoints:**
- Use Hono framework exclusively (never Next.js server actions)
- Use `withRoute` wrapper for error handling
- Use `getUser(c)` for authentication (never userId in URL params)
- Validate inputs with Zod schemas and `zValidator`

**Layered Architecture (Complex Features):**

*Queries Layer (Pure Data Access):*
- Use `withDbQuery` wrapper for all database operations
- Use destructured object parameters
- Include operation descriptions for debugging
- No business logic or validation - return raw data or null
- Simple function names: `create`, `getAll`, `getById`, `update`, `remove`
- Use `db.query.tableName.findMany()` for relational queries with `with` clauses

*Services Layer (Business Logic):*
- Handle user ownership validation
- Implement business rules (file size limits, type validation, etc.)
- Orchestrate multiple query operations (cascading updates, counts)
- Complex error handling with meaningful messages
- Descriptive function names: `createTransactionImport`, `getAllImports`

*Endpoints Layer (HTTP Concerns):*
- Use `withRoute` wrapper for error handling
- Handle request/response formatting
- Extract user authentication with `getUser(c)`
- Input validation with Zod schemas and `zValidator`
- Delegate business logic to services layer

**Client API:**
- Use `createQuery` for GET operations
- Use `createMutation` for POST/PUT/DELETE operations
- Define query keys for cache management
- Include JSDoc comments for all functions

### Authentication
- Never include `userId` in URL parameters
- Always use `getUser(c)` to extract user from context
- All user-scoped queries must filter by `userId`

### Code Style Requirements
- **Never add comments** unless explicitly requested
- Follow existing code conventions and patterns
- Use TypeScript throughout with proper typing
- Validate all inputs with Zod schemas
- Use consistent naming: singular feature names, descriptive functions
- Write concise, technical code with accurate examples
- Favor iteration and modularization over code duplication
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`)
- Avoid using `as` type assertion for TypeScript
- Use early returns whenever possible to make code more readable
- Use consts instead of functions (e.g., `const toggle = () =>`)
- Define types when possible for all functions and variables

### Testing
- Framework: Vitest with Node.js environment
- Always run `bun lint` before commits (must pass)
- Write tests for critical business logic

### File Organization
- **Simple Features**: Use single files (queries.ts, endpoints.ts, schema.ts)
- **Complex Features**: Use nested directories when feature has multiple related entities
  - `queries/` directory with one file per entity (entity-name.ts)
  - `services/` directory with one file per entity (entity-name.ts)  
  - `endpoints/` directory with one file per entity (entity-name.ts)
- **Decision Criteria**: Use complex structure when you have 2+ related tables or 200+ lines per file
- **Reference Examples**: 
  - Simple: `tag` (single entity), `label` (single entity)
  - Complex: `bank` (4 related entities), `transaction-import` (2 related entities)

## Form Development

### Form System
- Use the custom form system built on React Hook Form and Zod
- Import from `@/components/form` for all form components
- Use `createFormSchema` to define type-safe form schemas with default values
- Use `useForm` hook for form handling with built-in validation

```typescript
const formSchema = createFormSchema(
  z.object({ email: z.string().email() }),
  { email: "" }
);

const form = useForm({
  ...formSchema,
  onSubmit: async (data) => {
    // Handle submission
  },
});
```

### Available Form Components
- `Form` - Form provider
- `FormInput` - Text input
- `FormSelect` - Select dropdown
- `FormCheckbox` - Checkbox input
- `FormRadioGroup` - Radio button group
- `FormSwitch` - Toggle switch
- `FormTextarea` - Multiline text input
- `FormOTPInput` - OTP input
- `FormSubmitButton` - Submit button with loading states

## UI Development

### Styling Guidelines
- Always use Tailwind classes for styling HTML elements; avoid CSS
- Use shadcn/ui components as the foundation for all UI elements
- Use the `cn` utility for class merging
- Implement accessibility features on elements (tabindex, aria-label, etc.)
- Event functions should be named with "handle" prefix (e.g., `handleClick`)

### State Management
- **React Query/TanStack Query**: Server state management
- **Zustand**: Global client state (feature-based stores in `features/[feature]/stores/`)
- **nuqs**: URL-based search params state (modals, filters, sorting)

## Error Handling

### Backend Error Handling
- Use `withRoute` wrapper for all API endpoints
- Use `withDbQuery` wrapper for all database operations
- Include operation descriptions for debugging
- Chain errors when appropriate for better debugging

### Frontend Error Handling
- Use error handling utilities from `@/lib/error`
- Implement proper error boundaries
- Show appropriate error messages to users
- Handle loading states consistently

## Important Notes

- This project uses Bun as package manager (not npm/yarn)
- API layer uses Hono framework exclusively (never Next.js server actions)
- Database operations must use Drizzle ORM with proper error handling
- All features must follow the exact architectural patterns
- Authentication is session-based with Better Auth
- UI components are from shadcn/ui (New York variant)
- Minimize use of `'use client'`, `useEffect`, and `setState`; favor React Server Components
- Always implement proper TypeScript typing throughout
- Include JSDoc comments for functions to improve IDE intellisense