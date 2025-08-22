# Feature Schema System

A type-safe, three-layer schema system for generating input validation schemas from database tables and query methods.

## Core Concept

The system provides two distinct type categories:

### Return Types (from Database Queries)

- **What your queries actually return** from the database
- Automatically inferred from your query function return types
- Used for API responses, data processing, component props

### Input Types (from Zod Schemas)

- **Input validation schemas** for different operation types:
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

// Return types - what your queries actually return from the database
type GetAllResponse = MyTypes['return']['getAll'];
type GetByIdResponse = MyTypes['return']['getById'];

// Input types - for validating incoming data with Zod schemas
type CreateInput = MyTypes['input']['service']['create'];
type SearchInput = MyTypes['input']['query']['search'];
type BulkInput = MyTypes['input']['custom']['bulkOperation'];
type FeatureName = MyTypes['feature']; // "label" (literal type!)

// 4. Runtime validation
const createData = mySchemas.inputSchemas.service.create.parse(userInput);
```

## Literal Feature Types

Feature names are preserved as literal types for maximum type safety:

```typescript
const userSchemas = createFeatureSchemas({
    feature: 'user', // TFeature = "user"
    // ...
});

const tagSchemas = createFeatureSchemas({
    feature: 'tag', // TFeature = "tag"
    // ...
});

type UserTypes = InferSchemaTypes<typeof userSchemas>;
type TagTypes = InferSchemaTypes<typeof tagSchemas>;

// ✅ Each feature gets its specific literal type:
type UserFeature = UserTypes['feature']; // "user"
type TagFeature = TagTypes['feature']; // "tag"

// Perfect for discriminated unions, routing, feature detection!
type AllSchemaTypes = UserTypes | TagTypes;
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

- **Dual Type System**: Return types from queries, input types from Zod schemas
- **Type Safety**: All types inferred automatically - no manual definitions
- **Runtime Validation**: Direct access to Zod schemas for `.parse()`
- **Three-Layer Composition**: Progressive schema transformations
- **Constrained Keys**: Only valid query method names allowed
- **Literal Feature Types**: Feature names are literal types, not generic strings
- **Reusable Type Helpers**: Clean, composable type inference utilities
- **Zero Manual Types**: Everything generated from database schema and queries

## Architecture

```text
┌─── Return Types (from Queries) ────┐
│  Query Functions → Return Types     │ ← Database results
└─────────────────────────────────────┘

┌─── Input Types (from Zod Schemas) ──────────────────────────────────┐
│  Database Table → Base Schema → Query → Service → Custom Schemas    │ ← Input validation
│                        ↓             ↓        ↓         ↓           │
│                 createSelectSchema  WHERE    CRUD    Everything     │
│                    (drizzle-zod)   filters   ops       else         │
└─────────────────────────────────────────────────────────────────────┘
```

## Type Helpers

The system includes reusable type helpers that mirror patterns from the query factory system:

```typescript
import { InferZodSchemaTypes } from './types';

// Helper for inferring types from any record of Zod schemas
type MySchemaTypes = InferZodSchemaTypes<{
    create: z.object({ name: z.string() });
    update: z.object({ id: z.string(), name: z.string().optional() });
    delete: z.object({ id: z.string() });
}>;

// Results in:
// {
//     create: { name: string };
//     update: { id: string; name?: string };
//     delete: { id: string };
// }
```

This follows the same pattern as `InferFeatureQueryReturnTypes` from the query factory system, providing consistency across the codebase.

## Select Return Type Helper

For the common pattern of extracting "get many" and "get one" return types:

```typescript
import { InferSelectReturnTypes } from './types';

// Default usage (uses getAll/getById automatically)
type SelectTypes = InferSelectReturnTypes<typeof mySchemas>;
type ManyItems = SelectTypes['many']; // Return type of getAll query
type OneItem = SelectTypes['one']; // Return type of getById query

// Custom query keys
type CustomSelectTypes = InferSelectReturnTypes<
    typeof mySchemas,
    'getAllFlattened', // Custom "many" key
    'getById' // Standard "one" key
>;
type FlattenedItems = CustomSelectTypes['many']; // Return type of getAllFlattened
```

Perfect for components that need to work with both list and detail views!
