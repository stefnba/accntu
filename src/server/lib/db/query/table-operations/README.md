# Table Operations

The **Table Operations** layer provides generic, low-level database CRUD operations. It builds and executes SQL queries without knowing anything about your feature's business logic.

This layer acts as a further abstraction for building SQL queries using the Drizzle ORM syntax.

## Purpose

- **Build SQL queries** (INSERT, SELECT, UPDATE, DELETE)
- **Handle conflict resolution** (upsert, ignore duplicates)
- **Execute database operations** with error handling
- **Return typed results** based on selected columns

## When to Use

In our feature-based architecture, the Table Operations layer is typically not used directly. Instead, we rely on the [Feature Query layer](../feature-queries/README.md) to define default and custom queries, which internally utilizes Table Operations.

However, you may choose to use Table Operations directly in scenarios such as:

- Creating custom, complex queries
- Performing bulk operations
- Implementing advanced conflict resolution

## Example (Direct Usage)

```typescript
import { TableOperationsBuilder } from '@/server/lib/db/query/table-operations/core';
import { tagTable } from '@/features/tag/server/db/tables';

const tableOps = new TableOperationsBuilder(tagTable);

// Create a record
const newTag = await tableOps.createRecord({
    data: {
        id: 'tag-1',
        userId: 'user-123',
        name: 'Work',
        color: '#FF0000',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    returnColumns: ['id', 'name', 'color'],
});

// Get a single record by identifiers
const tag = await tableOps.getFirstRecord({
    identifiers: [
        { field: 'id', value: 'tag-1' },
        { field: 'userId', value: 'user-123' },
    ],
    columns: ['id', 'name', 'color'],
});

// Get many records with filters
const tags = await tableOps.getManyRecords({
    identifiers: [
        { field: 'userId', value: 'user-123' },
        { field: 'isActive', value: true },
    ],
    pagination: { page: 1, pageSize: 10 },
});

// Update a record
const updated = await tableOps.updateRecord({
    data: { name: 'Updated Name' },
    identifiers: [
        { field: 'id', value: 'tag-1' },
        { field: 'userId', value: 'user-123' },
    ],
});

// Soft delete (set isActive = false)
const deleted = await tableOps.removeRecord({
    identifiers: [{ field: 'id', value: 'tag-1' }],
    softDelete: true,
});
```

## Advanced: Conflict Resolution

```typescript
// Upsert: Update if exists, insert if not
await tableOps.createRecord({
    data: { name: 'Work', userId: 'user-123' },
    onConflict: {
        type: 'update',
        target: ['userId', 'name'], // Conflict on these columns
        setExcluded: ['color', 'updatedAt'], // Update these from new values
    },
});

// Ignore duplicates
await tableOps.createRecord({
    data: { name: 'Work', userId: 'user-123' },
    onConflict: 'ignore',
});

// Fail on conflict (default)
await tableOps.createRecord({
    data: { name: 'Work', userId: 'user-123' },
    onConflict: 'fail',
});
```

## Key Concepts

### Identifiers

Identifiers are filters used in WHERE clauses:

```typescript
identifiers: [
    { field: 'userId', value: 'user-123' },
    { field: 'isActive', value: true },
];
// Becomes: WHERE userId = 'user-123' AND isActive = true
```

### Data vs Identifiers

```typescript
// CREATE: Data goes into VALUES
createRecord({
    data: { name: 'Work', userId: 'user-123' }, // → VALUES (...)
});

// UPDATE: Data goes into SET, identifiers into WHERE
updateRecord({
    data: { name: 'Work' }, // → SET name = 'Work'
    identifiers: [{ field: 'id', value: '...' }], // → WHERE id = '...'
});
```

## Relationship to Feature Queries

```text
Feature Queries (Feature-Level)
    ↓ Knows about: users, schemas, filters
    ↓
Table Operations (Generic Database)
    ↓ Knows about: tables, columns, SQL
    ↓
Database (PostgreSQL)
```

## Example: How Layers Work Together

```typescript
// You call Feature Queries:
tagQueries.queries.create({ data: { name: 'Work' }, userId: 'user-123' })

// ↓ Feature Queries extract and merge:
tableOps.createRecord({ data: { name: 'Work', userId: 'user-123' } })

// ↓ Table Operations generate drizzle syntax:
db.insert(tagTable).values({ name: 'Work', userId: 'user-123' })

// ↓ SQL executed:
INSERT INTO tag (name, user_id) VALUES ('Work', 'user-123')
```

## Available Methods

- `createRecord()` - Insert single record
- `createManyRecords()` - Insert multiple records
- `getFirstRecord()` - Get single record by identifiers
- `getManyRecords()` - Get multiple records with filters/pagination
- `updateRecord()` - Update single record
- `updateManyRecords()` - Update multiple records
- `removeRecord()` - Delete/soft-delete single record
- `activateRecord()` - Set isActive = true
- `deactivateRecord()` - Set isActive = false
- `deleteRecord()` - Hard delete (bypass soft delete)

## Architecture Classes

- **`TableOperationsBuilder`**: Main class for table CRUD operations

## See Also

- **Feature Queries**: [../feature-queries/README.md](../feature-queries/README.md) - Feature-level abstraction
