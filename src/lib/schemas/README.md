# Schema Factory System

A sophisticated, type-safe schema factory system for building consistent operation schemas across features. This system provides a fluent API for defining validation schemas for services, queries, and API endpoints with automatic type inference.

## Overview

The schema factory system consists of several key components:

- **`createFeatureSchemas`** - Entry point factory for starting schema building
- **`BaseSchemaBuilder`** - Core builder class with fluent API methods
- **`inputHelpers`** - Automatic input schema generation for CRUD operations
- **Type system** - Comprehensive TypeScript support with full type inference

## Key Features

- 🎯 **Type-Safe**: Full TypeScript support with automatic type inference
- 🔄 **Fluent API**: Chainable methods for intuitive schema building
- 🏗️ **Flexible**: Support for both Drizzle tables and custom Zod schemas
- 🔐 **Authentication**: Built-in user field handling for secure operations
- 📊 **CRUD Operations**: Pre-built helpers for common database operations
- 🎨 **Customizable**: Support for custom operations with full control

## Quick Start

```typescript
import { createFeatureSchemas } from '@/lib/schemas';
import { userTable } from './db/schema';

// Build schemas from Drizzle table
export const { schemas: userSchemas } = createFeatureSchemas
    .registerTable(userTable)
    .omit({ createdAt: true, updatedAt: true, id: true })
    .setUserIdField('userId')
    .setIdFields({ id: true })
    .addCore('create', ({ baseSchema, buildInput }) => ({
        service: buildInput({ data: baseSchema }),
        query: buildInput({ data: baseSchema }),
        endpoint: { json: baseSchema },
    }))
    .addCore('getMany', ({ buildInput }) => {
        const filters = z.object({ search: z.string().optional() });
        return {
            service: buildInput({ filters }),
            query: buildInput({ filters }),
            endpoint: { query: filters },
        };
    });

// Type inference automatically works
type UserSchemas = InferSchemas<typeof userSchemas>;
type CreateService = UserSchemas['services']['create']; // Fully typed!
```

## Core Concepts

### Schema Layers

Each operation can define schemas for three layers:

1. **Service Layer** - Input validation for business logic functions
2. **Query Layer** - Input validation for database queries
3. **Endpoint Layer** - Input validation for HTTP endpoints (supports Hono validation targets)

### Schema Builder Flow

```typescript
createFeatureSchemas
  .registerTable(table)           // Start from Drizzle table
  .omit({ audit: true })          // Remove unwanted fields
  .transform(schema =>
    schema.extend({ custom: z.string() })  // Add custom fields
  )
  .setUserIdField('userId')            // Define user authentication field
  .setIdFields({ id: true })         // Define ID fields for operations
  .addCore('create', ...)         // Add CRUD operations
  .addCustom('custom', ...);      // Add custom operations
```

## API Reference

### Factory Functions

#### `createFeatureSchemas.registerTable(table)`

Start schema building from a Drizzle table. Automatically generates Zod schema using drizzle-zod.

```typescript
const builder = createFeatureSchemas.registerTable(userTable);
```

#### `createFeatureSchemas.registerSchema(schema)`

Start schema building from an existing Zod schema object.

```typescript
const customSchema = z.object({ name: z.string() });
const builder = createFeatureSchemas.registerSchema(customSchema);
```

#### `createSchemasFactory(table, config?)`

Convenience function combining table registration with field filtering.

```typescript
// Include specific fields only
const builder = createSchemasFactory(userTable, {
    pickFields: { name: true, email: true },
});

// Exclude specific fields
const builder = createSchemasFactory(userTable, {
    omitFields: { createdAt: true, updatedAt: true },
});
```

### Builder Methods

#### Schema Transformation

- **`.transform(fn)`** - Apply custom transformation to schema
- **`.pick(fields)`** - Include only specified fields
- **`.omit(fields)`** - Exclude specified fields

#### Configuration

- **`.setUserIdField(field)`** - Set user authentication field
- **`.setIdFields(fields)`** - Define ID fields for operations

#### Operation Definition

- **`.addCore(key, fn)`** - Add CRUD operation with input helpers
- **`.addCustom(key, fn)`** - Add custom operation with full control

### Core Operations

The system provides pre-built input helpers for common CRUD operations:

- **`create`** - Create new records
- **`getById`** - Get single record by ID
- **`updateById`** - Update record by ID
- **`removeById`** - Soft delete record by ID
- **`getMany`** - Get multiple records with filtering/pagination

### Type Inference

```typescript
// Define your schemas
export const { schemas: tagSchemas } = createFeatureSchemas
  .registerTable(tagTable)
  .addCore('create', ...)
  .addCore('getMany', ...);

// Automatic type inference
export type TTagSchemas = InferSchemas<typeof tagSchemas>;

// Access inferred types by operation and layer
type CreateService = TTagSchemas['operations']['create']['service'];
type GetManyEndpoint = TTagSchemas['operations']['getMany']['endpoint'];

// Access by layer across all operations
type AllServices = TTagSchemas['services'];
type AllEndpoints = TTagSchemas['endpoints'];
```

## Examples

### Basic CRUD Schema

```typescript
export const { schemas: userSchemas } = createFeatureSchemas
    .registerTable(userTable)
    .omit({ createdAt: true, updatedAt: true })
    .setUserIdField('userId')
    .setIdFields({ id: true })
    .addCore('create', ({ baseSchema, buildInput }) => ({
        service: buildInput({ data: baseSchema }),
        endpoint: { json: baseSchema },
    }))
    .addCore('getById', ({ buildInput, idFieldsSchema }) => ({
        service: buildInput(),
        endpoint: { param: idFieldsSchema },
    }))
    .addCore('updateById', ({ baseSchema, buildInput, idFieldsSchema }) => ({
        service: buildInput({ data: baseSchema }),
        endpoint: {
            param: idFieldsSchema,
            json: baseSchema,
        },
    }));
```

### Custom Validation with Transform

```typescript
const colorSchema = z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color');

export const { schemas: tagSchemas } = createFeatureSchemas
    .registerTable(tagTable)
    .omit({ createdAt: true, updatedAt: true })
    .transform((base) =>
        base.extend({
            color: colorSchema, // Add custom validation
        })
    )
    .setUserIdField('userId')
    .addCore('create', ({ baseSchema, buildInput }) => ({
        service: buildInput({ data: baseSchema }),
        endpoint: { json: baseSchema },
    }));
```

### Junction Table Operations

```typescript
export const { schemas: tagToTransactionSchemas } = createFeatureSchemas
    .registerTable(tagToTransactionTable)
    .omit({ createdAt: true, updatedAt: true })
    .setIdFields({ transactionId: true })
    .addCustom('assignToTransaction', ({ baseSchema, idFieldsSchema, rawSchema }) => {
        const tagIdsSchema = z.array(rawSchema.pick({ tagId: true }).shape.tagId);

        const assignSchema = baseSchema.extend({
            tagIds: tagIdsSchema,
            transactionId: rawSchema.shape.transactionId,
            userId: z.string(),
        });

        return {
            service: assignSchema,
            query: assignSchema,
            endpoint: {
                param: idFieldsSchema,
                json: assignSchema.pick({ tagIds: true }),
            },
        };
    });
```

### Pagination and Filtering

```typescript
export const { schemas: transactionSchemas } = createFeatureSchemas
    .registerTable(transactionTable)
    .setUserIdField('userId')
    .addCore('getMany', ({ buildInput }) => {
        const paginationSchema = z.object({
            page: z.number().int().min(1).default(1),
            pageSize: z.number().int().min(1).max(100).default(10),
        });

        const filtersSchema = z.object({
            search: z.string().optional(),
            category: z.enum(['income', 'expense']).optional(),
            dateFrom: z.string().datetime().optional(),
            dateTo: z.string().datetime().optional(),
        });

        const input = buildInput({
            pagination: paginationSchema,
            filters: filtersSchema,
        });

        return {
            service: input,
            query: input,
            endpoint: {
                query: paginationSchema.extend(filtersSchema.shape),
            },
        };
    });
```

## Best Practices

1. **Start with Table Registration**: Always begin with `createFeatureSchemas.registerTable()` for database-driven schemas

2. **Remove Audit Fields Early**: Use `.omit()` to remove `createdAt`, `updatedAt`, `id` fields that shouldn't be in user input

3. **Set User Field**: Always call `.setUserIdField('userId')` for user-scoped data

4. **Define ID Fields**: Use `.setIdFields()` to specify which fields are used for lookups

5. **Use Core Operations**: Prefer `.addCore()` for standard CRUD operations - they include automatic input helpers

6. **Custom Operations for Special Cases**: Use `.addCustom()` only when you need full control over schema structure

7. **Type Export Pattern**: Always export inferred types for consumers

    ```typescript
    export type TFeatureSchemas = InferSchemas<typeof featureSchemas>;
    export type TFeatureServices = InferServiceSchemas<typeof featureSchemas>;
    ```

8. **Validation at Transform**: Add custom validation in `.transform()` rather than in individual operations

9. **Endpoint Layer Precision**: Only include the validation targets you actually need in the endpoint layer

10. **Schema Composition**: Build complex schemas by composing simpler ones rather than creating everything from scratch

## Integration with Query and Service Factories

The schema factory integrates seamlessly with the query and service factory systems:

```typescript
// 1. Define schemas
export const { schemas: userSchemas } = createFeatureSchemas
  .registerTable(userTable)
  .addCore('create', ...);

// 2. Use in query factory
export const userQueries = createFeatureQueries
  .registerSchema(userSchemas)
  .addQuery('create', {
    fn: async ({ data, userId }) => { /* implementation */ },
    operation: 'create user'
  });

// 3. Use in service factory
export const userServices = createFeatureServices
  .registerSchema(userSchemas)
  .registerQuery(userQueries)
  .defineServices(({ queries }) => ({
    create: async (input) => queries.create(input)
  }));
```

This creates a fully type-safe pipeline from HTTP request validation through service logic to database operations.
