# Feature Service Builder

A type-safe, fluent builder for creating business logic services. It bridges the gap between raw database queries and application logic, standardizing error handling, null checks, and type inference.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Standard Services](#standard-services)
- [Error Handling](#error-handling)

## Overview

The Feature Service Builder provides a structured way to define service operations. It allows you to:

- **Compose services** from queries and schemas.
- **Standardize error handling** using a central wrapper.
- **Automate null checks** (throw 404s automatically or return nulls).
- **Preserve types** from queries through to the service layer.
- **Invert control** by injecting dependencies (queries, schemas) into service definitions.

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     Entry Point                             │
│           createFeatureServices(name)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 FeatureServiceBuilder                       │
│  - registerQueries(queries)                                 │
│  - registerSchema(schemas)                                  │
│  - addService(name, config)                                 │
│  - withStandard(builder => ...)                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ .build()
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Object                            │
│  {                                                          │
│    getById: (args) => Promise<Data>,                        │
│    create: (args) => Promise<Data>,                         │
│    customOp: (args) => Promise<Result>                      │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. **Integrated Context**

Services have direct access to registered queries and schemas, ensuring they always use the correct data access methods and validation rules.

### 2. **Automated Null Handling**

By default, services configured with `onNull: 'throw'` (or omitted) will automatically check the result. If it's `null` or `undefined`, a `RESOURCE.NOT_FOUND` error is thrown. This eliminates repetitive `if (!item) throw ...` checks.

### 3. **Standardized Error Wrapping**

All services are wrapped in a handler that catches errors and converts them to uniform `AppErrors`, adding context like the operation name and resource type.

### 4. **Type Safety**

Input and output types are inferred directly from the implementation and registered schemas. There is no need for manual type casting.

## Quick Start

```typescript
import { createFeatureServices } from '@/server/lib/service';
import { tagQueries } from './queries'; // Your FeatureQueries
import { tagSchemas } from './schemas'; // Your FeatureSchemas

export const tagServices = createFeatureServices('tag')
    // 1. Register dependencies
    .registerQueries(tagQueries)
    .registerSchema(tagSchemas)

    // 2. Add standard CRUD operations
    .registerAllStandard()

    // 3. Add custom business logic
    .addService('createWithValidation', ({ queries, schemas }) => ({
        operation: 'create tag with validation',
        onNull: 'throw', // Throw 404 if result is null (default)
        fn: async (input: { name: string; userId: string }) => {
            // Business logic
            if (input.name === 'forbidden') {
                throw new Error('Name not allowed');
            }

            // Call query
            return await queries.create({
                data: input,
                userId: input.userId,
            });
        },
    }))
    .build();
```

## Core Concepts

### Dependency Registration

Before defining services, you must register the `FeatureQueries` and `FeatureSchemas` that your services will use. This makes them available in the `addService` callback.

```typescript
.registerQueries(myQueries)
.registerSchema(mySchemas)
```

### Custom Services

Use `addService` to define custom business logic. The configuration object allows you to define the behavior of the service.

```typescript
.addService('myService', ({ queries, schemas }) => ({
    operation: 'human readable operation name', // Used in error messages
    onNull: 'throw', // 'throw' | 'return'
    fn: async (input) => { ... }
}))
```

- **`fn`**: The async function implementing the logic.
- **`operation`**: Descriptive name for logging and error details.
- **`onNull`**: Controls return value behavior.
    - `'throw'` (Default): Throws `NOT_FOUND` if result is null. Return type is `NonNullable<T>`.
    - `'return'`: Returns the result as-is (can be null). Return type includes `null`.

## Standard Services

The builder provides shortcuts for standard CRUD operations, mirroring the standard queries.

### `registerAllStandard()`

Registers all available standard operations found in the registered queries: `create`, `createMany`, `getMany`, `getById`, `updateById`, `removeById`.

```typescript
.registerAllStandard()
```

### `withStandard()`

Allows selective registration of standard services.

```typescript
.withStandard(builder => builder
    .create()
    .getById()
    .getMany()
)
```

**Note on `getById`**: The standard `getById` service is automatically configured with `onNull: 'throw'`. It will throw a 404 if the record isn't found.

## API Reference

### Factory

#### `createFeatureServices(name: string)`

Creates a new builder instance. `name` is used as the resource name in error messages.

### Builder Methods

#### `.registerQueries(queries)`

Adds queries to the builder context.

#### `.registerSchema(schemas)`

Adds schemas to the builder context.

#### `.addService(name, config)`

Adds a custom service function.

- `config` is a function receiving `{ queries, schemas }`.
- Returns `{ fn, operation?, onNull? }`.

#### `.registerAllStandard()`

Adds all standard CRUD services based on available queries.

#### `.withStandard(callback)`

Selectively adds standard services via a fluent interface.

#### `.build()`

Finalizes the builder and returns the object containing all service functions.

## Error Handling

The `serviceHandler` wrapper ensures consistent error reporting.

- **Not Found**: Thrown automatically when `onNull: 'throw'` is used and result is null.
- **App Errors**: Errors thrown explicitly (e.g., `AppErrors.badRequest(...)`) are passed through.
- **Unexpected Errors**: Caught and wrapped as `INTERNAL_ERROR` with context details (operation, resource, input).

```typescript
// Usage in an endpoint
try {
    const result = await myService.doSomething(input);
} catch (err) {
    // err is always an AppError-compatible object
}
```
