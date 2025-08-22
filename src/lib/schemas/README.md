# Feature Schema System

A type-safe, three-layer schema system for generating input validation schemas from database tables and query methods.

## Core Concept

The system generates **input schemas** for different operation types:

- **Query inputs** - WHERE conditions, filters, select field parameters
- **Service inputs** - Data payloads for CREATE/UPDATE operations
- **Custom inputs** - Any other operation-specific input data

## Usage

```typescript
import { createFeatureSchemas } from './factory';
import { InferSchemaTypes } from './types';

// 1. Create schemas with three layers
const mySchemas = createFeatureSchemas({
    feature: 'label',
    table: labelTable,
    queries: labelQueries,
    inputSchemas: {
        // Query layer: Input schemas for database queries
        query: (baseSchema) => ({
            getAll: baseSchema.pick({ id: true, name: true }),
            search: baseSchema.pick({ name: true }).partial(),
        }),

        // Service layer: Input schemas for service operations
        service: (querySchemas) => ({
            create: querySchemas.getAll.omit({ id: true }),
            update: querySchemas.getAll.partial().required({ id: true }),
        }),

        // Custom layer: Any other input schemas
        custom: ({ baseSchema, querySchemas }) => ({
            bulkOperation: querySchemas.getAll.array(),
            filters: baseSchema.pick({ name: true, status: true }).partial(),
        }),
    },
});

// 2. Infer all types
type MyTypes = InferSchemaTypes<typeof mySchemas>;

// 3. Use the generated types
type CreateInput = MyTypes['input']['service']['create'];
type SearchInput = MyTypes['input']['query']['search'];
type BulkInput = MyTypes['input']['custom']['bulkOperation'];

// 4. Runtime validation
const createData = mySchemas.inputSchemas.service.create.parse(userInput);
```

## Type Safety

Schema keys are **constrained to match your query method names**:

```typescript
// ✅ Valid - matches actual query methods
inputSchemas: {
    query: (baseSchema) => ({
        getAll: baseSchema, // ✅ exists in queries
        getById: baseSchema, // ✅ exists in queries
        search: baseSchema, // ✅ exists in queries
    });
}

// ❌ Invalid - TypeScript compilation error
inputSchemas: {
    query: (baseSchema) => ({
        invalidKey: baseSchema, // ❌ not in queries - compile error!
    });
}
```

## Benefits

- **Type Safety**: All types inferred from actual Zod schemas
- **Runtime Validation**: Direct access to schemas for `.parse()`
- **Three-Layer Composition**: Progressive schema transformations
- **Constrained Keys**: Only valid query method names allowed
- **Zero Manual Types**: Everything generated from database schema

## Architecture

```
Database Table → Base Schema → Query Schemas → Service Schemas → Custom Schemas
                     ↓              ↓              ↓              ↓
              createSelectSchema   Input        Operations    Everything
                 (drizzle-zod)   Validation    (CRUD, etc.)     Else
```
