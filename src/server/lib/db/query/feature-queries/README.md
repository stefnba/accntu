# Feature Queries

The **Feature Queries** layer provides query orchestration for our feature-based project. It bridges our feature schemas with standard and custom table operations and simplifies input type safety.

## Purpose

- **Extract userId** from input and pass it to table operations
- **Apply feature-specific filters** (search, status, etc.)
- **Map schema types** to database operations
- **Handle pagination** and ordering logic

## When to Use

Use Feature Queries when registering core CRUD queries for a feature table.

## Example

```typescript
import { tagTable } from '@/features/tag/server/db/tables';
import { tagSchemas } from '@/features/tag/schemas';
import { createFeatureQueries } from '@/server/lib/db';

// Register core queries (create, getById, getMany, updateById, removeById)
export const tagQueries = createFeatureQueries('tag')
    .registerSchema(tagSchemas)
    .registerCoreQueries(tagTable, {
        // Which fields identify a single record
        idFields: ['id'],

        // Which field identifies the user (for security)
        userIdField: 'userId',

        // Default filters (e.g., only active records)
        defaultIdFilters: {
            isActive: true,
        },

        // Which columns can be created/updated
        allowedUpsertColumns: ['name', 'color', 'description'],

        // Feature-specific configurations
        queryConfig: {
            getMany: {
                // Custom filters for getMany operation
                filters: (filters, f) => [f.ilike('name', filters?.search)],
            },
        },
    });

// Now you can use the queries
const tag = await tagQueries.queries.create({
    data: { name: 'Work', color: '#FF0000' },
    userId: 'user-123',
});

const tags = await tagQueries.queries.getMany({
    userId: 'user-123',
    filters: { search: 'work' },
    pagination: { page: 1, pageSize: 10 },
});
```

## What It Does Behind the Scenes

```typescript
// You call:
tagQueries.queries.create({ data: { name: 'Work' }, userId: 'user-123' });

// Feature Queries Layer:
// 1. Extracts userId from input
// 2. Merges userId into data: { name: 'Work', userId: 'user-123' }
// 3. Calls Table Operations: tableOps.createRecord({ data: {...} })

// You call:
tagQueries.queries.getById({ ids: { id: 'tag-1' }, userId: 'user-123' });

// Feature Queries Layer:
// 1. Extracts userId as an identifier
// 2. Builds identifier array: [{ field: 'userId', value: 'user-123' }, { field: 'id', value: 'tag-1' }]
// 3. Calls Table Operations: tableOps.getFirstRecord({ identifiers: [...] })
```

## Relationship to Table Operations

```text
Feature Queries (Feature-Level)
    ↓
    - Handles userId extraction/merging
    - Applies feature filters
    - Maps pagination
    ↓
Table Operations (Generic Database Operations)
    ↓
    - Builds SQL queries
    - Handles conflict resolution
    - Executes database operations
```

## Architecture Classes

- **`FeatureQueryBuilder`**: Main class for building feature queries
- **`createFeatureQueries`**: Factory function for easy instantiation with optional feature name parameter

## See Also

- **Table Operations**: [../table-operations/README.md](../table-operations/README.md) - Low-level database operations
