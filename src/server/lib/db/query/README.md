# Query Factory System

A type-safe query factory system for building database operation functions with automatic error handling, operation logging, and schema integration. This system provides consistent patterns for database access while maintaining full type safety and performance.

## Overview

The query factory system consists of:

- **`createFeatureQueries`** - Entry point for building query collections
- **`QueryBuilder`** - Core builder for adding individual queries with automatic wrapping
- **Query handlers** - Automatic error handling and operation logging via `withDbQuery`
- **Schema integration** - Seamless integration with the schema factory system

## Key Features

- 🎯 **Type-Safe**: Full TypeScript support with automatic input/output type inference
- 🔄 **Error Handling**: Automatic query error handling and logging via `withDbQuery` wrapper
- 🏗️ **Schema Integration**: Direct integration with schema factory for input validation
- 📊 **Operation Logging**: Built-in operation descriptions for debugging and monitoring
- 🔐 **Security**: User-scoped queries with automatic `userId` filtering patterns
- ⚡ **Performance**: Optimized for Drizzle ORM with proper indexing patterns

## Quick Start

```typescript
import { createFeatureQueries } from '@/server/lib/db';
import { tagSchemas } from '@/features/tag/schemas';
import { db } from '@/server/db';
import { tag } from '@/server/db/schemas';

// Build query collection from schemas
export const tagQueries = createFeatureQueries
  .registerSchema(tagSchemas)
  .addQuery('create', {
    operation: 'create tag',
    fn: async ({ data, userId }) => {
      const [newTag] = await db
        .insert(tag)
        .values({ ...data, userId })
        .returning();
      return newTag;
    }
  })
  .addQuery('getMany', {
    operation: 'get tags by user ID',
    fn: async ({ userId, filters, pagination }) => {
      return await db.query.tag.findMany({
        where: and(eq(tag.userId, userId), eq(tag.isActive, true)),
        // Apply filters, pagination, etc.
      });
    }
  });

// Type inference works automatically
type TagType = InferFeatureType<typeof tagQueries>; // Fully typed!
```

## Core Concepts

### Query Function Pattern

All query functions follow a consistent pattern:

1. **Input Validation** - Automatic via schema integration
2. **Error Wrapping** - Automatic via `withDbQuery` wrapper
3. **Operation Logging** - Required operation description for debugging
4. **Type Safety** - Full TypeScript inference for inputs and outputs

### Schema Integration

Query factories automatically integrate with schema factory outputs:

```typescript
// Schema defines the input structure
const { schemas: userSchemas } = createFeatureSchemas
  .registerTable(userTable)
  .addCore('create', ({ baseSchema, buildServiceInput }) => ({
    query: buildServiceInput({ data: baseSchema })  // This defines query input
  }));

// Query factory uses the schema
const userQueries = createFeatureQueries
  .registerSchema(userSchemas)  // Register the schemas
  .addQuery('create', {
    // fn automatically gets properly typed input from schema
    fn: async ({ data, userId }) => { /* typed parameters! */ }
  });
```

## API Reference

### Factory Functions

#### `createFeatureQueries.registerSchema(schemas)`

Register operation schemas from the schema factory system.

```typescript
const queries = createFeatureQueries
  .registerSchema(tagSchemas)  // Schemas from schema factory
  .addQuery(...);
```

### Builder Methods

#### `.addQuery(key, config)`

Add a query function with automatic error handling and type safety.

```typescript
const queries = createFeatureQueries
  .registerSchema(schemas)
  .addQuery('operationName', {
    operation: 'human-readable description',  // For logging/debugging
    fn: async (input) => {
      // Your database operation here
      // Input is automatically typed from schema
      // Return value determines output type
    }
  });
```

### Query Function Requirements

All query functions must follow these patterns:

1. **User Scoping**: Always filter by `userId` for user-scoped data
2. **Soft Deletes**: Filter by `isActive: true` where applicable
3. **Error Handling**: Use `withDbQuery` wrapper (done automatically)
4. **Return Patterns**: Return `null` for not found, throw for errors

## Examples

### Basic CRUD Queries

```typescript
export const userQueries = createFeatureQueries
  .registerSchema(userSchemas)
  .addQuery('create', {
    operation: 'create user',
    fn: async ({ data, userId }) => {
      const [newUser] = await db
        .insert(userTable)
        .values({ 
          ...data, 
          userId,
          id: createId(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return newUser;
    }
  })
  .addQuery('getById', {
    operation: 'get user by ID',
    fn: async ({ ids, userId }) => {
      const [user] = await db
        .select()
        .from(userTable)
        .where(
          and(
            eq(userTable.id, ids.id),
            eq(userTable.userId, userId),
            eq(userTable.isActive, true)
          )
        )
        .limit(1);
      return user || null;  // Always return null for not found
    }
  })
  .addQuery('updateById', {
    operation: 'update user by ID',
    fn: async ({ ids, data, userId }) => {
      const [updated] = await db
        .update(userTable)
        .set({ 
          ...data, 
          updatedAt: new Date() 
        })
        .where(
          and(
            eq(userTable.id, ids.id),
            eq(userTable.userId, userId),
            eq(userTable.isActive, true)
          )
        )
        .returning();
      return updated || null;
    }
  })
  .addQuery('removeById', {
    operation: 'soft delete user by ID',
    fn: async ({ ids, userId }) => {
      await db
        .update(userTable)
        .set({ 
          isActive: false, 
          updatedAt: new Date() 
        })
        .where(
          and(
            eq(userTable.id, ids.id),
            eq(userTable.userId, userId)
          )
        );
      // Soft delete operations typically don't return data
    }
  });
```

### Complex Queries with Relations

```typescript
export const transactionQueries = createFeatureQueries
  .registerSchema(transactionSchemas)
  .addQuery('getWithTags', {
    operation: 'get transactions with tags',
    fn: async ({ userId, filters }) => {
      return await db.query.transaction.findMany({
        where: and(
          eq(transaction.userId, userId),
          eq(transaction.isActive, true),
          // Apply filters conditionally
          filters?.category ? eq(transaction.category, filters.category) : undefined,
          filters?.search ? like(transaction.description, `%${filters.search}%`) : undefined
        ),
        with: {
          tags: {
            with: {
              tag: true  // Include tag details
            }
          },
          bucket: true  // Include bucket details
        },
        orderBy: [desc(transaction.createdAt)],
        limit: 50
      });
    }
  });
```

### Batch Operations

```typescript
export const tagQueries = createFeatureQueries
  .registerSchema(tagSchemas)
  .addQuery('createMany', {
    operation: 'create multiple tags',
    fn: async ({ items, userId }) => {
      const tagsWithIds = items.map(item => ({
        ...item,
        userId,
        id: createId(),
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      return await db
        .insert(tagTable)
        .values(tagsWithIds)
        .returning();
    }
  });
```

### Junction Table Operations

```typescript
export const tagToTransactionQueries = createFeatureQueries
  .registerSchema(tagToTransactionSchemas)
  .addQuery('assignToTransaction', {
    operation: 'assign tags to transaction',
    fn: async ({ tagIds, transactionId, userId }) => {
      // Verify user owns the transaction (security check done in service layer)
      
      // Remove existing assignments
      await db
        .delete(tagToTransaction)
        .where(eq(tagToTransaction.transactionId, transactionId));

      // Add new assignments if any
      if (tagIds && tagIds.length > 0) {
        await db
          .insert(tagToTransaction)
          .values(
            tagIds.map(tagId => ({
              transactionId,
              tagId
            }))
          );
      }

      return { success: true };
    }
  });
```

### Pagination and Filtering

```typescript
export const transactionQueries = createFeatureQueries
  .registerSchema(transactionSchemas)
  .addQuery('getMany', {
    operation: 'get transactions with pagination',
    fn: async ({ userId, filters, pagination }) => {
      const page = pagination?.page || 1;
      const pageSize = pagination?.pageSize || 10;
      const offset = (page - 1) * pageSize;

      // Build where conditions
      const conditions = [
        eq(transaction.userId, userId),
        eq(transaction.isActive, true)
      ];

      // Add filter conditions
      if (filters?.search) {
        conditions.push(
          like(transaction.description, `%${filters.search}%`)
        );
      }

      if (filters?.category) {
        conditions.push(eq(transaction.category, filters.category));
      }

      if (filters?.dateFrom) {
        conditions.push(gte(transaction.createdAt, new Date(filters.dateFrom)));
      }

      if (filters?.dateTo) {
        conditions.push(lte(transaction.createdAt, new Date(filters.dateTo)));
      }

      // Execute paginated query
      const [items, totalCount] = await Promise.all([
        db
          .select()
          .from(transaction)
          .where(and(...conditions))
          .orderBy(desc(transaction.createdAt))
          .limit(pageSize)
          .offset(offset),
        
        db
          .select({ count: count() })
          .from(transaction)
          .where(and(...conditions))
          .then(result => result[0].count)
      ]);

      return {
        items,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize)
        }
      };
    }
  });
```

## Security Patterns

### User Scoping

Always filter queries by `userId` to prevent data leakage:

```typescript
.addQuery('getById', {
  fn: async ({ ids, userId }) => {
    // ✅ Good - Always include userId filter
    const user = await db
      .select()
      .from(userTable)
      .where(
        and(
          eq(userTable.id, ids.id),
          eq(userTable.userId, userId)  // Required!
        )
      );
  }
});

// ❌ Bad - Missing userId filter
.addQuery('getById', {
  fn: async ({ ids }) => {
    const user = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, ids.id));  // Security vulnerability!
  }
});
```

### Ownership Verification

For cross-entity operations, verify ownership in the service layer:

```typescript
// In query layer - just do the operation
.addQuery('assignTags', {
  fn: async ({ transactionId, tagIds }) => {
    // No ownership check here - queries are pure data access
    await db.insert(tagToTransaction).values(...);
  }
});

// In service layer - verify ownership
const services = {
  assignTags: async ({ transactionId, tagIds, userId }) => {
    // Verify user owns the transaction
    const transaction = await transactionQueries.getById({ 
      ids: { id: transactionId }, 
      userId 
    });
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    // Now safe to assign tags
    return await tagQueries.assignTags({ transactionId, tagIds });
  }
};
```

## Performance Optimization

### Database Indexing

Ensure proper indexes for common query patterns:

```typescript
// In your database schema
export const transaction = pgTable('transaction', {
  id: text().primaryKey(),
  userId: text().notNull(),
  isActive: boolean().notNull().default(true),
  createdAt: timestamp().notNull().defaultNow(),
}, (table) => [
  // Index for user-scoped queries
  index('transaction_user_id_idx').on(table.userId),
  
  // Composite index for user + active queries
  index('transaction_user_active_idx').on(table.userId, table.isActive),
  
  // Index for date range queries
  index('transaction_created_at_idx').on(table.createdAt),
]);
```

### Query Optimization

```typescript
// ✅ Good - Select specific fields when possible
.addQuery('getSummaries', {
  fn: async ({ userId }) => {
    return await db
      .select({
        id: transaction.id,
        amount: transaction.amount,
        description: transaction.description
      })
      .from(transaction)
      .where(and(
        eq(transaction.userId, userId),
        eq(transaction.isActive, true)
      ));
  }
});

// ❌ Less optimal - Select all fields
.addQuery('getSummaries', {
  fn: async ({ userId }) => {
    return await db
      .select()  // Gets all fields
      .from(transaction);
  }
});
```

## Error Handling

The query factory automatically wraps all functions with `withDbQuery` which provides:

1. **Operation Logging** - All database operations are logged with their descriptions
2. **Error Context** - Errors include operation context for easier debugging
3. **Performance Monitoring** - Query timing and performance metrics
4. **Consistent Error Format** - Standardized error responses

```typescript
// Automatic error handling via withDbQuery wrapper
.addQuery('create', {
  operation: 'create user',  // Used in error messages and logging
  fn: async ({ data, userId }) => {
    // If this throws, withDbQuery will:
    // 1. Log the error with operation context
    // 2. Add timing information
    // 3. Re-throw with enhanced error message
    return await db.insert(userTable).values(data);
  }
});
```

## Integration with Service Factory

Query factories integrate seamlessly with service factories:

```typescript
// 1. Define queries
export const userQueries = createFeatureQueries
  .registerSchema(userSchemas)
  .addQuery('create', { ... });

// 2. Register with service factory
export const userServices = createFeatureServices
  .registerSchema(userSchemas)
  .registerQuery(userQueries)  // Register query collection
  .defineServices(({ queries }) => ({
    create: async (input) => {
      // Add business logic here
      if (input.data.email.includes('spam')) {
        throw new Error('Invalid email domain');
      }
      
      // Call query function
      return await queries.create(input);
    }
  }));
```

## Best Practices

1. **One Query Per Operation**: Keep query functions focused on a single database operation

2. **User Scoping**: Always filter by `userId` for user-scoped data

3. **Soft Deletes**: Use `isActive` flags instead of hard deletes

4. **Null Returns**: Return `null` for not found, throw errors for actual problems

5. **Operation Descriptions**: Always provide meaningful operation descriptions for debugging

6. **Schema Integration**: Always register schemas from the schema factory system

7. **Type Inference**: Let TypeScript infer types rather than manually defining them

8. **Batch Operations**: Use single database calls for multiple operations when possible

9. **Index Optimization**: Ensure database indexes match your query patterns

10. **Error Propagation**: Let `withDbQuery` handle error logging and context