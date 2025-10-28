# Feature Query Builder - Modern Approach

A progressive, type-safe query builder for feature-based architecture with simplified configuration and better developer experience.

## Table of Contents

- [Overview](#overview)
- [Key Improvements](#key-improvements)
- [Architecture](#architecture)
- [Usage Guide](#usage-guide)
- [Comparison with Legacy Approach](#comparison-with-legacy-approach)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)

## Overview

The Feature Query Builder provides a modern, fluent interface for constructing database queries with full TypeScript inference. It separates standard CRUD operations from custom queries, making code more maintainable and easier to understand.

### Key Concepts

1. **Progressive Registration**: Add queries one at a time instead of all-or-nothing
2. **Separate Builders**: Standard CRUD vs custom queries have dedicated builders
3. **Single Error Handling**: Only one error handling layer (no double wrapping)
4. **Full Type Safety**: Complete type inference with no type assertions

## Key Improvements

### 1. Progressive Query Registration

**Old Approach** (all-or-nothing):

```typescript
// Must configure everything upfront, even if you only need 2 queries
.registerCoreQueries(table, {
  idFields: ['id'],
  userIdField: 'userId',
  returnColumns: ['id', 'name', 'email'],
  allowedUpsertColumns: ['name', 'email'],
  softDelete: true,
  queryConfig: {
    getMany: { filters: ..., orderBy: ... },
    create: { onConflict: 'update' }
  }
})
// ❌ Gets all 6 queries: create, createMany, getById, getMany, updateById, removeById
```

**New Approach** (one at a time):

```typescript
// Add only what you need, configure each individually
.standardQueries({
  idColumns: ['id'],
  userIdColumn: 'userId',
  defaults: {
    idFilters: { isActive: true },
    returnColumns: ['id', 'name', 'email']
  }
})
  .create({
    allowedColumns: ['name', 'email'],
    returnColumns: ['id', 'name', 'createdAt'],
    onConflict: 'ignore'
  })
  .getById({
    returnColumns: ['id', 'name', 'email']
  })
  .done()
// ✅ Gets only 2 queries: create, getById
```

### 2. Simpler Type Inference

**Old Approach**:

- 6 generic type parameters in one massive function
- Complex nested conditionals
- Type inference often fails

**New Approach**:

- Simple generics per method
- Clear type flow
- Types always infer correctly

### 3. Single Error Handling Layer

**Old Approach**:

```typescript
registerCoreQueries() → wraps with dbQueryFnHandler
  ↓
tableOps.createRecord() → wraps with withDbQuery
// ❌ Double wrapping = deeper stack traces, harder debugging
```

**New Approach**:

```typescript
standardQueries().create() → calls tableOps.createRecord directly
  ↓
tableOps.createRecord() → wraps with withDbQuery
// ✅ Single wrapping = clean stack traces
```

Custom queries still use `dbQueryFnHandler` because they're user-provided functions that might not have error handling.

### 4. Better Configuration Separation

**Old Approach**:

- One massive config object with 10+ properties
- Hard to understand what affects what
- No IntelliSense guidance

**New Approach**:

- Global config (idColumns, userIdColumn, defaults)
- Per-query config (allowedColumns, returnColumns, onConflict)
- Clear separation of concerns with default values support

## Architecture

```text
FeatureQueryBuilder (Main Builder)
├── registerSchema() - Add operation schemas
├── registerTable() - Set/change table
├── addQuery() - Add custom query with error handling
├── standardQueries() - Transition to StandardQueryBuilder
│   └── StandardQueryBuilder (Standard CRUD Builder)
│       ├── create() - Add create query
│       ├── getById() - Add getById query
│       ├── getMany() - Add getMany query
│       ├── updateById() - Add updateById query
│       ├── removeById() - Add removeById query
│       ├── createMany() - Add createMany query
│       └── done() - Return to FeatureQueryBuilder
└── pick() - Select subset of queries
```

### Type Flow

```typescript
// 1. Start with empty builder
FeatureQueryBuilder<{}, {}, TTable>

// 2. Register schemas
FeatureQueryBuilder<{}, TSchemas, TTable>

// 3. Add standard queries
.standardQueries(config)
  .create(...)
  FeatureQueryBuilder<{ create: QueryFn<CreateInput, CreateOutput> }, TSchemas, TTable>

  .getById(...)
  FeatureQueryBuilder<{ create: ..., getById: QueryFn<GetByIdInput, GetByIdOutput> }, TSchemas, TTable>

// 4. Add custom queries
.addQuery('custom', ...)
FeatureQueryBuilder<{ create: ..., getById: ..., custom: QueryFn<...> }, TSchemas, TTable>
```

### Type Safety & Utilities

The builder leverages shared utility types from `table-operations/types.ts` for consistency:

- **`GetTableColumnKeys<T>`** - Column name union (replaces `keyof T['_']['columns']`)
- **`GetTableColumnDefinitions<T>`** - Full column definitions (replaces `T['_']['columns']`)
- **`TBooleanFilter<T>`** - Type-safe filter objects
- **`TOnConflict<T>`** - Conflict resolution strategies

**Benefits:**

- ✅ Consistency across all query builders
- ✅ Single source of truth for type definitions
- ✅ Easier maintenance and refactoring
- ✅ Better IntelliSense with `Prettify<T>` utility

## Usage Guide

### Basic Example

```typescript
import { createFeatureQueries } from '@/server/lib/db/query/builder/feature-query';
import { userTable } from '@/server/db/tables';
import { userSchemas } from '@/features/user/schemas';

export const userQueries = createFeatureQueries(userTable)
    .registerSchema(userSchemas)
    .standardQueries({
        idColumns: ['id'],
        userIdColumn: 'userId',
        defaults: {
            idFilters: { isActive: true },
            returnColumns: ['id', 'name', 'email'],
            allowedUpsertColumns: ['name', 'email', 'role'],
        },
    })
    .create({
        returnColumns: ['id', 'name', 'email', 'createdAt'],
    })
    .getById({
        returnColumns: ['id', 'name', 'email', 'role'],
    })
    .done()
    .addQuery('findByEmail', ({ tableOps }) => ({
        operation: 'find user by email',
        fn: async (input: { email: string; userId: string }) => {
            return await tableOps.getFirstRecord({
                columns: ['id', 'name', 'email'],
                identifiers: [
                    { field: 'email', value: input.email },
                    { field: 'userId', value: input.userId },
                ],
            });
        },
    }));

// Usage
const user = await userQueries.queries.create({
    data: { name: 'John', email: 'john@example.com', role: 'user' },
    userId: 'current-user-id',
});
// Type: { id: string, name: string, email: string, createdAt: Date }

const fetchedUser = await userQueries.queries.getById({
    ids: { id: user.id },
    userId: 'current-user-id',
});
// Type: { id: string, name: string, email: string, role: string } | null
```

### Standard Queries Configuration

#### Global Config (standardQueries)

```typescript
.standardQueries({
  // Required: Which columns identify a unique record
  idColumns: ['id'],

  // Optional: Column for user-based filtering (multi-tenancy)
  userIdColumn: 'userId',

  // Optional: Default configuration for all queries
  defaults: {
    // Default filters applied to ALL queries
    idFilters: {
      isActive: true,
      deletedAt: null
    },
    // Default columns to return (can be overridden per query)
    returnColumns: ['id', 'name', 'email'],
    // Default columns allowed for create/upsert (can be overridden per query)
    allowedUpsertColumns: ['name', 'email', 'role']
  }
})
```

#### Per-Query Config

```typescript
// Create
.create({
  allowedColumns: ['name', 'email'],  // Optional: Whitelist for security (uses defaults if not specified)
  returnColumns: ['id', 'name', 'createdAt'],  // Optional: What to return (uses defaults if not specified)
  onConflict: 'ignore' | 'update' | {...}  // Optional: Conflict handling
})

// Or rely entirely on defaults
.create()  // Uses config.defaults.allowedUpsertColumns and returnColumns

// GetById
.getById({
  returnColumns: ['id', 'name', 'email'],  // Optional: What to return (uses defaults if not specified)
  idFilters: { isActive: true }  // Optional: Override default idFilters for this query
})

// Future: GetMany, UpdateById, RemoveById, CreateMany
```

### Custom Queries

For operations that don't fit standard patterns:

```typescript
.addQuery('archive', ({ tableOps }) => ({
  operation: 'archive user',
  fn: async (input: { id: string; userId: string }) => {
    return await tableOps.updateRecord({
      data: { archivedAt: new Date() },
      identifiers: [
        { field: 'id', value: input.id },
        { field: 'userId', value: input.userId }
      ],
      returnColumns: ['id', 'archivedAt']
    });
  }
}))
```

### Type Inference

The builder automatically infers types from:

1. **Table definition**: Column types from Drizzle schema
2. **Configuration**: Which columns are IDs, userId, etc.
3. **Options**: Which columns to allow/return

```typescript
// TypeScript knows:
const result = await queries.create({
    data: {
        name: 'John', // ✅ Allowed
        email: 'john@example.com', // ✅ Allowed
        // password: '123'  // ❌ Not in allowedColumns
    },
    userId: 'user-id', // ✅ Required because userIdColumn is set
});

// Result type is inferred from returnColumns:
// { id: string, name: string, createdAt: Date }
```

## Comparison with Legacy Approach

### Code Comparison

**Legacy Approach** (`/src/server/lib/db/query/feature-queries/`):

```typescript
// All-or-nothing configuration
export const tagQueries = createFeatureQueries('tag')
    .registerSchema(tagSchemas)
    .registerCoreQueries(tagTable, {
        idFields: ['id'],
        userIdField: 'userId',
        returnColumns: ['id', 'name', 'color'],
        allowedUpsertColumns: ['name', 'color'],
        softDelete: true,
        defaults: {
            idFilters: { isActive: true },
            returnColumns: ['id', 'name', 'color'],
        },
        queryConfig: {
            getMany: {
                filters: (filters, f) => [f.ilike('name', filters?.search)],
                orderBy: { createdAt: 'desc' },
            },
            create: {
                onConflict: 'update',
            },
        },
    });

// Problems:
// ❌ Gets all 6 queries even if you only need 2
// ❌ Complex nested config object
// ❌ Hard to customize individual queries
// ❌ Type inference sometimes fails
// ❌ Double error handling (dbQueryFnHandler + withDbQuery)
```

**New Approach** (`/src/server/lib/db/query/builder/feature-query/`):

```typescript
// Progressive, flexible configuration
export const tagQueries = createFeatureQueries(tagTable)
  .registerSchema(tagSchemas)
  .standardQueries({
    idColumns: ['id'],
    userIdColumn: 'userId',
    defaults: {
      idFilters: { isActive: true },
      returnColumns: ['id', 'name', 'color']
    }
  })
    .create({
      allowedColumns: ['name', 'color'],
      returnColumns: ['id', 'name', 'color', 'createdAt'],
      onConflict: 'update'
    })
    .getById({
      returnColumns: ['id', 'name', 'color']
    })
    // Skip getMany, updateById, etc. if not needed
    .done()
  .addQuery('customQuery', ({ tableOps }) => ({
    fn: async (input) => { ... }
  }));

// Benefits:
// ✅ Only add queries you need
// ✅ Clear, focused configuration
// ✅ Easy to customize per-query
// ✅ Perfect type inference
// ✅ Single error handling layer
```

### Feature Comparison

| Feature                      | Legacy | New    | Notes                             |
| ---------------------------- | ------ | ------ | --------------------------------- |
| **Progressive Registration** | ❌     | ✅     | Add queries one at a time         |
| **Flexible Configuration**   | ❌     | ✅     | Configure each query individually |
| **Type Inference**           | ⚠️     | ✅     | Sometimes fails vs always works   |
| **Error Handling**           | ⚠️     | ✅     | Double wrapped vs single layer    |
| **Code Complexity**          | High   | Low    | 150+ lines vs focused methods     |
| **IntelliSense Support**     | ⚠️     | ✅     | Poor vs excellent                 |
| **Maintainability**          | Low    | High   | Hard to modify vs easy to extend  |
| **Learning Curve**           | Steep  | Gentle | Complex config vs simple API      |

## Migration Guide

### Strategy

**Recommendation**: Adopt new approach for new features, migrate existing features incrementally.

### Step-by-Step Migration

#### 1. Identify Current Usage

**Before** (`/features/tag/server/db/queries.ts`):

```typescript
export const tagQueries = createFeatureQueries('tag')
    .registerSchema(tagSchemas)
    .registerCoreQueries(tagTable, {
        idFields: ['id'],
        userIdField: 'userId',
        returnColumns: ['id', 'name', 'color'],
        allowedUpsertColumns: ['name', 'color'],
        softDelete: true,
    });
```

#### 2. Create New Builder

**After**:

```typescript
import { createFeatureQueries } from '@/server/lib/db/query/builder/feature-query';

export const tagQueries = createFeatureQueries(tagTable)
    .registerSchema(tagSchemas)
    .standardQueries({
        idColumns: ['id'],
        userIdColumn: 'userId',
    })
    .create({
        allowedColumns: ['name', 'color'],
        returnColumns: ['id', 'name', 'color', 'createdAt'],
    })
    .getById({
        returnColumns: ['id', 'name', 'color'],
    })
    // Add other queries as needed
    .done();
```

#### 3. Update Service Layer

The service layer usage remains the same:

```typescript
// No changes needed!
const services = new ServiceBuilderFactory({ schemas: {}, queries: {} })
    .registerSchemas(tagSchemas)
    .registerQueries(tagQueries) // Works with both old and new
    .registerCoreServices()
    .build();
```

#### 4. Test Thoroughly

```typescript
// Test each query to ensure behavior matches
const tag = await tagQueries.queries.create({ data: { name: 'Test' }, userId: '123' });
const fetched = await tagQueries.queries.getById({ ids: { id: tag.id }, userId: '123' });
```

### Migration Checklist

- [ ] Identify all features using `createFeatureQueries().registerCoreQueries()`
- [ ] Create a migration priority list (start with simplest features)
- [ ] For each feature:
    - [ ] Create new builder in separate file (e.g., `queries-new.ts`)
    - [ ] Add standard queries needed
    - [ ] Add any custom queries
    - [ ] Update imports in service layer
    - [ ] Run tests
    - [ ] Delete old queries file
- [ ] Update feature templates/generators
- [ ] Document new approach in team wiki

### Coexistence

Both approaches can coexist during migration:

```typescript
// Old queries still work
import { tagQueriesOld } from './queries-old';

// New queries
import { tagQueriesNew } from './queries-new';

// Use whichever you want
const services = createFeatureServices('tag')
    .registerQueries(tagQueriesNew) // or tagQueriesOld
    .registerCoreServices()
    .build();
```

## Best Practices

### 1. Only Add Queries You Need

```typescript
// ❌ Don't add all queries by default
.create().getById().getMany().updateById().removeById().createMany()

// ✅ Only add what you use
.create().getById()  // That's it!
```

### 2. Use Descriptive Return Columns

```typescript
// ❌ Don't return everything
returnColumns: Object.keys(userTable) as Array<keyof typeof userTable>;

// ✅ Be explicit about what you need
returnColumns: ['id', 'name', 'email', 'createdAt'];
```

### 3. Configure Security Whitelist

```typescript
// ✅ Always specify allowedColumns for create
.create({
  allowedColumns: ['name', 'email'],  // Only these can be inserted
  returnColumns: ['id', 'name', 'createdAt']
})
```

### 4. Use Default Configuration Wisely

```typescript
// ✅ Apply defaults that should be used across all standard queries
.standardQueries({
  idColumns: ['id'],
  userIdColumn: 'userId',
  defaults: {
    // Filters that should ALWAYS be enforced
    idFilters: {
      isActive: true,  // Never fetch inactive records
      deletedAt: null  // Soft delete support
    },
    // Default columns to return (can be overridden per query)
    returnColumns: ['id', 'name', 'email', 'createdAt'],
    // Default columns allowed for create/upsert (can be overridden per query)
    allowedUpsertColumns: ['name', 'email', 'role', 'status']
  }
})

// Then you can create records without repeating the allowed columns
.create({ onConflict: 'update' })  // Uses defaults
.create({ allowedColumns: ['name'] })  // Override for specific case
```

### 5. Leverage TableOps for Custom Queries

```typescript
// ✅ Use tableOps helper methods
.addQuery('findActive', ({ tableOps }) => ({
  fn: async (input) => {
    return await tableOps.getManyRecords({
      identifiers: [{ field: 'userId', value: input.userId }],
      filters: [eq(table.isActive, true)],
      columns: ['id', 'name']
    });
  }
}))
```

### 6. Document Complex Queries

```typescript
.addQuery('complexOperation', ({ tableOps }) => ({
  operation: 'Complex multi-step operation',
  fn: async (input) => {
    // Step 1: Fetch related records
    const related = await tableOps...

    // Step 2: Transform data
    const transformed = related.map(...)

    // Step 3: Return result
    return transformed;
  }
}))
```

## Future Enhancements

### Planned Features

- [ ] **getMany()** - Fetch multiple records with filtering/pagination
- [ ] **updateById()** - Update a single record
- [ ] **removeById()** - Delete/soft-delete a record
- [ ] **createMany()** - Bulk insert records
- [ ] **Runtime validation** - Optional input validation with Zod
- [ ] **Query composition** - Combine multiple queries
- [ ] **Transaction support** - Atomic operations across queries

### API Stability

The current API is **experimental** and may change based on feedback. Once all standard queries are implemented and tested in production, the API will be frozen (v1.0).

## Support

For questions or issues:

- Check existing queries in `/features/*/server/db/queries.ts`
- Review test examples in `/server/lib/db/query/builder/feature-query/__tests__/`
- Ask in team chat

## Related Documentation

- [Table Operations](../../table-operations/README.md) - Low-level database operations
- [Legacy Feature Queries](../../feature-queries/README.md) - Old approach (deprecated)
- [Service Builder](../../../service/builder/README.md) - Service layer wrapping queries
