# Feature Table Config Builder

A type-safe, fluent configuration system for Drizzle ORM tables that generates Zod validation schemas and TypeScript types for CRUD operations.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Advanced Usage](#advanced-usage)
- [Type Inference](#type-inference)
- [Best Practices](#best-practices)
- [Examples](#examples)

## Overview

The Feature Table Config Builder provides a declarative way to configure database tables with:

- **Type-safe schemas** for insert, update, and select operations
- **Row-level security** (RLS) via userId configuration
- **Composite primary keys** support
- **Field-level access control** (control which fields can be modified/returned)
- **Filtering, Ordering, and Pagination** configuration
- **Zero type assertions** using sentinel TEmptySchema pattern
- **Immutable configurations** for predictable behavior

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    Entry Point                              │
│  createFeatureTableConfig(table) → FeatureTableConfigBuilder│
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              FeatureTableConfigBuilder                      │
│  - Fluent API methods (.setIds, .enableFiltering, etc.)     │
│  - Builds configuration step by step                        │
│  - Returns new builder instance on each method call         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ .build()
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               FeatureTableConfig (Immutable)                │
│  - Contains all Zod schemas (id, userId, filters, etc.)     │
│  - Readonly configuration                                   │
│  - Helper methods to access schemas                         │
│  - Type guards (hasIds, hasFiltersSchema)                   │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```text
feature-config/
├── core.ts           # FeatureTableConfig & Builder classes
├── types.ts          # Type helpers & inference utilities
├── utils.ts          # Helper functions (tableHasField, etc.)
├── schemas.ts        # Common schemas (ordering, pagination)
├── factory.ts        # createFeatureTableConfig entry point
├── example.ts        # Usage examples
├── index.ts          # Public exports
└── README.md         # This file
```

## Key Features

### 1. **Zero-Assertion Type Safety**

Uses `TEmptySchema` sentinel instead of `undefined` to eliminate type assertions:

```typescript
// Instead of this (with type assertions):
const idSchema: z.ZodObject<IdShape> | undefined = hasIds ? schema : undefined;

// We use this (zero assertions):
const idSchema: z.ZodObject<IdShape | TEmptySchema> = hasIds ? schema : z.object({});
```

### 2. **Immutable Configuration**

The final `FeatureTableConfig` is readonly, preventing accidental mutations:

```typescript
const config = createFeatureTableConfig(table).build();
config.table = otherTable; // ❌ Error: readonly property
```

### 3. **Fluent Builder API**

Chain configuration methods for intuitive setup:

```typescript
const config = createFeatureTableConfig(tagTable)
    .setIds(['id'])
    .setUserId('userId')
    .enableFiltering({ name: z.string(), status: z.enum(['active', 'archived']) })
    .enableOrdering(['name', 'createdAt'])
    .enablePagination()
    .build();
```

### 4. **Structural Type Inference**

Uses structural typing instead of nominal typing for better flexibility:

```typescript
// Works with any config that has the right shape
type Input = InferCreateInput<{
    insertDataSchema: z.ZodObject<any>;
    userIdSchema: z.ZodObject<any>;
}>;
```

## Quick Start

### Basic Example

```typescript
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { tag } from '@/server/db/tables';
import { z } from 'zod';

// Step 1: Create config
const tagConfig = createFeatureTableConfig(tag)
    .setIds(['id']) // Primary key
    .setUserId('userId') // RLS field
    .restrictUpsertFields(['name', 'color']) // Writable fields
    .restrictReturnColumns(['id', 'name']) // Returned columns
    .enableFiltering({
        // Allow filtering by name
        name: z.string(),
    })
    .enableOrdering(['createdAt', 'name']) // Allow ordering
    .enablePagination() // Allow pagination
    .build();

// Step 2: Access schemas directly or build input schemas
const insertSchema = tagConfig.insertDataSchema;
const createSchema = tagConfig.buildCreateInputSchema();
const manySchema = tagConfig.buildManyInputSchema(); // Includes filters/ordering/pagination

// Step 3: Use in operations
const createInput = createSchema.parse({
    data: { name: 'Work', color: '#ff0000' },
    userId: 'user-123',
});
```

### With Query Builders

```typescript
import { createFeatureQueries } from '@/server/lib/db/query';

const tagQueries = createFeatureQueries('tag', tagConfig).registerAllStandard({
    defaultFilters: { isActive: true },
});

// Use in handlers
const newTag = await tagQueries.queries.create({
    data: { name: 'Personal', color: '#00ff00' },
    userId: currentUser.id,
});

const tags = await tagQueries.queries.getMany({
    userId: currentUser.id,
    filters: { name: 'Personal' },
    ordering: [{ field: 'createdAt', direction: 'desc' }],
    pagination: { page: 1, pageSize: 20 },
});
```

## Core Concepts

### 1. **ID & User ID Configuration**

Defines primary keys and row-level security fields.

```typescript
.setIds(['id'])              // Primary key
.setUserId('userId')         // RLS field
```

### 2. **Data Schemas (Insert/Update)**

Control which fields can be inserted or updated.

```typescript
.restrictUpsertFields(['name', 'color'])          // Same for insert/update
.restrictInsertFields(['email', 'role'])          // Insert only
.restrictUpdateFields(['email'])                  // Update only (role is immutable)
```

### 3. **Return Columns**

Specify which columns are returned in query results.

```typescript
.restrictReturnColumns(['id', 'name', 'color'])
```

### 4. **List Operations (Filtering, Ordering, Pagination)**

Configure how lists of records can be retrieved.

```typescript
.enableFiltering({ name: z.string() })            // Custom filters
.enableOrdering(['createdAt', 'name'])            // Sortable fields
.enablePagination()                               // Page/PageSize
```

### 5. **Base Schema**

The foundation schema all operations derive from.

```typescript
.pickBaseSchema(['name', 'description'])          // Start with these fields
.omitBaseSchema(['internalField'])                // Exclude these fields
```

## API Reference

### Factory Function

#### `createFeatureTableConfig(table)`

Entry point for creating a table configuration.

```typescript
const config = createFeatureTableConfig(myTable);
```

---

### Builder Methods

#### Configuration Methods

#### `.setIds(fields)`

Define primary key field(s).

```typescript
.setIds(['id'])
.setIds(['tenantId', 'id'])  // Composite key
```

#### `.setUserId(field)`

Define user ID field for RLS.

```typescript
.setUserId('userId')
```

---

#### List Configuration Methods

#### `.enableFiltering(schema)`

Define Zod schema for filtering. Keys don't have to match table columns (can be virtual/computed).

```typescript
.enableFiltering({
    name: z.string(),
    status: z.enum(['active', 'archived']),
    minPrice: z.number()
})
```

#### `.enableOrdering(columns)`

Enable ordering for specific columns.

```typescript
.enableOrdering(['name', 'createdAt', 'price'])
// Results in schema: { field: 'name'|'createdAt'|'price', direction: 'asc'|'desc' }[]
```

#### `.enablePagination()`

Add standard pagination fields (`page`, `pageSize`).

```typescript
.enablePagination()
```

---

#### Field Restriction Methods

#### `.restrictUpsertFields(fields)`

Restrict same fields for both insert and update.

#### `.restrictInsertFields(fields)`

Restrict fields allowed for insert only.

#### `.restrictUpdateFields(fields)`

Restrict fields allowed for update only.

#### `.restrictReturnColumns(fields)`

Restrict columns returned in queries.

#### `.allowAllFields()`

Reset to allow all fields for insert/update operations.

---

#### Base Schema Methods

#### `.pickBaseSchema(fields)`

Restrict base schema to specific fields.

#### `.omitBaseSchema(fields)`

Exclude fields from base schema.

#### `.transformBaseSchema(transformer)`

Transform the base schema using a custom function.

```typescript
.transformBaseSchema(schema => schema.extend({ extra: z.string() }))
```

---

#### `.build()`

Build final immutable configuration.

```typescript
const config = builder.build();
```

---

### Config Instance Methods

#### `.buildManyInputSchema()`

Build schema for list operations (getMany). Combines userId, filters, ordering, and pagination.

```typescript
const schema = config.buildManyInputSchema();
// Result: { userId?, filters?, ordering?, pagination? }
```

#### `.buildCreateInputSchema()`

Build schema for create operations (data + userId).

#### `.buildUpdateInputSchema()`

Build schema for update operations (data + ids + userId).

#### `.buildIdentifierSchema()`

Build schema for ID-based operations (ids + userId).

#### `.getUserIdFieldName()`, `.getIdsFieldNames()`

Get configured field names.

#### `.validateDataForTableInsert(input)`

Validate and format data for DB insert.

#### `.validateUpdateDataForTableUpdate(input)`

Validate and format data for DB update.

---

## Type Inference

### `InferCreateInput<TConfig>`

Input type for create operations.

### `InferUpdateInput<TConfig>`

Input type for update operations.

### `InferManyFiltersInput<TConfig>`

Input type for filters.

### `InferIdsInput<TConfig>`

Input type for IDs.

### `InferReturnColumns<TConfig>`

Union of return column names.

---

## Best Practices

### 1. **Always Configure Security**

Always set IDs, userId, and return columns to ensure RLS and data privacy.

```typescript
createFeatureTableConfig(table)
    .setIds(['id'])
    .setUserId('userId')
    .restrictReturnColumns(['id', 'publicData']);
```

### 2. **Use Strict Filters**

Only enable filtering on fields that have indexes or are safe to query.

```typescript
.enableFiltering({
    // ✅ Good: Indexed field
    status: z.enum(['active', 'pending']),
    // ❌ Bad: Unindexed text search on huge table
    description: z.string()
})
```

### 3. **Validate Early**

Use the config's validation methods before hitting the database.

```typescript
const validated = config.validateDataForTableInsert(input);
await db.insert(table).values(validated);
```

## License

Part of the accntu project.
