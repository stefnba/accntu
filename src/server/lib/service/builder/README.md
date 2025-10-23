# Service Builder

A type-safe fluent builder system for creating service layers that wrap database queries with automatic validation and error handling.

## Overview

The Service Builder provides a structured way to create service layers that:

- **Wrap database queries** with validation logic
- **Enforce type safety** through TypeScript generics
- **Handle null/undefined returns** consistently via handlers
- **Enable method chaining** for ergonomic service composition
- **Support schema-driven development** with automatic type inference

## Architecture

```text
ServiceBuilderFactory
  ↓ (register schemas & queries)
ServiceBuilder
  ↓ (add custom services)
Built Services
```

### Core Components

1. **ServiceBuilderFactory** - Entry point for registering schemas and queries
2. **ServiceBuilder** - Fluent builder for adding custom services
3. **wrapServiceWithHandler** - Utility for wrapping services with validation

## Usage

### Basic Example

```typescript
import { ServiceBuilderFactory } from '@/server/lib/service/builder/factory';
import { tagSchemas } from '@/features/tag/schemas';
import { tagQueries } from '@/features/tag/server/db/queries';

// 1. Create a factory instance
const services = new ServiceBuilderFactory({
    schemas: {},
    queries: {},
})
    // 2. Register your schemas
    .registerSchemas(tagSchemas)

    // 3. Register your queries
    .registerQueries(tagQueries.queries)

    // 4. Register core CRUD services (getById, create, getMany)
    .registerCoreServices()

    // 5. Build and get the final services object
    .build();

// 6. Use the services
const tag = await services.getById({
    ids: { id: 'tag-id' },
    userId: 'user-id',
});

const newTag = await services.create({
    data: { name: 'New Tag', color: '#ff0000' },
    userId: 'user-id',
});

const allTags = await services.getMany({
    filters: {},
    pagination: { page: 1, pageSize: 10 },
    userId: 'user-id',
});
```

### Adding Custom Services

```typescript
const services = new ServiceBuilderFactory({
    schemas: {},
    queries: {},
})
    .registerSchemas(mySchemas)
    .registerQueries(myQueries)
    .registerCoreServices()

    // Add a custom service
    .addService('myCustomOperation', ({ queries, schemas, services }) => ({
        operation: 'myCustomOperation',
        returnHandler: 'nonNull', // or 'nullable'
        serviceFn: async (input) => {
            // Custom business logic
            const result = await queries.someQuery(input);

            // Can use other services
            const relatedData = await services.getById({...});

            return result;
        },
    }))

    .build();

// Use custom service
const result = await services.myCustomOperation({...});
```

## Return Handlers

Services must specify how to handle null/undefined return values:

### `nonNull` Handler

Use when the operation **must** return a value. Automatically throws an error if the result is null/undefined.

```typescript
.addService('getById', ({ queries }) => ({
    returnHandler: 'nonNull',
    serviceFn: async (input) => {
        return await queries.getById(input);
    },
}))

// Throws "Operation: Resource not found" if result is null
const tag = await services.getById({...}); // Type: Tag (never null)
```

### `nullable` Handler

Use when the operation **may** return null/undefined (e.g., searches, optional lookups).

```typescript
.addService('findByName', ({ queries }) => ({
    returnHandler: 'nullable',
    serviceFn: async (input) => {
        return await queries.findByName(input);
    },
}))

// Returns null if not found
const tag = await services.findByName({...}); // Type: Tag | null
```

## Core Services

When you call `.registerCoreServices()`, three standard CRUD services are automatically created:

| Service   | Handler    | Purpose                                             |
| --------- | ---------- | --------------------------------------------------- |
| `getById` | `nonNull`  | Fetch a single record by ID (throws if not found)   |
| `create`  | `nonNull`  | Create a new record (throws on failure)             |
| `getMany` | `nullable` | Fetch multiple records (returns null if none found) |

These services map directly to your registered queries with the same names.

## Type Safety

The builder provides complete type safety:

- **Schema inference**: Input types are automatically inferred from your schemas
- **Query inference**: Output types are automatically inferred from your queries
- **Service composition**: Access to previously defined services is type-safe
- **Return type handling**: `nonNull` vs `nullable` handlers affect the return type

```typescript
// TypeScript knows the exact input/output types
const tag: Tag = await services.getById({
    ids: { id: 'tag-id' }, // ✓ Correct schema
    userId: 'user-id',
});

// TypeScript error: missing required field
const invalid = await services.getById({
    ids: {}, // ✗ Error: 'id' is required
    userId: 'user-id',
});
```

## Service Composition

Services can depend on other services:

```typescript
.addService('complexOperation', ({ queries, services }) => ({
    returnHandler: 'nonNull',
    serviceFn: async (input) => {
        // Use other services within your service
        const existing = await services.getById({...});

        // Perform additional operations
        const updated = await queries.update({
            ...input,
            relatedId: existing.id,
        });

        return updated;
    },
}))
```

## Benefits

1. **Consistency** - All services follow the same pattern
2. **Validation** - Automatic null-checking with clear error messages
3. **Type Safety** - Full TypeScript support with inference
4. **Composability** - Services can use other services
5. **Maintainability** - Clear separation of concerns
6. **Testability** - Easy to mock queries and test services independently

## File Structure

```text
builder/
├── core.ts       # ServiceBuilder class (adds custom services)
├── factory.ts    # ServiceBuilderFactory class (registers schemas/queries)
├── utils.ts      # wrapServiceWithHandler utility
├── example.ts    # Usage example
└── README.md     # This file
```

## Advanced Patterns

### Cross-Feature Services

Services can call services from other features through the composition pattern:

```typescript
import { userServices } from '@/features/user/server/services';

.addService('createWithOwner', ({ queries, services }) => ({
    returnHandler: 'nonNull',
    serviceFn: async (input) => {
        // Call service from another feature
        const owner = await userServices.getById({...});

        // Create with owner validation
        return await queries.create({
            ...input,
            ownerId: owner.id,
        });
    },
}))
```

### Error Handling

The `nonNull` handler automatically provides error messages:

```typescript
// If result is null, throws:
// Error: "getById service: Resource not found"

// Customize the error message:
.addService('getById', ({ queries }) => ({
    operation: 'Get Tag By ID', // Custom operation name
    returnHandler: 'nonNull',
    serviceFn: async (input) => {
        return await queries.getById(input);
    },
}))

// Throws: "Get Tag By ID: Resource not found"
```

## When to Use

✅ **Use Service Builder when:**

- Creating a new feature with standard CRUD operations
- You need consistent error handling across services
- Type safety is critical
- Services need to compose with other services

❌ **Don't use Service Builder when:**

- You have simple, one-off operations
- Performance is critical and the wrapper overhead matters
- You need highly customized error handling that doesn't fit the pattern
