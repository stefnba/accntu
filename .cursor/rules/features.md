# Feature Architecture Rules

This project follows a strict feature-based architecture with consistent patterns across all features. Each feature is self-contained with its own database schemas, API endpoints, business logic, and client-side code.

## Feature Structure

Every feature must follow this exact directory structure:

```
src/features/[feature-name]/
├── server/
│   ├── db/
│   │   ├── schema.ts          # Database schemas with embedded relations
│   │   └── queries/           # Directory with separate query files OR queries.ts file
│   │       ├── index.ts       # Re-exports with namespacing (if using directory)
│   │       ├── entity-1.ts    # Specific entity queries
│   │       └── entity-2.ts    # Specific entity queries
│   ├── endpoints.ts           # Hono API endpoints
│   └── [optional-services].ts # Additional server-side services
├── lib/
│   └── utils.ts               # Feature-specific utility functions
├── components/                # Feature-specific React components
├── api.ts                     # Client-side API hooks OR api/ directory
├── schemas.ts                 # Shared Zod validation schemas OR schemas/ directory
└── hooks.ts                   # Feature hooks OR hooks/ directory
```

### File vs Directory Structure Pattern

For most features, use **single files** for:

- `queries.ts` - All database queries in one file
- `api.ts` - All client-side API hooks
- `schemas.ts` - All validation schemas
- `hooks.ts` - All feature hooks
- `utils.ts` - All utility functions

Only create **directories** when files become too complex (>200-300 lines):

- `queries/` - Split by entity type (e.g., `global-bank.ts`, `connected-bank.ts`)
- `api/` - Split by domain area or entity
- `schemas/` - Split by validation groups
- `hooks/` - Split by functionality groups

## Naming Conventions

### Feature Names

- Use **singular** feature names (e.g., `tag`, `bank`, `transaction`, not `tags`, `banks`, `transactions`)
- Use lowercase with hyphens for multi-word features (e.g., `bank-account`)

### Database Tables

- Use **singular** table names (e.g., `tag`, `bank`, `transaction`)
- Follow the pattern: `[feature-name]` for main tables
- Use descriptive names for junction/relation tables (e.g., `tagToTransaction`, `connectedBank`)

### File Names

- Use singular feature names in directory structure
- Use descriptive file names that indicate their purpose

## Database Schema Patterns

### Schema Organization

```typescript
// src/features/[feature]/server/db/schema.ts
import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// Main entity table
export const [featureName] = pgTable('[feature_name]', {
  id: text().primaryKey().notNull().$defaultFn(() => createId()),
  userId: text().notNull(), // Always include userId for user-scoped data

  // Feature-specific fields
  name: text().notNull(),
  description: text(),

  // Standard audit fields
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),

  // Soft delete pattern
  isActive: boolean().notNull().default(true), // or isDeleted: boolean().notNull().default(false)
});

// Embedded relations (no separate relations file)
export const [featureName]Relations = relations([featureName], ({ one, many }) => ({
  // Define relations here
}));

// Export types
export type [FeatureName] = typeof [featureName].$inferSelect;
export type New[FeatureName] = typeof [featureName].$inferInsert;
```

### Key Schema Patterns

1. **Always use CUID2** for primary keys with `createId()`
2. **Include userId** for user-scoped data
3. **Use timestamp fields** for `createdAt` and `updatedAt`
4. **Implement soft deletes** with `isActive` or `isDeleted` boolean fields
5. **Embed relations** directly in schema files (no separate relations files)
6. **Export TypeScript types** for both select and insert operations

## Database Queries Pattern

### Single File Pattern (Simple Features)

```typescript
// src/features/[feature]/server/db/queries.ts
import { db } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { [featureName], type [FeatureName], type New[FeatureName] } from './schema';

// CRUD Operations with withDbQuery wrapper
export const create[FeatureName] = async ({ data }: { data: New[FeatureName] }): Promise<[FeatureName]> =>
  withDbQuery({
    operation: 'create [feature-name]',
    queryFn: async () => {
      const [result] = await db.insert([featureName]).values(data).returning();
      return result;
    },
  });

export const get[FeatureName]sByUserId = async ({ userId }: { userId: string }): Promise<[FeatureName][]> =>
  withDbQuery({
    operation: 'get [feature-name]s by user ID',
    queryFn: async () => {
      return await db
        .select()
        .from([featureName])
        .where(and(eq([featureName].userId, userId), eq([featureName].isActive, true)))
        .orderBy([featureName].name);
    },
  });
```

### Directory Pattern (Complex Features)

```typescript
// src/features/[feature]/server/db/queries/index.ts
// Namespaced exports for better organization
import { entityQueries } from './entity';
import { relatedEntityQueries } from './related-entity';

// Clean namespaced exports
export const Entity = entityQueries;
export const RelatedEntity = relatedEntityQueries;

// Direct exports for convenience
export * from './entity';
export * from './related-entity';
```

```typescript
// src/features/[feature]/server/db/queries/entity.ts
import { withDbQuery } from '@/server/lib/handler';
import { and, eq } from 'drizzle-orm';
import { db } from '../../../../../../server/db';
import { entity, type Entity } from '../schema';

/**
 * Get all entities
 * @returns All entities
 */
export const getAll = async (): Promise<Entity[]> =>
    withDbQuery({
        operation: 'get all entities',
        queryFn: async () => {
            return await db.select().from(entity).where(eq(entity.isActive, true));
        },
    });

/**
 * Get entity by id
 * @param id - The id of the entity
 * @returns The entity
 */
export const getById = async ({ id }: { id: string }): Promise<Entity | null> =>
    withDbQuery({
        operation: 'get entity by ID',
        queryFn: async () => {
            const [result] = await db.select().from(entity).where(eq(entity.id, id)).limit(1);
            return result || null;
        },
    });

/**
 * Create entity
 * @param data - The data to create
 * @returns The created entity
 */
export const create = async ({ data }: { data: TInsertEntity }): Promise<Entity> =>
    withDbQuery({
        operation: 'create entity',
        queryFn: async () => {
            const result = await db.insert(entity).values(data).returning();
            return result[0];
        },
    });

/**
 * Update entity
 * @param id - The id of the entity
 * @param data - The data to update
 * @returns The updated entity
 */
export const update = async ({
    id,
    data,
}: {
    id: string;
    data: Partial<TInsertEntity>;
}): Promise<Entity | null> =>
    withDbQuery({
        operation: 'update entity',
        queryFn: async () => {
            const result = await db
                .update(entity)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(entity.id, id))
                .returning();
            return result[0] || null;
        },
    });

/**
 * Soft delete entity
 * @param id - The id of the entity
 */
export const softDelete = async ({ id }: { id: string }): Promise<void> =>
    withDbQuery({
        operation: 'soft delete entity',
        queryFn: async () => {
            await db
                .update(entity)
                .set({ isActive: false, updatedAt: new Date() })
                .where(eq(entity.id, id));
        },
    });
```

### Query Function Naming Conventions

**Standard CRUD Functions:**

- `getAll()` - Get all records with active filter
- `getById({ id })` - Get single record by ID
- `create({ data })` - Create new record
- `update({ id, data })` - Update existing record
- `softDelete({ id })` - Soft delete record

**Context-Specific Functions:**

- `getByUserId({ userId })` - Get records by user
- `getByParentId({ parentId })` - Get child records
- `getByCountry({ country })` - Get records by specific field
- `search({ query, filters })` - Search functionality

**Usage Patterns:**

```typescript
// Namespaced usage (recommended for complex features)
import { GlobalBank, ConnectedBank } from '@/features/bank/server/db/queries';

const banks = await GlobalBank.getAll();
const bankById = await GlobalBank.getById({ id });
const banksByCountry = await GlobalBank.getByCountry({ country: 'US' });

const userBanks = await ConnectedBank.getByUserId({ userId });
const newBank = await ConnectedBank.create({ data });

// Direct usage (fine for simple features)
import { getAllTags, getTagById, createTag } from '@/features/tag/server/db/queries';

const tags = await getAllTags();
const tag = await getTagById({ id });
const newTag = await createTag({ data });
```

### Query Patterns

1. **Use withDbQuery wrapper** for all database operations for consistent error handling
2. **Use destructured object parameters** instead of positional parameters
3. **Always return typed results** using the exported types
4. **Use soft deletes** by updating `isActive` or `isDeleted` fields
5. **Include userId filtering** for user-scoped queries
6. **Update timestamps** on all update operations
7. **Include operation description** for debugging and logging
8. **Order results consistently** (usually by name or createdAt)
9. **Use concise function names** - namespace provides entity context
10. **Export namespaced functions** for complex features with multiple entities

## API Endpoints Pattern

### Endpoint Organization

```typescript
// src/features/[feature]/server/endpoints.ts
import { getUser } from '@/lib/auth';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';
import { z } from 'zod';
import * as queries from './db/queries';

// Create Hono app
const app = new Hono();

// Validation schemas
const Create[FeatureName]Schema = z.object({
  name: z.string().min(1, '[FeatureName] name is required').max(100),
  description: z.string().optional(),
});

const Update[FeatureName]Schema = Create[FeatureName]Schema.partial();

// CRUD endpoints - Use getUser(c) for authentication, not URL parameters
app.get('/[feature-name]s', async (c) =>
  withRoute(c, async () => {
    const user = getUser(c);
    return await queries.get[FeatureName]sByUserId({ userId: user.id });
  })
);

app.get('/[feature-name]s/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
  withRoute(c, async () => {
    const { id } = c.req.valid('param');
    const result = await queries.get[FeatureName]ById({ id });

    if (!result) {
      throw new Error('[FeatureName] not found');
    }

    return result;
  })
);

app.post('/[feature-name]s', zValidator('json', Create[FeatureName]Schema), async (c) =>
  withRoute(
    c,
    async () => {
      const user = getUser(c);
      const data = c.req.valid('json');
      return await queries.create[FeatureName]({ data: { ...data, userId: user.id } });
    },
    201
  )
);

app.put('/[feature-name]s/:id', zValidator('param', z.object({ id: z.string() })), zValidator('json', Update[FeatureName]Schema), async (c) =>
  withRoute(c, async () => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');

    const updated = await queries.update[FeatureName]({ id, data });

    if (!updated) {
      throw new Error('[FeatureName] not found');
    }

    return updated;
  })
);

app.delete('/[feature-name]s/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
  withRoute(c, async () => {
    const { id } = c.req.valid('param');
    await queries.delete[FeatureName]({ id });
    return { success: true };
  })
);

export default app;
```

### Endpoint Patterns

1. **Use Hono framework** for all API endpoints (never Next.js server actions)
2. **Use withRoute wrapper** for consistent error handling
3. **Use getUser(c) for authentication** - Never include userId in URL parameters
4. **Validate all inputs** with Zod schemas and zValidator
5. **Follow RESTful conventions** for endpoint naming
6. **Return appropriate HTTP status codes** (201 for creation, 200 for updates, etc.)
7. **Handle not found cases** with proper error messages
8. **Use consistent response formats** (success objects for deletions)
9. **Extract user from context**, not from URL parameters

## Client API Pattern

### API Client Organization

```typescript
// src/features/[feature]/api.ts
import { apiClient, createMutation, createQuery } from '@/lib/api';

export const [FEATURE_NAME]_QUERY_KEYS = {
  [FEATURE_NAME]S: () => ['[feature-name]s'] as const,
  [FEATURE_NAME]: (id: string) => ['[feature-name]', id] as const,
  // Add more specific query keys as needed
} as const;

export const use[FeatureName]Endpoints = {
  /**
   * Get all [feature-name]s for the authenticated user
   */
  get[FeatureName]s: () =>
    createQuery(
      apiClient.[featureName]['[feature-name]s'].$get,
      [FEATURE_NAME]_QUERY_KEYS.[FEATURE_NAME]S()
    ),

  /**
   * Get [feature-name] by ID
   */
  get[FeatureName]: (id: string) =>
    createQuery(
      apiClient.[featureName]['[feature-name]s'][':id'].$get,
      [FEATURE_NAME]_QUERY_KEYS.[FEATURE_NAME](id)
    ),

  /**
   * Create a new [feature-name]
   */
  create[FeatureName]: () =>
    createMutation(
      apiClient.[featureName]['[feature-name]s'].$post,
      [FEATURE_NAME]_QUERY_KEYS.[FEATURE_NAME]S()
    ),

  /**
   * Update a [feature-name]
   */
  update[FeatureName]: (id: string) =>
    createMutation(
      apiClient.[featureName]['[feature-name]s'][':id'].$put,
      [FEATURE_NAME]_QUERY_KEYS.[FEATURE_NAME](id)
    ),

  /**
   * Delete a [feature-name]
   */
  delete[FeatureName]: (id: string) =>
    createMutation(
      apiClient.[featureName]['[feature-name]s'][':id'].$delete,
      [FEATURE_NAME]_QUERY_KEYS.[FEATURE_NAME](id)
    ),
};
```

### API Client Patterns

1. **Define query keys** for consistent caching and invalidation
2. **Use descriptive function names** that match the backend operations
3. **Include JSDoc comments** for all exported functions
4. **Use createQuery for GET operations** and createMutation for POST/PUT/DELETE
5. **Pass only 2 arguments to createMutation** (apiMethod, queryKey)
6. **Group related endpoints** in logical objects
7. **Remove userId from query keys** since authentication is handled server-side

## Utility Functions Pattern

### Utility Organization

```typescript
// src/features/[feature]/lib/utils.ts
import { type [FeatureName] } from '../server/db/schema';

// Type extensions for complex operations
export interface [FeatureName]WithChildren extends [FeatureName] {
  children?: [FeatureName]WithChildren[];
}

// Business logic utilities
export const validate[FeatureName]Name = (
  name: string,
  existing[FeatureName]s: [FeatureName][],
  excludeId?: string
): string | null => {
  if (!name.trim()) return '[FeatureName] name is required';
  if (name.length > 100) return '[FeatureName] name must be 100 characters or less';

  const isDuplicate = existing[FeatureName]s.some(
    (item) => item.name.toLowerCase() === name.toLowerCase() && item.id !== excludeId
  );

  if (isDuplicate) return 'A [feature-name] with this name already exists';

  return null;
};

// Data transformation utilities
export const build[FeatureName]Hierarchy = ([featureName]s: [FeatureName][]): [FeatureName]WithChildren[] => {
  // Implementation for hierarchical data
};

// Helper functions
export const generate[FeatureName]Color = (): string => {
  // Implementation for generating colors, etc.
};
```

### Utility Patterns

1. **Export type extensions** for complex operations
2. **Include validation functions** for business rules
3. **Provide data transformation utilities** for complex data structures
4. **Use descriptive function names** that indicate their purpose
5. **Include proper TypeScript typing** for all functions

## Integration Patterns

### Feature Registration

When creating a new feature, ensure it's properly integrated:

1. **Add to API routes** in the main server configuration
2. **Export from feature index** if needed
3. **Update database migrations** with new schemas
4. **Add to API client** type definitions

### Cross-Feature Dependencies

- **Minimize cross-feature dependencies** where possible
- **Use shared utilities** in `src/lib/` for common functionality
- **Import types** from other features when necessary for relationships
- **Avoid circular dependencies** between features

## Best Practices

1. **Consistency**: Follow the exact patterns established in existing features
2. **Type Safety**: Use TypeScript throughout with proper type definitions
3. **Error Handling**: Implement comprehensive error handling at all levels with withDbQuery
4. **Validation**: Validate all inputs with Zod schemas
5. **Authentication**: Always use getUser(c) for user identification, never URL parameters
6. **Documentation**: Include JSDoc comments for all public functions
7. **Testing**: Write tests for critical business logic
8. **Performance**: Consider query optimization and caching strategies
9. **Security**: Always include user authorization checks
10. **Maintainability**: Keep functions focused and modular
11. **Scalability**: Design for future feature expansion
12. **File Organization**: Use single files until complexity requires directories
13. **Naming Consistency**: Use concise function names with namespace context

## Examples

Reference the `bank`, `tag`, and `label` features as complete examples of this architecture:

- `src/features/bank/` - Complex feature with multiple related entities (uses query directories)
- `src/features/tag/` - Feature with hierarchical data and transaction relationships (single query file)
- `src/features/label/` - Feature with hierarchical structure and validation (single query file)

These features demonstrate all the patterns and conventions outlined in this document.
