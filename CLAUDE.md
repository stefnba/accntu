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
├── store.ts                   # Zustand store
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
│   │   └── index.ts           # index
├── components/                # Feature-specific React components
├── api/
│   ├── entity-one.ts          # Client-side API hooks for entity one
│   ├── entity-two.ts          # Client-side API hooks for entity two
│   └── index.ts               # Exports all API hooks
├── schemas/
│   ├── entity-one.ts          # Zod validation schemas for entity one
│   ├── entity-two.ts          # Zod validation schemas for entity two
│   └── index.ts               # Exports all schemas
├── hooks/
│   ├── entity-one.ts          # Feature hooks for entity one
│   ├── entity-two.ts          # Feature hooks for entity two
│   └── index.ts               # Exports all hooks
├── store/
│   ├── entity-one.ts          # Zustand store for entity one
│   ├── entity-two.ts          # Zustand store for entity two
│   └── index.ts               # Exports all hooks
```

### Key Patterns

**Database Schemas:**

- Use CUID2 for primary keys with `createId()`
- Include `userId` for user-scoped data
- Add `createdAt`/`updatedAt` timestamps
- Implement soft deletes with `isActive` boolean
- Embed relations directly in schema files
- **Modern Drizzle**: Column names no longer required - use `text()` instead of `text('column_name')`
- **Table Naming**: Always use singular table names (`label` not `labels`, `user` not `users`)
- **Self-References**: Use `relationName` for hierarchical relationships (e.g., parent/child labels)
- **Critical**: All schemas must be exported from `src/server/db/schemas/index.ts` for relations to work
- **Schema Integration**: Export base Zod schemas (`selectSchema`, `insertSchema`, `updateSchema`) directly from the database schema file using `createSelectSchema()`, `createInsertSchema()`, `createUpdateSchema()`

**API Endpoints:**

- Use Hono framework exclusively (never Next.js server actions)
- **CRITICAL**: Always use method chaining for Hono instantiation: `const app = new Hono().get().post().put()` - never declare `const app = new Hono();` followed by separate method calls
- Use `withRoute` wrapper for error handling
- Use `getUser(c)` for authentication (never userId in URL params)
- Validate inputs with Zod schemas and `zValidator`

**Layered Schema Architecture:**

*Database Layer (`server/db/schemas.ts`):*

- Contains Drizzle table definitions AND base Zod schemas
- Export `selectSchema`, `insertSchema`, `updateSchema` using drizzle-zod
- Single source of truth for database structure and validation

*Feature Schema Layer (`schemas/`):*

- **Query Layer Schemas**: Filtered versions of base schemas for what queries can handle
- **Service Layer Schemas**: Further filtered for what services should expose to external callers
- **Object Grouping**: Use `entityQuerySchemas = { select, insert, update }` pattern
- **Separate Files**: One file per entity for complex features (`entity-name.ts`)
- **Index Exports**: Re-export all schemas through `schemas/index.ts`

*Generic Query Types (`lib/schemas.ts`):*

- Standardized parameter patterns: `TQueryInsertRecord<T>`, `TQueryUpdateRecord<T>`, etc.
- Always include `userId` for security
- Support optional `filters` for flexible querying

**Layered Architecture (Complex Features):**

*Queries Layer (Pure Data Access):*
- Use `withDbQuery` wrapper for all database operations
- Use generic query types combined with feature schemas: `TQueryInsertRecord<EntityQuerySchemas['insert']>`
- Include operation descriptions for debugging
- Always include `userId` filtering for security
- No business logic or validation - return raw data or null
- Simple function names: `create`, `getAll`, `getById`, `update`, `remove`
- Use `db.query.tableName.findMany()` for relational queries with `with` clauses

*Services Layer (Business Logic):*
- Handle user ownership validation
- Use service layer schemas that omit auto-managed fields
- Implement business rules (file size limits, type validation, etc.)
- Orchestrate multiple query operations (cascading updates, counts)
- Complex error handling with meaningful messages
- Descriptive function names: `createTransactionImport`, `getAllImports`

*Endpoints Layer (HTTP Concerns):*
- Use `withRoute` wrapper for error handling: `withRoute(c, async () => { ... })`
- Handle request/response formatting
- Extract user authentication with `getUser(c)`
- Input validation with Zod schemas and `zValidator`
- Delegate business logic to services layer
- **Export Pattern**: Use object exports for queries/services: `export const featureQueries = { getAll, getById, create, update, remove }`

**Client API:**
- **API Client Pattern**: Use `apiClient` from `@/lib/api` with `createQuery` for all API calls
- **Query Structure**: Follow pattern `apiClient.feature.$get` instead of manual fetch calls
- **Query Keys**: Use simple constants like `FEATURE_QUERY_KEYS = { ITEMS: 'items', ITEM: 'item' }`
- **Endpoint Objects**: Export as `useFeatureEndpoints = { getAll: createQuery(...), getById: createQuery(...) }`
- Include JSDoc comments for all functions
- **Complex Features**: Split API hooks into separate files per entity in `api/` directory with `index.ts` for exports
- **Simple Features**: Use single `api.ts` file

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

#### Component Architecture Principles
- **Eliminate Prop Drilling**: Components should fetch their own data using identifiers (IDs) instead of receiving full objects
- **Single Responsibility**: Each component handles its own data needs and state
- **URL State for Persistence**: Use nuqs for modal and filter states that should survive navigation
- **Form Consolidation**: When forms share 80%+ similar logic, consolidate into single component with mode switching
- **Dependency Management**: Be careful with useEffect dependencies - avoid including recreated objects like form instances

### Testing
- Framework: Vitest with Node.js environment
- Always run `bun lint` before commits (must pass)
- Write tests for critical business logic

### File Organization
- **Simple Features**: Use single files (queries.ts, endpoints.ts, schema.ts, api.ts)
- **Complex Features**: Use nested directories when feature has multiple related entities
  - `schemas/` directory with one file per entity (entity-name.ts) and `index.ts` for exports
  - `queries/` directory with one file per entity (entity-name.ts)
  - `services/` directory with one file per entity (entity-name.ts)
  - `endpoints/` directory with one file per entity (entity-name.ts)
  - `api/` directory with one file per entity (entity-name.ts) and `index.ts` for exports
- **Decision Criteria**: Use complex structure when you have 2+ related tables or 200+ lines per file
- **Reference Examples**:
  - Simple: `tag` (single entity), `label` (single entity with hierarchy support)
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

#### nuqs Modal State Pattern
- Use `parseAsBoolean`, `parseAsString`, `parseAsStringLiteral` with `.withDefault()` for robust URL state
- Create modal hooks that return `openModal`, `closeModal`, and state getters
- Enable deep linking and state persistence across page refreshes
- Follow the transaction-import pattern for consistency

**Example Modal Hook:**
```typescript
export const useFeatureModal = () => {
    const [modalOpen, setModalOpen] = useQueryState('featureModal', parseAsBoolean.withDefault(false));
    const [itemId, setItemId] = useQueryState('itemId', parseAsString.withDefault(''));
    
    const openModal = (id?: string) => {
        setItemId(id || '');
        setModalOpen(true);
    };
    
    const closeModal = () => {
        setModalOpen(false);
        setItemId(null);
    };
    
    return { modalOpen, itemId: itemId || null, openModal, closeModal };
};
```

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

## Miscellaneous Notes
- Rule '.cursor/rules' is not present
- **Development Tip**: Don't run bun build at the end