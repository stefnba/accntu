# Feature Query Builder

A modern, type-safe query builder for feature-based architecture. Bridges feature schemas with database operations, handles user-based filtering, and provides full TypeScript inference.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Purpose](#purpose)
- [Key Improvements](#key-improvements)
- [Architecture](#architecture)
- [Usage Guide](#usage-guide)
- [Comparison with Legacy Approach](#comparison-with-legacy-approach)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)

## Overview

The Feature Query Builder provides query orchestration for feature-based projects. It simplifies database operations while maintaining security, type safety, and developer experience.

### Purpose

- **Extract userId** from input and pass it to table operations
- **Apply feature-specific filters** (search, status, etc.)
- **Map schema types** to database operations
- **Handle pagination** and ordering logic
- **Provide full type safety** with zero type assertions

### Key Concepts

1. **Progressive Registration**: Add only the queries you need
2. **Table Configuration**: Type-safe configuration via `FeatureTableConfig`
3. **Single Error Handling**: Clean stack traces (no double wrapping)
4. **Full Type Safety**: Complete type inference throughout

## Quick Start

```typescript
import { createFeatureQueries } from '@/server/lib/db/query/builder/feature-query';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { tagTable } from '@/features/tag/server/db/tables';

// 1. Create table configuration
const tagTableConfig = createFeatureTableConfig(tagTable)
    .restrictReturnColumns(['id', 'name', 'color', 'userId'])
    .build();

// 2. Create query builder with all standard CRUD operations
export const tagQueries = createFeatureQueries('tag', tagTableConfig).registerAllStandard({
    defaultFilters: { isActive: true },
});

// 3. Use the queries
const tag = await tagQueries.queries.create({
    data: { name: 'Work', color: '#FF0000' },
    userId: 'user-123',
});

const tags = await tagQueries.queries.getMany({
    userId: 'user-123',
});
```

## Key Improvements

### 1. Table Configuration System

**New Approach** uses `FeatureTableConfig` for type-safe configuration:

```typescript
// Create configuration once, reuse everywhere
const tableConfig = createFeatureTableConfig(userTable)
    .restrictReturnColumns(['id', 'name', 'email'])
    .restrictInsertColumns(['name', 'email'])
    .build();

// Configuration provides type safety for all queries
const queries = createFeatureQueries('user', tableConfig).registerAllStandard();
```

### 2. Simplified API

**Old Approach** (all-or-nothing):

```typescript
.registerCoreQueries(table, {
  idFields: ['id'],
  userIdField: 'userId',
  returnColumns: ['id', 'name', 'email'],
  allowedUpsertColumns: ['name', 'email'],
  softDelete: true,
  queryConfig: { ... }
})
```

**New Approach** (clean and simple):

```typescript
.registerAllStandard({ defaultFilters: { isActive: true } })
// Or use withStandard for selective queries
```

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

## Architecture

```text
FeatureQueryBuilder (Main Builder)
├── registerAllStandard() - Add all 6 CRUD queries (create, createMany, getById, getMany, updateById, removeById)
├── withStandard() - Add selective standard queries via callback
├── addQuery() - Add custom query with error handling
└── pick() - Select subset of queries

Layer Flow:
Feature Query Builder → Table Operations → Database
```

### What It Does Behind the Scenes

```typescript
// You call:
tagQueries.queries.create({ data: { name: 'Work' }, userId: 'user-123' });

// Feature Query Builder:
// 1. Extracts userId from input
// 2. Merges userId into data: { name: 'Work', userId: 'user-123' }
// 3. Calls Table Operations: tableOps.createRecord({ data: {...} })

// You call:
tagQueries.queries.getById({ ids: { id: 'tag-1' }, userId: 'user-123' });

// Feature Query Builder:
// 1. Extracts userId as an identifier
// 2. Builds identifier array: [{ field: 'userId', value: 'user-123' }, { field: 'id', value: 'tag-1' }]
// 3. Applies defaultFilters if configured
// 4. Calls Table Operations: tableOps.getFirstRecord({ identifiers: [...] })
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

### Basic Example - All Standard Queries

```typescript
import { createFeatureQueries } from '@/server/lib/db/query/builder/feature-query';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { userTable } from '@/server/db/tables';

// 1. Create table configuration
const userTableConfig = createFeatureTableConfig(userTable)
    .restrictReturnColumns(['id', 'name', 'email', 'role', 'createdAt'])
    .restrictInsertColumns(['name', 'email', 'role'])
    .build();

// 2. Create queries with all standard CRUD operations
export const userQueries = createFeatureQueries('user', userTableConfig).registerAllStandard({
    defaultFilters: { isActive: true },
});

// 3. Use the queries
const user = await userQueries.queries.create({
    data: { name: 'John', email: 'john@example.com' },
    userId: 'current-user-id',
});

const users = await userQueries.queries.getMany({
    userId: 'current-user-id',
});
```

### Advanced Example - Selective Standard + Custom Queries

```typescript
// Only add specific standard queries + custom queries
export const userQueries = createFeatureQueries('user', userTableConfig)
    .withStandard((b) => b.create().getById().done())
    .addQuery('findByEmail', ({ tableOps, tableConfig }) => ({
        operation: 'find user by email',
        fn: async (input: { email: string; userId: string }) => {
            return await tableOps.getFirstRecord({
                columns: tableConfig.getReturnColumns(),
                identifiers: [
                    { field: 'email', value: input.email },
                    { field: 'userId', value: input.userId },
                ],
            });
        },
    }));
```

### Table Configuration

Configure table behavior once, use everywhere:

```typescript
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';

const tableConfig = createFeatureTableConfig(userTable)
    // Define which columns can be returned (security)
    .restrictReturnColumns(['id', 'name', 'email', 'createdAt'])

    // Define which columns can be inserted (security)
    .restrictInsertColumns(['name', 'email'])

    // Define which columns can be updated (security)
    .restrictUpdateColumns(['name', 'email'])

    .build();
```

### Standard Queries Configuration

```typescript
// Add all standard queries with default filters
.registerAllStandard({
    defaultFilters: {
        isActive: true,
        deletedAt: null
    }
})

// Or add selective standard queries
.withStandard((b) =>
    b.create()
     .getById()
     .getMany()
     .done()
)
```

### Custom Queries

For operations that don't fit standard patterns:

```typescript
.addQuery('archive', ({ tableOps, tableConfig }) => ({
    operation: 'archive user',
    fn: async (input: { id: string; userId: string }) => {
        return await tableOps.updateRecord({
            data: { archivedAt: new Date() },
            identifiers: [
                { field: 'id', value: input.id },
                { field: 'userId', value: input.userId }
            ],
            returnColumns: tableConfig.getReturnColumns()
        });
    }
}))

// Custom queries receive:
// - tableOps: TableOperationsBuilder instance for database operations
// - tableConfig: FeatureTableConfig instance for column restrictions
```

### Type Inference

The builder automatically infers types from table configuration:

```typescript
const tableConfig = createFeatureTableConfig(userTable)
    .restrictReturnColumns(['id', 'name', 'email'])
    .restrictInsertColumns(['name', 'email'])
    .build();

const queries = createFeatureQueries('user', tableConfig).registerAllStandard();

// TypeScript knows:
const result = await queries.queries.create({
    data: {
        name: 'John', // ✅ Allowed (in restrictInsertColumns)
        email: 'john@example.com', // ✅ Allowed
        // password: '123'  // ❌ Not in restrictInsertColumns
    },
    userId: 'user-id', // ✅ Required if table has userId column
});

// Result type inferred from restrictReturnColumns:
// { id: string, name: string, email: string }
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
        queryConfig: {
            getMany: {
                filters: (filters, f) => [f.ilike('name', filters?.search)],
            },
        },
    });

// Problems:
// ❌ Complex nested config object
// ❌ Hard to understand configuration flow
// ❌ Type inference sometimes fails
// ❌ Double error handling
```

**New Approach** (`/src/server/lib/db/query/builder/feature-query/`):

```typescript
// Clean, simple configuration
const tagTableConfig = createFeatureTableConfig(tagTable)
    .restrictReturnColumns(['id', 'name', 'color'])
    .restrictInsertColumns(['name', 'color'])
    .build();

export const tagQueries = createFeatureQueries('tag', tagTableConfig)
    .registerAllStandard({
        defaultFilters: { isActive: true }
    })
    .addQuery('findByName', ({ tableOps, tableConfig }) => ({
        fn: async (input) => { ... }
    }));

// Benefits:
// ✅ Table configuration separated from queries
// ✅ Clear, simple API
// ✅ Perfect type inference
// ✅ Single error handling layer
// ✅ Easy to add custom queries
```

### Feature Comparison

| Feature                  | Legacy | New    | Notes                                     |
| ------------------------ | ------ | ------ | ----------------------------------------- |
| **Table Configuration**  | ❌     | ✅     | Separate config system                    |
| **Simple API**           | ❌     | ✅     | `registerAllStandard()` vs complex config |
| **Type Inference**       | ⚠️     | ✅     | Sometimes fails vs always works           |
| **Error Handling**       | ⚠️     | ✅     | Double wrapped vs single layer            |
| **Code Complexity**      | High   | Low    | Complex config vs simple methods          |
| **IntelliSense Support** | ⚠️     | ✅     | Poor vs excellent                         |
| **Maintainability**      | Low    | High   | Hard to modify vs easy to extend          |
| **Learning Curve**       | Steep  | Gentle | Complex vs simple                         |

## Migration Guide

### Strategy

**Recommendation**: Adopt new approach for new features, migrate existing features incrementally.

### Step-by-Step Migration

#### 1. Identify Current Usage

**Before** (`/features/tag/server/db/queries.ts`):

```typescript
import { createFeatureQueries } from '@/server/lib/db/query/feature-queries';

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
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';

// 1. Create table configuration
const tagTableConfig = createFeatureTableConfig(tagTable)
    .restrictReturnColumns(['id', 'name', 'color', 'userId'])
    .restrictInsertColumns(['name', 'color'])
    .build();

// 2. Create queries
export const tagQueries = createFeatureQueries('tag', tagTableConfig).registerAllStandard({
    defaultFilters: { isActive: true },
});
```

#### 3. Service Layer Works Unchanged

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

### 1. Configure Table Security First

```typescript
// ✅ Always restrict columns for security
const tableConfig = createFeatureTableConfig(userTable)
    .restrictReturnColumns(['id', 'name', 'email']) // Never return passwords
    .restrictInsertColumns(['name', 'email']) // Control what can be created
    .restrictUpdateColumns(['name', 'email']) // Control what can be updated
    .build();
```

### 2. Use registerAllStandard for Most Cases

```typescript
// ✅ Simple and covers all CRUD operations
.registerAllStandard({
    defaultFilters: { isActive: true }
})

// Only use withStandard if you truly need selective queries
```

### 3. Leverage TableConfig in Custom Queries

```typescript
// ✅ Use tableConfig for consistent column restrictions
.addQuery('findActive', ({ tableOps, tableConfig }) => ({
    fn: async (input) => {
        return await tableOps.getManyRecords({
            identifiers: [{ field: 'userId', value: input.userId }],
            filters: [eq(table.isActive, true)],
            columns: tableConfig.getReturnColumns()  // ✅ Respects restrictions
        });
    }
}))

// ❌ Don't hardcode columns
columns: ['id', 'name', 'password']  // Bypasses security restrictions!
```

### 4. Document Complex Operations

```typescript
.addQuery('complexOperation', ({ tableOps, tableConfig }) => ({
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

### 5. Apply Default Filters Consistently

```typescript
// ✅ Use defaultFilters for global constraints
.registerAllStandard({
    defaultFilters: {
        isActive: true,  // Never fetch inactive records
        deletedAt: null  // Soft delete support
    }
})
```

## Standard Queries Available

All queries are available via `registerAllStandard()`:

- ✅ **create** - Create a single record
- ✅ **createMany** - Bulk insert records
- ✅ **getById** - Fetch one record by ID
- ✅ **getMany** - Fetch multiple records with filtering/pagination
- ✅ **updateById** - Update a single record
- ✅ **removeById** - Delete/soft-delete a record

## API Stability

The current API is **stable** for production use. Standard queries are fully implemented and tested.

## Support

For questions or issues:

- Check existing queries in `/features/*/server/db/queries.ts`
- Review test examples in `/server/lib/db/query/builder/feature-query/__tests__/`
- Ask in team chat

## Related Documentation

- [Table Operations](../../table-operations/README.md) - Low-level database operations
- [Legacy Feature Queries](../../feature-queries/README.md) - Old approach (deprecated)
- [Service Builder](../../../service/builder/README.md) - Service layer wrapping queries
