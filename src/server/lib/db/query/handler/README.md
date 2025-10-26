# Query Handler

The **Query Handler** provides error handling wrappers for database query operations. It ensures consistent error formatting and proper error codes across all database operations.

## Purpose

- **Wrap queries** with comprehensive error handling
- **Validate inputs** using Zod schemas (optional)
- **Format errors** consistently with proper error codes
- **Log operations** for debugging in development

## Two Patterns

### Pattern 1: `withDbQuery` (Direct Execution)

Use when you want to **execute a query immediately** with error handling.

```typescript
import { withDbQuery } from '@/server/lib/db/query/handler';

// Direct execution with operation context
const user = await withDbQuery({
    queryFn: async () => {
        return await db.select().from(users).where(eq(users.id, userId)).limit(1);
    },
    operation: 'get user by ID',
    table: 'user', // Optional: adds table context to error messages
});
```

**When to use:**

- One-off queries
- Simple operations without reusability needs
- When you don't need input validation

### Pattern 2: `dbQueryFnHandler` (Create Reusable Function)

Use when you want to **create a reusable query function** with validation.

```typescript
import { dbQueryFnHandler } from '@/server/lib/db/query/handler';
import { z } from 'zod';

// Create reusable function with validation
const getUserById = dbQueryFnHandler({
    queryFn: async ({ userId }) => {
        return await db.select().from(users).where(eq(users.id, userId)).limit(1);
    },
    operation: 'get user by ID',
    inputSchema: z.object({ userId: z.string().cuid2() }),
});

// Later: execute the function multiple times
const user1 = await getUserById({ userId: 'abc123' });
const user2 = await getUserById({ userId: 'def456' });
```

**When to use:**

- Reusable query functions
- Need input validation
- Building query libraries
- Used by FeatureQueryBuilder internally

## Error Handling

Both patterns provide comprehensive error handling:

```typescript
try {
    const result = await withDbQuery({
        queryFn: async () => {
            /* query */
        },
        operation: 'create user',
        table: 'user', // Optional: for better error messages
    });
} catch (error) {
    // Errors are automatically formatted with:
    // - Proper error codes (UNIQUE_VIOLATION, FOREIGN_KEY_VIOLATION, etc.)
    // - Operation and table context in error message
    // - Original error details preserved
    // - Development-mode logging
}
```

## Error Types Handled

The handler automatically detects and formats these database errors:

| Error Type        | Code                    | Description                   |
| ----------------- | ----------------------- | ----------------------------- |
| Unique constraint | `UNIQUE_VIOLATION`      | Duplicate key value           |
| Foreign key       | `FOREIGN_KEY_VIOLATION` | Invalid foreign key reference |
| Not null          | `NOT_NULL_VIOLATION`    | NULL value in required column |
| Check constraint  | `CHECK_VIOLATION`       | Check constraint failed       |
| Connection        | `CONNECTION_ERROR`      | Database connection failed    |
| Timeout           | `TIMEOUT_ERROR`         | Query exceeded timeout        |
| Generic           | `QUERY_FAILED`          | Other database errors         |

## Real-World Examples

### Example 1: Table Operations (Direct Execution)

```typescript
// Inside TableOperationsBuilder
async createRecord({ data }) {
    return withDbQuery({
        queryFn: async () => {
            const [record] = await db
                .insert(this.table)
                .values(data)
                .returning();
            return record;
        },
        operation: this.getOperationDescription('createRecord'),
        table: this.tableName,
    });
}
```

### Example 2: Feature Queries (Reusable Functions)

```typescript
// Inside FeatureQueryBuilder
const wrappedQuery = dbQueryFnHandler({
    queryFn: async (input) => {
        return await db
            .select()
            .from(tags)
            .where(and(eq(tags.userId, input.userId), eq(tags.id, input.ids.id)));
    },
    operation: 'get tag by id',
});
```

### Example 3: Custom Query with Validation

```typescript
import { dbQueryFnHandler } from '@/server/lib/db/query/handler';

// Create a validated, reusable search function
const searchUsers = dbQueryFnHandler({
    queryFn: async ({ search, limit }) => {
        return await db
            .select()
            .from(users)
            .where(ilike(users.name, `%${search}%`))
            .limit(limit);
    },
    operation: 'search users',
    inputSchema: z.object({
        search: z.string().min(1).max(100),
        limit: z.number().min(1).max(100).default(10),
    }),
});

// Execute with automatic validation
const results = await searchUsers({ search: 'john', limit: 20 });
```

## Comparison

| Feature              | `withDbQuery`  | `dbQueryFnHandler` |
| -------------------- | -------------- | ------------------ |
| **Execution**        | Immediate      | Returns function   |
| **Reusability**      | One-off        | Reusable           |
| **Input Validation** | No             | Yes (optional)     |
| **Error Handling**   | ✅ Yes         | ✅ Yes             |
| **Type Safety**      | ✅ Yes         | ✅ Yes             |
| **Use Case**         | Direct queries | Query libraries    |

## Integration with Other Layers

```text
FeatureQueryBuilder
    ↓ Uses dbQueryFnHandler() to wrap queries
    ↓
TableOperationsBuilder
    ↓ Uses withDbQuery() for direct execution
    ↓
Query Handler (this module)
    ↓ Provides error handling
    ↓
Database (PostgreSQL)
```

## See Also

- **Feature Queries**: [../feature-queries/README.md](../feature-queries/README.md)
- **Table Operations**: [../table-operations/README.md](../table-operations/README.md)
- **Error Handling**: [error.ts](./error.ts) - Database error formatting logic
