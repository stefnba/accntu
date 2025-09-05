# Server Development Patterns

Guidelines for backend development using Hono framework, Drizzle ORM, PostgreSQL, and the factory system.

## API Framework - Hono

### Basic Hono App Structure

```typescript
import { Hono } from 'hono';
import { withRoute } from '@/server/lib/handler';
import { getUser } from '@/lib/auth';
import { zValidator } from '@/server/lib/validation';

// CRITICAL: Always use method chaining for Hono instantiation
const app = new Hono()
    .get('/', async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            return { message: 'Hello World', userId: user.id };
        })
    )
    .post('/', zValidator('json', CreateSchema), async (c) =>
        withRoute(
            c,
            async () => {
                const user = getUser(c);
                const data = c.req.valid('json');
                return await service.create({ ...data, userId: user.id });
            },
            201
        )
    );

export default app;
```

### Route Handler Patterns

```typescript
// Always use withRoute wrapper for error handling
app.get('/items/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
    withRoute(c, async () => {
        const { id } = c.req.valid('param');
        const user = getUser(c);

        const item = await queries.getById({ id, userId: user.id });

        if (!item) {
            throw new Error('Item not found');
        }

        return item;
    })
);

// Use appropriate status codes for different operations
app.post(
    '/items',
    zValidator('json', CreateItemSchema),
    async (c) =>
        withRoute(
            c,
            async () => {
                const user = getUser(c);
                const data = c.req.valid('json');

                return await queries.create({
                    data: { ...data, userId: user.id },
                });
            },
            201
        ) // 201 for creation
);

app.delete('/items/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
    withRoute(c, async () => {
        const { id } = c.req.valid('param');
        await queries.remove({ id });
        return { success: true };
    })
);
```

## Database Operations

### Modern Factory System (Recommended)

Use the factory system for type-safe, consistent database operations:

```typescript
// Query factory with automatic error handling
export const userQueries = createFeatureQueries
  .registerSchema(userSchemas)
  .addQuery('create', {
    operation: 'create user',
    fn: async ({ data, userId }) => {
      const [user] = await db.insert(userTable)
        .values({ ...data, userId })
        .returning();
      return user;
    }
  })
  .addQuery('getById', {
    operation: 'get user by ID',
    fn: async ({ ids, userId }) => {
      const [user] = await db.select()
        .from(userTable)
        .where(and(eq(userTable.id, ids.id), eq(userTable.userId, userId)))
        .limit(1);
      return user || null;
    }
  });

// Service factory with business logic
export const userServices = createFeatureServices
  .registerSchema(userSchemas)
  .registerQuery(userQueries)
  .defineServices(({ queries }) => ({
    create: async (input) => {
      // Business logic validation
      if (input.data.email.includes('spam')) {
        throw new Error('Invalid email domain');
      }
      return await queries.create(input);
    }
  }));
```

### Legacy Query Wrapper Pattern

```typescript
import { withDbQuery } from '@/server/lib/handler';
import { db } from '@/server/db';
import { eq, and } from 'drizzle-orm';

export const getById = async ({ id, userId }: { id: string; userId: string }) =>
    withDbQuery({
        operation: 'get item by ID and user',
        queryFn: async () => {
            const [result] = await db
                .select()
                .from(itemTable)
                .where(
                    and(
                        eq(itemTable.id, id),
                        eq(itemTable.userId, userId),
                        eq(itemTable.isActive, true)
                    )
                )
                .limit(1);

            return result || null;
        },
    });

export const create = async ({ data }: { data: NewItem }) =>
    withDbQuery({
        operation: 'create item',
        queryFn: async () => {
            const [result] = await db
                .insert(itemTable)
                .values({
                    ...data,
                    id: createId(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning();

            return result;
        },
    });
```

### Relational Queries

```typescript
export const getWithRelations = async ({ userId }: { userId: string }) =>
    withDbQuery({
        operation: 'get items with relations',
        queryFn: async () => {
            return await db.query.itemTable.findMany({
                where: and(eq(itemTable.userId, userId), eq(itemTable.isActive, true)),
                with: {
                    category: true,
                    tags: {
                        with: {
                            tag: true,
                        },
                    },
                },
                orderBy: (items, { desc }) => [desc(items.createdAt)],
            });
        },
    });
```

### Batch Operations

```typescript
export const createMany = async ({ items }: { items: NewItem[] }) =>
    withDbQuery({
        operation: 'create multiple items',
        queryFn: async () => {
            const itemsWithIds = items.map((item) => ({
                ...item,
                id: createId(),
                createdAt: new Date(),
                updatedAt: new Date(),
            }));

            return await db.insert(itemTable).values(itemsWithIds).returning();
        },
    });
```

## Authentication & Authorization

### User Context Extraction

```typescript
import { getUser } from '@/lib/auth';

// Always use getUser(c) - never userId in URL parameters
app.get('/protected-route', async (c) =>
    withRoute(c, async () => {
        const user = getUser(c); // Throws if not authenticated

        // User object contains id, email, and other auth data
        return await queries.getUserData({ userId: user.id });
    })
);
```

### User-Scoped Data Access

```typescript
// Always filter by userId for security
export const getUserItems = async ({ userId }: { userId: string }) =>
    withDbQuery({
        operation: 'get user items',
        queryFn: async () => {
            return await db
                .select()
                .from(itemTable)
                .where(
                    and(
                        eq(itemTable.userId, userId), // Always include this
                        eq(itemTable.isActive, true)
                    )
                );
        },
    });

// Verify ownership before updates/deletes
export const updateUserItem = async ({
    id,
    userId,
    data,
}: {
    id: string;
    userId: string;
    data: Partial<NewItem>;
}) =>
    withDbQuery({
        operation: 'update user item',
        queryFn: async () => {
            const [updated] = await db
                .update(itemTable)
                .set({
                    ...data,
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(itemTable.id, id),
                        eq(itemTable.userId, userId) // Ownership check
                    )
                )
                .returning();

            if (!updated) {
                throw new Error('Item not found or access denied');
            }

            return updated;
        },
    });
```

## Input Validation with Zod

### Schema Definitions

```typescript
import { z } from 'zod';

// Request validation schemas
export const CreateItemSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    description: z.string().optional(),
    amount: z.number().positive('Amount must be positive'),
    category: z.enum(['income', 'expense']),
});

export const UpdateItemSchema = CreateItemSchema.partial();

export const ParamSchema = z.object({
    id: z.string().cuid2('Invalid ID format'),
});
```

### Validation in Routes

```typescript
app.post('/items', zValidator('json', CreateItemSchema), async (c) =>
    withRoute(
        c,
        async () => {
            const user = getUser(c);
            const data = c.req.valid('json'); // Type-safe validated data

            return await service.createItem({
                ...data,
                userId: user.id,
            });
        },
        201
    )
);

app.put(
    '/items/:id',
    zValidator('param', ParamSchema),
    zValidator('json', UpdateItemSchema),
    async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            const data = c.req.valid('json');
            const user = getUser(c);

            return await service.updateItem({
                id,
                userId: user.id,
                data,
            });
        })
);
```

## Error Handling

### Custom Error Types

```typescript
// Use descriptive error messages
export const createItem = async ({ data }: { data: CreateItemData }) => {
    // Business logic validation
    if (data.amount > 1000000) {
        throw new Error('Amount exceeds maximum limit of $1,000,000');
    }

    // Check for duplicates
    const existing = await queries.getByName({
        name: data.name,
        userId: data.userId,
    });

    if (existing) {
        throw new Error(`Item with name "${data.name}" already exists`);
    }

    return await queries.create({ data });
};
```

### Error Chain Context

```typescript
export const complexOperation = async ({ userId }: { userId: string }) => {
    try {
        const user = await queries.getUser({ id: userId });
        const items = await queries.getUserItems({ userId });
        const processed = await processItems(items);

        return processed;
    } catch (error) {
        // Chain errors for better debugging
        throw new Error(`Failed to complete complex operation: ${error.message}`);
    }
};
```

## Service Layer Patterns (Complex Features)

### Business Logic Separation

```typescript
// services/item-service.ts
import * as itemQueries from '../queries/item-queries';

export const createItemWithValidation = async ({
    userId,
    name,
    amount,
}: {
    userId: string;
    name: string;
    amount: number;
}) => {
    // Business rules
    if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
    }

    if (name.length > 100) {
        throw new Error('Name must be 100 characters or less');
    }

    // Check business constraints
    const userItems = await itemQueries.getAll({ userId });
    if (userItems.length >= 1000) {
        throw new Error('Maximum number of items reached');
    }

    // Create item
    return await itemQueries.create({
        data: { userId, name, amount },
    });
};
```

## Performance Optimization

### Database Indexing

```typescript
// Ensure proper indexes for common queries
export const itemTable = pgTable(
    'item',
    {
        id: text().primaryKey(),
        userId: text().notNull(), // Index this for user queries
        name: text().notNull(),
        createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
        isActive: boolean().notNull().default(true), // Index for soft delete queries
    },
    (table) => ({
        userIdIdx: index('item_user_id_idx').on(table.userId),
        userActiveIdx: index('item_user_active_idx').on(table.userId, table.isActive),
    })
);
```

### Query Optimization

```typescript
// Use select() for specific fields when possible
export const getItemSummaries = async ({ userId }: { userId: string }) =>
    withDbQuery({
        operation: 'get item summaries',
        queryFn: async () => {
            return await db
                .select({
                    id: itemTable.id,
                    name: itemTable.name,
                    amount: itemTable.amount,
                })
                .from(itemTable)
                .where(and(eq(itemTable.userId, userId), eq(itemTable.isActive, true)))
                .orderBy(desc(itemTable.createdAt))
                .limit(100);
        },
    });
```

## Best Practices

### Modern Approach (Factory System)

1. **Use Factory System** for all new server-side development
2. **Schema-first design** with `createFeatureSchemas`
3. **Query factory** with `createFeatureQueries` for data access
4. **Service factory** with `createFeatureServices` for business logic
5. **Automatic type inference** - let TypeScript infer from schemas
6. **Operation descriptions** for all database queries
7. **Business logic in services** - keep queries pure

### Legacy Patterns (Existing Code)

1. **Always use Hono framework** (never Next.js server actions)
2. **Method chaining** for Hono app instantiation
3. **withRoute wrapper** for all endpoints
4. **withDbQuery wrapper** for all database operations
5. **getUser(c) for authentication** (never userId in URL)
6. **Input validation** with Zod schemas
7. **User-scoped queries** with userId filtering
8. **Descriptive error messages** with context
9. **Soft deletes** with isActive flags
10. **Proper HTTP status codes** (201 for creation, etc.)

## Factory System Documentation

For comprehensive factory system documentation:

- **Schema Factory**: @src/lib/schemas/README.md - Schema definition and validation
- **Query Factory**: @src/server/lib/db/query/README.md - Database operations  
- **Service Factory**: @src/server/lib/service/README.md - Business logic layer

### Factory Integration Example

```typescript
// Complete pipeline from schema to service
import { createFeatureSchemas } from '@/lib/schemas';
import { createFeatureQueries } from '@/server/lib/db';
import { createFeatureServices } from '@/server/lib/service';

// 1. Schema layer
export const { schemas } = createFeatureSchemas
  .registerTable(userTable)
  .userField('userId')
  .addCore('create', ({ baseSchema, buildServiceInput }) => ({
    service: buildServiceInput({ data: baseSchema }),
    query: buildServiceInput({ data: baseSchema }),
    endpoint: { json: baseSchema }
  }));

// 2. Query layer
export const queries = createFeatureQueries
  .registerSchema(schemas)
  .addQuery('create', {
    operation: 'create user',
    fn: async ({ data, userId }) => {
      return await db.insert(userTable).values({ ...data, userId }).returning();
    }
  });

// 3. Service layer
export const services = createFeatureServices
  .registerSchema(schemas)
  .registerQuery(queries)
  .defineServices(({ queries }) => ({
    create: async (input) => {
      // Business logic here
      return await queries.create(input);
    }
  }));

// 4. Endpoint integration
const app = new Hono()
  .post('/', zValidator('json', CreateUserSchema), async (c) =>
    withRoute(c, async () => {
      const user = getUser(c);
      const data = c.req.valid('json');
      return await services.create({ data, userId: user.id });
    }, 201)
  );
```

For database schema patterns: @src/features/CLAUDE.md
For API client integration: @src/lib/CLAUDE.md
