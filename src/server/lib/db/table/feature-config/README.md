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
│  - Fluent API methods (.setIds, .setUserId, etc.)           │
│  - Builds configuration step by step                        │
│  - Returns new builder instance on each method call         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ .build()
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               FeatureTableConfig (Immutable)                │
│  - Contains all Zod schemas (id, userId, insert, etc.)      │
│  - Readonly configuration                                   │
│  - Helper methods to access schemas                         │
│  - Type guards (hasIds, hasUserId)                          │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```text
feature-config/
├── core.ts           # FeatureTableConfig & Builder classes
├── types.ts          # Type helpers & inference utilities
├── utils.ts          # Helper functions (tableHasField, etc.)
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
    .restrictUpsertFields(['name', 'description', 'color'])
    .restrictReturnColumns(['id', 'name', 'color', 'userId'])
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

// Step 1: Create config
const tagConfig = createFeatureTableConfig(tag)
    .setIds(['id']) // Primary key
    .setUserId('userId') // RLS field
    .restrictUpsertFields(['name', 'color']) // Writable fields
    .restrictReturnColumns(['id', 'name']) // Returned columns
    .build();

// Step 2: Access schemas directly or build input schemas
const insertSchema = tagConfig.insertDataSchema;
const createSchema = tagConfig.buildCreateInputSchema();
const updateSchema = tagConfig.buildUpdateInputSchema();

// Step 3: Use in operations
const createInput = createSchema.parse({
    data: { name: 'Work', color: '#ff0000' },
    userId: 'user-123',
});

const updateInput = updateSchema.parse({
    data: { name: 'Updated Work' },
    ids: { id: 'tag-456' },
    userId: 'user-123',
});
```

### With Query Builders

```typescript
import { createFeatureQueries } from '@/server/lib/db/query';

const tagQueries = createFeatureQueries('tag', tagConfig)
    .standardQueries()
    .create()
    .getById()
    .update()
    .delete()
    .done();

// Use in handlers
const newTag = await tagQueries.create({
    data: { name: 'Personal', color: '#00ff00' },
    userId: currentUser.id,
});
```

## Core Concepts

### 1. **ID Schema**

Defines primary key field(s) for record identification.

```typescript
// Single ID
.setIds(['id'])

// Composite key
.setIds(['tenantId', 'id'])

// No IDs (rare, for bulk operations)
.removeIds()
```

**Use Cases:**

- getById operations
- Update/delete by ID
- Relationship lookups

### 2. **User ID Schema**

Defines the field used for row-level security (RLS).

```typescript
// Standard userId field
.setUserId('userId')

// Alternative field name
.setUserId('ownerId')

// No RLS (public table)
.removeUserId()
```

**Use Cases:**

- Filter queries by user
- Enforce data ownership
- Multi-tenant applications

### 3. **Data Schemas**

Control which fields can be inserted/updated.

#### Upsert Data (Same fields for insert & update)

```typescript
.restrictUpsertFields(['name', 'description', 'color'])
```

#### Separate Insert & Update

```typescript
.restrictInsertFields(['name', 'email', 'role'])  // Can set role on create
.restrictUpdateFields(['name', 'email'])          // Can't change role
```

**Use Cases:**

- Protect system fields (createdAt, id)
- Immutable fields after creation
- Audit trail preservation

### 4. **Return Columns**

Specify which columns are returned in query results.

```typescript
.restrictReturnColumns(['id', 'name', 'color', 'createdAt'])
```

**Use Cases:**

- Exclude sensitive fields (password hashes)
- Optimize query performance
- API response shaping

### 5. **Base Schema**

The foundation schema all operations derive from.

```typescript
// Pick only specific fields for base
.pickBaseSchema(['name', 'description', 'color'])

// Exclude fields from base
.omitBaseSchema(['internalField', 'systemField'])
```

**Use Cases:**

- Pre-filter available fields
- Consistent field sets across operations
- Gradual restriction application

## API Reference

### Factory Function

#### `createFeatureTableConfig(table)`

Entry point for creating a table configuration.

```typescript
const config = createFeatureTableConfig(myTable);
```

**Parameters:**

- `table` - Drizzle table definition

**Returns:** `FeatureTableConfigBuilder` instance

---

### Builder Methods

#### Configuration Methods

#### `.setIds(fields)`

Define primary key field(s).

```typescript
.setIds(['id'])
.setIds(['tenantId', 'id'])  // Composite key
```

**Parameters:**

- `fields` - Array of column names

**Returns:** New builder instance

---

#### `.removeIds()`

Clear ID configuration.

```typescript
.removeIds()
```

**Returns:** New builder instance with empty ID schema

---

#### `.setUserId(field)`

Define user ID field for RLS.

```typescript
.setUserId('userId')
```

**Parameters:**

- `field` - Column name containing user/owner ID

**Returns:** New builder instance

---

#### `.removeUserId()`

Clear user ID configuration.

```typescript
.removeUserId()
```

**Returns:** New builder instance with empty userId schema

---

#### Field Restriction Methods

#### `.restrictUpsertFields(fields)`

Restrict same fields for both insert and update.

```typescript
.restrictUpsertFields(['name', 'description', 'color'])
```

**Parameters:**

- `fields` - Array of field names

**Returns:** New builder instance

---

#### `.restrictInsertFields(fields)`

Restrict fields allowed for insert only.

```typescript
.restrictInsertFields(['name', 'email', 'role'])
```

**Parameters:**

- `fields` - Array of field names

**Returns:** New builder instance

---

#### `.restrictUpdateFields(fields)`

Restrict fields allowed for update only.

```typescript
.restrictUpdateFields(['name', 'email'])
```

**Parameters:**

- `fields` - Array of field names

**Returns:** New builder instance

---

#### `.restrictReturnColumns(fields)`

Restrict columns returned in queries.

```typescript
.restrictReturnColumns(['id', 'name', 'email'])
```

**Parameters:**

- `fields` - Array of column names

**Returns:** New builder instance

**Throws:** Error if fields array is empty or contains duplicates

---

#### `.pickBaseSchema(fields)`

Restrict base schema to specific fields.

```typescript
.pickBaseSchema(['name', 'description', 'color'])
```

**Parameters:**

- `fields` - Array of field names to keep

**Returns:** New builder instance

---

#### `.omitBaseSchema(fields)`

Exclude fields from base schema.

```typescript
.omitBaseSchema(['internalField', 'systemField'])
```

**Parameters:**

- `fields` - Array of field names to exclude

**Returns:** New builder instance

---

#### `.allowAllFields()`

Reset to allow all fields for insert/update operations.

```typescript
.allowAllFields()
```

**Returns:** New builder instance

---

#### `.build()`

Build final immutable configuration.

```typescript
const config = builder.build();
```

**Returns:** `FeatureTableConfig` instance

---

### Config Instance Properties

Direct access to all schemas via readonly properties:

```typescript
config.table; // Drizzle table definition
config.idSchema; // ID fields schema
config.userIdSchema; // User ID field schema
config.baseSchema; // Base schema (all available fields)
config.insertDataSchema; // Insert data schema
config.updateDataSchema; // Update data schema (partial)
config.selectReturnSchema; // Select return schema
```

### Config Instance Methods

#### `.getUserIdFieldName()`

Get the user ID field name.

```typescript
// Best practice: use type guard first
if (config.hasUserId()) {
    const userIdField = config.getUserIdFieldName(); // 'userId'
}

// Direct access (returns undefined at runtime if not configured)
const userIdField = config.getUserIdFieldName(); // Type: 'userId' | never
```

**Returns:** Field name (or `never` type if not configured). At runtime, returns `undefined` if not configured.

---

#### `.getIdsFieldNames()`

Get array of ID field names.

```typescript
// Best practice: use type guard first
if (config.hasIds()) {
    const idFields = config.getIdsFieldNames(); // ['id'] or ['tenantId', 'id']
}

// Direct access (returns empty array at runtime if not configured)
const idFields = config.getIdsFieldNames(); // Type: Array<'id'> | Array<never>
```

**Returns:** Array of field names (or `Array<never>` type if not configured). At runtime, returns empty array if not configured.

---

#### `.getReturnColumns()`

Get array of return column names.

```typescript
const columns = config.getReturnColumns(); // ['id', 'name', 'email']
```

---

#### `.hasIds()`

Type guard to check if IDs are configured.

```typescript
if (config.hasIds()) {
    // TypeScript knows idSchema is non-empty
    const ids = config.idSchema;
}
```

---

#### `.hasUserId()`

Type guard to check if userId is configured.

```typescript
if (config.hasUserId()) {
    // TypeScript knows userIdSchema is non-empty
    const userId = config.userIdSchema;
}
```

---

#### `.buildCreateInputSchema()`

Build Zod schema for create operations.

```typescript
const schema = config.buildCreateInputSchema();
// Returns: z.object({ data: ..., userId: ... })
```

---

#### `.buildCreateManyInputSchema()`

Build Zod schema for bulk create operations.

```typescript
const schema = config.buildCreateManyInputSchema();
// Returns: z.object({ data: z.array(...), userId: ... })
```

---

#### `.buildUpdateInputSchema()`

Build Zod schema for update operations.

```typescript
const schema = config.buildUpdateInputSchema();
// Returns: z.object({ data: ..., ids: ..., userId: ... })
```

---

#### `.buildIdentifierSchema()`

Build Zod schema for ID-based operations.

```typescript
const schema = config.buildIdentifierSchema();
// Returns: z.object({ ids: ..., userId: ... })
```

---

#### `.validateDataForTableInsert(input)`

Validate input for table insert.

```typescript
const validated = config.validateDataForTableInsert({
    data: { name: 'Test' },
    userId: 'user-123',
});
```

**Throws:** `AppErrors.validation` if validation fails

---

#### `.validateUpdateDataForTableUpdate(input)`

Validate input for table update.

```typescript
const validated = config.validateUpdateDataForTableUpdate({
    name: 'Updated',
});
```

**Throws:** `AppErrors.validation` if validation fails

---

## Type Inference

The system provides powerful type inference helpers:

### `InferCreateInput<TConfig>`

Infer the input type for create operations.

```typescript
type CreateInput = InferCreateInput<typeof tagConfig>;
// Result: { data: { name: string; color?: string }; userId: string }
```

---

### `InferUpdateInput<TConfig>`

Infer the input type for update operations.

```typescript
type UpdateInput = InferUpdateInput<typeof tagConfig>;
// Result: { data: { name?: string; color?: string }; ids: { id: string }; userId: string }
```

---

### `InferIdsInput<TConfig>`

Infer just the IDs portion.

```typescript
type IdsInput = InferIdsInput<typeof tagConfig>;
// Result: { ids: { id: string } }
```

---

### `InferUserIdInput<TConfig>`

Infer just the userId portion.

```typescript
type UserIdInput = InferUserIdInput<typeof tagConfig>;
// Result: { userId: string }
```

---

### `InferReturnColumns<TConfig>`

Infer return column names as union.

```typescript
type Columns = InferReturnColumns<typeof tagConfig>;
// Result: "id" | "name" | "color" | "userId"
```

---

### `InferTableFromConfig<TConfig>`

Infer the underlying Drizzle table type.

```typescript
type Table = InferTableFromConfig<typeof tagConfig>;
// Result: PgTableWithColumns<{...}>
```

---

### `InferOptionalSchema<T>`

Check if a schema is configured, returning `undefined` if empty.

```typescript
type IdSchema = InferOptionalSchema<typeof config.idSchema>;
// Result: { id: string } | undefined
```

---

## Advanced Usage

### Composite Keys

```typescript
const junctionConfig = createFeatureTableConfig(tagToTransaction)
    .setIds(['tagId', 'transactionId'])
    .setUserId('userId')
    .restrictUpsertFields(['metadata'])
    .build();

// Usage
const input: InferIdsInput<typeof junctionConfig> = {
    ids: {
        tagId: 'tag-123',
        transactionId: 'txn-456',
    },
};
```

### Different Insert/Update Fields

```typescript
const userConfig = createFeatureTableConfig(user)
    .setIds(['id'])
    .restrictInsertFields(['email', 'password', 'role']) // Can set role on create
    .restrictUpdateFields(['email', 'displayName']) // Can't update role/password
    .build();
```

### Public Tables (No RLS)

```typescript
const publicConfig = createFeatureTableConfig(publicData)
    .setIds(['id'])
    .removeUserId() // No userId filtering
    .restrictUpsertFields(['title', 'content'])
    .build();

type Input = InferCreateInput<typeof publicConfig>;
// Result: { data: { title: string; content: string } }
// No userId field!
```

### Granular Base Schema Control

```typescript
const config = createFeatureTableConfig(table)
    .omitBaseSchema(['transactionCount']) // Exclude computed field
    .pickBaseSchema(['name', 'description']) // Then pick specific fields
    .restrictUpsertFields(['name', 'description'])
    .build();
```

### Progressive Configuration

```typescript
// Start with basic config
let config = createFeatureTableConfig(table).setIds(['id']).setUserId('userId');

// Add more restrictions later
if (isRestrictedMode) {
    config = config.restrictUpsertFields(['name']); // Only name editable
} else {
    config = config.allowAllFields(); // All fields editable
}

const finalConfig = config.build();
```

## Best Practices

### 1. **Always Set IDs and UserId**

```typescript
// ✅ Good
const config = createFeatureTableConfig(table).setIds(['id']).setUserId('userId').build();

// ❌ Bad (missing configurations)
const config = createFeatureTableConfig(table).build();
```

### 2. **Restrict Writable Fields**

Don't allow modification of system fields:

```typescript
// ✅ Good
.restrictUpsertFields(['name', 'description', 'color'])

// ❌ Bad (allows modifying system fields)
.allowAllFields()
```

### 3. **Separate Insert/Update When Needed**

```typescript
// ✅ Good (role immutable after creation)
.restrictInsertFields(['name', 'email', 'role'])
.restrictUpdateFields(['name', 'email'])
```

### 4. **Limit Return Columns**

Exclude sensitive or unnecessary fields:

```typescript
// ✅ Good
.restrictReturnColumns(['id', 'name', 'email', 'createdAt'])

// ❌ Bad (returns all fields including sensitive ones)
// (omitting restrictReturnColumns returns all by default)
```

### 5. **Use Type Inference Helpers**

```typescript
// ✅ Good
type CreateInput = InferCreateInput<typeof config>;

const create = (input: CreateInput) => {
    // Fully type-safe
};

// ❌ Bad (manual type definition, prone to drift)
type CreateInput = {
    data: { name: string; color: string };
    userId: string;
};
```

### 6. **Validate Early**

```typescript
// ✅ Good
const validated = config.validateDataForTableInsert(input);
await db.insert(table).values(validated);

// ❌ Bad (skipping validation)
await db.insert(table).values(input);
```

### 7. **Name Configs Consistently**

```typescript
// ✅ Good
const tagConfig = createFeatureTableConfig(tag)...;
const userConfig = createFeatureTableConfig(user)...;

// ❌ Bad
const config1 = createFeatureTableConfig(tag)...;
const c = createFeatureTableConfig(user)...;
```

## Examples

### Example 1: Simple Tag Table

```typescript
import { tag } from '@/server/db/tables';
import { createFeatureTableConfig } from './feature-config';

export const tagConfig = createFeatureTableConfig(tag)
    .setIds(['id'])
    .setUserId('userId')
    .omitBaseSchema(['transactionCount']) // Computed field, not writable
    .restrictUpsertFields(['name', 'description', 'color'])
    .restrictReturnColumns(['id', 'name', 'color', 'userId'])
    .build();

export type TagCreateInput = InferCreateInput<typeof tagConfig>;
export type TagUpdateInput = InferUpdateInput<typeof tagConfig>;
```

### Example 2: Junction Table (Composite Key)

```typescript
import { tagToTransaction } from '@/server/db/tables';
import { createFeatureTableConfig } from './feature-config';

export const tagToTransactionConfig = createFeatureTableConfig(tagToTransaction)
    .setIds(['tagId', 'transactionId']) // Composite key
    .setUserId('userId')
    .restrictUpsertFields(['metadata'])
    .build();

// Get both ID field names
const idFields = tagToTransactionConfig.getIdsFieldNames();
// Result: ['tagId', 'transactionId']
```

### Example 3: Public Table (No RLS)

```typescript
import { settings } from '@/server/db/tables';
import { createFeatureTableConfig } from './feature-config';

export const settingsConfig = createFeatureTableConfig(settings)
    .setIds(['id'])
    .removeUserId() // No RLS
    .restrictUpsertFields(['key', 'value', 'description'])
    .build();

export type SettingsCreateInput = InferCreateInput<typeof settingsConfig>;
// Result: { data: { key: string; value: string; description?: string } }
// No userId!
```

### Example 4: User Table (Different Insert/Update)

```typescript
import { user } from '@/server/db/tables';
import { createFeatureTableConfig } from './feature-config';

export const userConfig = createFeatureTableConfig(user)
    .setIds(['id'])
    .restrictInsertFields(['email', 'password', 'role', 'displayName'])
    .restrictUpdateFields(['email', 'displayName', 'avatar'])
    .restrictReturnColumns(['id', 'email', 'displayName', 'avatar', 'role'])
    .build();

// password can be set on create but not updated
// role can be set on create but not updated
```

### Example 5: Progressive Restriction

```typescript
const baseConfig = createFeatureTableConfig(document).setIds(['id']).setUserId('userId');

// Admin mode: all fields editable
export const adminDocumentConfig = baseConfig.allowAllFields().build();

// User mode: restricted fields
export const userDocumentConfig = baseConfig.restrictUpsertFields(['title', 'content']).build();
```

---

## Troubleshooting

### Issue: TypeScript can't infer types

**Problem:**

```typescript
const config = createFeatureTableConfig(table);
type Input = InferCreateInput<typeof config>; // Type error
```

**Solution:**
Call `.build()` to finalize the configuration:

```typescript
const config = createFeatureTableConfig(table).build();
type Input = InferCreateInput<typeof config>; // ✅ Works
```

---

### Issue: Field not available in restrictUpsertFields

**Problem:**

```typescript
.restrictUpsertFields(['name', 'transactionCount']) // transactionCount not found
```

**Solution:**
Check if field was omitted from base schema:

```typescript
// Remove omitBaseSchema or don't omit that field
.omitBaseSchema(['transactionCount'])  // This excludes it
.restrictUpsertFields(['name', 'description'])  // Can't use transactionCount
```

---

### Issue: Validation fails unexpectedly

**Problem:**

```typescript
config.validateDataForTableInsert({ data: { ... }, userId: '...' });
// Throws validation error
```

**Solution:**
Check that all required fields are provided and match the schema:

```typescript
// Use the generated schema to see what's expected
const schema = config.buildCreateInputSchema();
console.log(schema.shape);
```

---

## Migration Guide

### From Manual Schema Definitions

**Before:**

```typescript
const createSchema = z.object({
    data: z.object({
        name: z.string(),
        description: z.string().optional(),
    }),
    userId: z.string(),
});
```

**After:**

```typescript
const config = createFeatureTableConfig(table)
    .setIds(['id'])
    .setUserId('userId')
    .restrictUpsertFields(['name', 'description'])
    .build();

const createSchema = config.buildCreateInputSchema();
```

---

## Related Documentation

- [Query Builder README](../../query/feature-queries/README.md)
- [Service Builder README](../../service/builder/README.md)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Zod Documentation](https://zod.dev/)

---

## Contributing

When adding new features:

1. Add JSDoc comments to all public methods/types
2. Update this README with examples
3. Add tests in `__tests__/` folder
4. Update `example.ts` with usage examples

---

## License

Part of the accntu project.
