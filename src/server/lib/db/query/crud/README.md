# CRUD Query Builder

The **CRUD Query Builder** is a **generic, low-level** abstraction for database operations. It builds and executes SQL queries without knowing anything about your feature's business logic.

## Purpose

- **Build SQL queries** (INSERT, SELECT, UPDATE, DELETE)
- **Handle conflict resolution** (upsert, ignore duplicates)
- **Execute database operations** with error handling
- **Return typed results** based on selected columns

## When to Use

Typically, you **don't use this directly**. The Query Builder (feature-level) uses it internally. However, you can use it for:

- Custom complex queries
- Bulk operations
- Advanced conflict handling

## Example (Direct Usage)

```typescript
import { CrudQueryBuilder } from '@/server/lib/db/query/crud/core';
import { tagTable } from '@/features/tag/server/db/tables';

const crud = new CrudQueryBuilder(tagTable);

// Create a record
const newTag = await crud.createRecord({
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
const tag = await crud.getFirstRecord({
    identifiers: [
        { field: 'id', value: 'tag-1' },
        { field: 'userId', value: 'user-123' },
    ],
    columns: ['id', 'name', 'color'],
});

// Get many records with filters
const tags = await crud.getManyRecords({
    identifiers: [
        { field: 'userId', value: 'user-123' },
        { field: 'isActive', value: true },
    ],
    pagination: { page: 1, pageSize: 10 },
});

// Update a record
const updated = await crud.updateRecord({
    data: { name: 'Updated Name' },
    identifiers: [
        { field: 'id', value: 'tag-1' },
        { field: 'userId', value: 'user-123' },
    ],
});

// Soft delete (set isActive = false)
const deleted = await crud.removeRecord({
    identifiers: [{ field: 'id', value: 'tag-1' }],
    softDelete: true,
});
```

## Advanced: Conflict Resolution

```typescript
// Upsert: Update if exists, insert if not
await crud.createRecord({
    data: { name: 'Work', userId: 'user-123' },
    onConflict: {
        type: 'update',
        target: ['userId', 'name'], // Conflict on these columns
        setExcluded: ['color', 'updatedAt'], // Update these from new values
    },
});

// Ignore duplicates
await crud.createRecord({
    data: { name: 'Work', userId: 'user-123' },
    onConflict: 'ignore',
});

// Fail on conflict (default)
await crud.createRecord({
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

## Relationship to Query Builder

```
Query Builder (Feature-Level)
    ↓ Knows about: users, schemas, filters
    ↓
CRUD Builder (Generic Database)
    ↓ Knows about: tables, columns, SQL
    ↓
Database (PostgreSQL)
```

### What Each Layer Handles

**Query Builder** (feature-level):

- Extract userId from `{ data, userId }`
- Apply feature filters (search, status)
- Handle pagination/ordering logic

**CRUD Builder** (generic database):

- Build SQL: `INSERT INTO table (...) VALUES (...)`
- Execute queries with error handling
- Return typed results

## Example: How Layers Work Together

```typescript
// You call Query Builder:
tagQueries.queries.create({ data: { name: 'Work' }, userId: 'user-123' })

// ↓ Query Builder extracts and merges:
crudBuilder.createRecord({ data: { name: 'Work', userId: 'user-123' } })

// ↓ CRUD Builder generates SQL:
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

## See Also

- **Query Builder**: [../builder/README.md](../builder/README.md) - Feature-level abstraction
- **Feature Queries**: [@/src/features/CLAUDE.md](../../../../features/CLAUDE.md) - How to use in features
