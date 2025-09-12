# Universal Feature Architecture

This document defines the architectural patterns that ALL features must follow in Accntu.

## Feature Structure Patterns

### Simple Features (Single Entity)

```
src/features/[feature-name]/
├── server/
│   ├── db/
│   │   ├── schema.ts          # Database schemas with embedded relations
│   │   └── queries.ts         # Database queries with withDbQuery wrapper
│   └── endpoints.ts           # Hono API endpoints
├── components/                # Feature-specific React components
├── api.ts                     # Client-side API hooks
├── schemas.ts                 # Factory-generated operation schemas
├── store.ts                   # Zustand store (optional)
└── hooks.ts                   # Feature hooks (optional)
```

### Complex Features (Multiple Related Entities)

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
│   │   ├── entity-two.ts      # HTTP handling only
│   │   └── index.ts           # Router index
├── components/                # Feature-specific React components
├── api/
│   ├── entity-one.ts          # Client-side API hooks for entity one
│   ├── entity-two.ts          # Client-side API hooks for entity two
│   └── index.ts               # Exports all API hooks
├── schemas/
│   ├── entity-one.ts          # Factory-generated schemas for entity one
│   ├── entity-two.ts          # Factory-generated schemas for entity two
│   └── index.ts               # Exports all schemas
└── hooks/                     # Feature hooks (optional)
    ├── entity-one.ts
    ├── entity-two.ts
    └── index.ts
```

## Database Schema Requirements

### Standard Schema Pattern

```typescript
// Import tables from other features for foreign keys (NO circular dependency)
import { relatedTable } from '@/features/other-feature/server/db/tables';

export const [featureName] = pgTable('[feature_name]', {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text().notNull(), // Always include for user-scoped data

  // Feature-specific fields
  name: text().notNull(),

  // Foreign keys reference actual table objects
  relatedTableId: text()
    .references(() => relatedTable.id, { onDelete: 'cascade' }),

  // Standard audit fields
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),

  // Soft delete pattern
  isActive: boolean().notNull().default(true),
});

// Embedded relations (no separate relations file)
export const [featureName]Relations = relations([featureName], ({ one, many }) => ({
  relatedTable: one(relatedTable, {
    fields: [[featureName].relatedTableId],
    references: [relatedTable.id],
  }),
}));
```

### Critical Schema Rules

- **CUID2 primary keys** with `createId()`
- **Always include `userId`** for user-scoped data
- **Soft deletes** with `isActive` boolean
- **Timestamps** with timezone for `createdAt`/`updatedAt`
- **Singular table names** (`tag` not `tags`, `user` not `users`)
- **Export schemas** from `src/server/db/tables.ts` for relations to work
- **Modern Drizzle**: Use `text()` instead of `text('column_name')`

### Table Import Architecture

**Feature Table Files** (`src/features/*/server/db/tables.ts`):

- ✅ **CAN import** from other feature table files for foreign keys
- ❌ **CANNOT import** from central `@/server/db` (would cause circular dependency)
- **Example**: `import { transaction } from '@/features/transaction/server/db/tables'`

**Central Export** (`src/server/db/tables.ts`):

- **Exports** all feature tables to central location
- **Only file allowed** to import from feature table files

**All Other Files** (queries, services, schemas, components):

## API Endpoint Patterns

### Hono Framework Rules

```typescript
import { getUser } from '@/lib/auth';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

// CRITICAL: Always use method chaining for Hono instantiation
const app = new Hono()
    .get('/', async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            return await queries.getAll({ userId: user.id });
        })
    )
    .post('/', zValidator('json', CreateSchema), async (c) =>
        withRoute(
            c,
            async () => {
                const user = getUser(c);
                const data = c.req.valid('json');
                return await queries.create({ data: { ...data, userId: user.id } });
            },
            201
        )
    );
```

### Endpoint Requirements

- **Hono framework exclusively** (never Next.js server actions)
- **Method chaining** for app instantiation
- **`withRoute` wrapper** for error handling
- **`getUser(c)` for authentication** (never userId in URL params)
- **`zValidator`** for input validation
- **Proper HTTP status codes** (201 for creation, etc.)

## Factory System Architecture (Recommended)

### Modern Factory-Based Pattern

For new features, use the sophisticated factory system that provides type-safe, consistent patterns:

```typescript
// 1. Schema Definition (schemas.ts)
export const { schemas: tagSchemas } = createFeatureSchemas
    .registerTable(tagTable)
    .omit({ createdAt: true, updatedAt: true, id: true })
    .setUserIdField('userId')
    .setIdFields({ id: true })
    .addCore('create', ({ baseSchema, buildInput }) => ({
        service: buildInput({ data: baseSchema }),
        query: buildInput({ data: baseSchema }),
        endpoint: { json: baseSchema },
    }))
    .addCore('getMany', ({ buildInput }) => ({
        service: buildInput({ filters: filtersSchema }),
        query: buildInput({ filters: filtersSchema }),
        endpoint: { query: filtersSchema },
    }));

// 2. Query Definition (server/db/queries.ts)
export const tagQueries = createFeatureQueries.registerSchema(tagSchemas).addQuery('create', {
    operation: 'create tag',
    fn: async ({ data, userId }) => {
        const [newTag] = await db
            .insert(tagTable)
            .values({ ...data, userId })
            .returning();
        return newTag;
    },
});

// 3. Service Definition (server/services.ts)
export const tagServices = createFeatureServices
    .registerSchema(tagSchemas)
    .registerQuery(tagQueries)
    .defineServices(({ queries }) => ({
        create: async (input) => {
            // Business logic here
            return await queries.create(input);
        },
    }));
```

### Factory System Benefits

- **Full Type Safety**: Automatic TypeScript inference across all layers
- **Consistent Patterns**: Standardized CRUD operations and input helpers
- **Schema Integration**: Seamless flow from database to API with validation
- **Business Logic Separation**: Clear separation between data access and business rules
- **Reduced Boilerplate**: Factory-generated schemas eliminate repetitive code

### When to Use Factory System

- **New Features**: Always use for new feature development
- **Complex Operations**: Multi-entity operations with business logic
- **Type Safety Priority**: When strict TypeScript inference is required
- **Team Consistency**: For standardized patterns across the codebase

## Database Query Patterns (Legacy)

### Query Layer (Pure Data Access)

```typescript
export const getAll = async ({ userId }: { userId: string }) =>
    withDbQuery({
        operation: 'get entities by user ID',
        queryFn: async () => {
            return await db.query.entityTable.findMany({
                where: and(eq(entityTable.userId, userId), eq(entityTable.isActive, true)),
                with: { relatedEntity: true },
                orderBy: (entities, { desc }) => [desc(entities.createdAt)],
            });
        },
    });
```

### Query Requirements

- **`withDbQuery` wrapper** for all database operations
- **Include operation descriptions** for debugging
- **Always filter by `userId`** for security
- **No business logic** - return raw data or null
- **Simple function names**: `create`, `getAll`, `getById`, `update`, `remove`

## Client API Patterns

### API Client Structure

```typescript
export const FEATURE_QUERY_KEYS = {
    ITEMS: 'items',
    ITEM: 'item',
} as const;

export const useFeatureEndpoints = {
    getAll: () => createQuery(apiClient.feature.items.$get, FEATURE_QUERY_KEYS.ITEMS),

    create: () => createMutation(apiClient.feature.items.$post, FEATURE_QUERY_KEYS.ITEMS),
};
```

### Client API Requirements

- **`apiClient` from `@/lib/api`** with `createQuery`/`createMutation`
- **Query keys** for consistent caching
- **JSDoc comments** for all functions
- **Two arguments only** for createMutation (apiMethod, queryKey)

## Authentication & Security

- **Never include `userId` in URL parameters**
- **Always use `getUser(c)`** to extract user from context
- **All user-scoped queries must filter by `userId`**
- **Validate all inputs** with Zod schemas

## Naming Conventions

- **Feature names**: Singular (`tag`, `bank`, `transaction`)
- **Table names**: Singular (`tag` not `tags`)
- **Function names**: Descriptive (`createTransaction`, `getUserTags`)
- **File names**: Lowercase with hyphens for multi-word

## Decision Criteria

**Use Simple Structure when:**

- Single main entity
- Under 200 lines per file
- Basic CRUD operations

**Use Complex Structure when:**

- 2+ related entities
- 200+ lines per file
- Complex business logic

## Code Style Requirements

- **Never add comments** unless explicitly requested
- **Use TypeScript** throughout with proper typing
- **Validate all inputs** with Zod schemas
- **Use early returns** for readability
- **Avoid `as` type assertions**
- **Use consts instead of functions** (`const toggle = () =>`)

## Factory System Documentation

For comprehensive factory system documentation:

- **Schema Factory**: @src/lib/schemas/README.md - Complete guide to schema factory system
- **Query Factory**: @src/server/lib/db/query/README.md - Database query factory patterns
- **Service Factory**: @src/server/lib/service/README.md - Business logic service factory patterns

### Quick Factory Reference

```typescript
// Import factories
import { createFeatureSchemas } from '@/lib/schemas';
import { createFeatureQueries } from '@/server/lib/db';
import { createFeatureServices } from '@/server/lib/service';

// Complete factory pipeline
export const { schemas } = createFeatureSchemas
  .registerTable(table)
  .setUserIdField('userId')
  .addCore('create', ...);

export const queries = createFeatureQueries
  .registerSchema(schemas)
  .addQuery('create', { fn: async () => {...} });

export const services = createFeatureServices
  .registerSchema(schemas)
  .registerQuery(queries)
  .defineServices(({ queries }) => ({ create: async () => {...} }));
```

For detailed architectural guidance, see @docs/claude/ directory.
