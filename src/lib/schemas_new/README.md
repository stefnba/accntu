# Feature Schema Builder

A modern, type-safe schema builder for feature-based architecture. Bridges database tables with Zod schemas for validation across multiple layers (service, endpoint, query, etc.), providing full TypeScript inference and minimizing boilerplate.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Purpose](#purpose)
- [Key Concepts](#key-concepts)
- [Architecture](#architecture)
- [Usage Guide](#usage-guide)
- [Standard Schemas](#standard-schemas)
- [Custom Schemas](#custom-schemas)
- [Inference & Type Safety](#type-inference--safety)

## Overview

The Feature Schema Builder automates the creation of Zod schemas for your application layers. Instead of manually defining schemas for every operation, you configure your table once and generate consistent, type-safe schemas for services, API endpoints, and database queries.

### Purpose

- **Single Source of Truth**: Derive everything from your Drizzle table definition and configuration.
- **Layered Validation**: Generate specific schemas for different contexts (e.g., API input vs. internal service input).
- **Automated Boilerplate**: Standard CRUD schemas (create, update, getById, etc.) are generated automatically.
- **Full Type Safety**: Zero `any` types, full inference for inputs and outputs.

### Key Concepts

1. **Feature Table Config**: A central configuration object defining how a table behaves (allowed columns, filterable fields, etc.).
2. **Standard Schemas**: Pre-built schemas for common operations like `create`, `updateById`, `getMany`.
3. **Custom Schemas**: Flexible builder API to define feature-specific operations.
4. **Layered Schemas**: Each operation provides schemas for `service`, `endpoint` (json/param/query), and `query` layers.

## Quick Start

```typescript
import { createFeatureSchemas } from '@/lib/schemas_new/factory';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { tagTable } from '@/server/db/tables';

// 1. Configure your table
const tagConfig = createFeatureTableConfig(tagTable)
    .restrictInsertFields(['name', 'color'])
    .restrictUpdateFields(['name', 'color', 'description'])
    .build();

// 2. Build your schemas
export const tagSchemas = createFeatureSchemas(tagConfig)
    // Add all standard CRUD schemas (create, updateById, getMany, etc.)
    .registerAllStandard()
    // Add a custom schema
    .addSchema('archive', ({ schemas, helpers }) => ({
        service: helpers.buildIdentifierSchema(),
        endpoint: {
            param: schemas.id,
        },
    }))
    .build();

// 3. Use the schemas
const createInput = tagSchemas.create.endpoint.json.parse({
    name: 'Work',
    color: '#ff0000',
});
```

## Architecture

```text
FeatureSchemasBuilder (Main Builder)
├── registerAllStandard() - Add all standard CRUD schemas
├── withStandard() - Add selective standard schemas
└── addSchema() - Add custom schemas via callback

Output Structure (per operation):
{
  service: ZodType,   // Full internal input (includes userId, etc.)
  endpoint: {         // Public API validation targets
    json?: ZodType,   // Body payload
    param?: ZodType,  // URL parameters
    query?: ZodType   // Query string
  },
  query?: ZodType     // Database query columns/structure
}
```

## Usage Guide

### Standard Schemas

The simplest way to get started is registering all standard schemas. This provides:

- **create**: Schema for creating a record.
- **createMany**: Schema for bulk creation.
- **updateById**: Schema for updating by ID.
- **getById**: Schema for retrieving by ID.
- **removeById**: Schema for deleting by ID.
- **getMany**: Schema for listing with pagination/filtering.

```typescript
const schemas = createFeatureSchemas(config).registerAllStandard().build();
```

### Selective Standard Schemas

If you only need specific operations:

```typescript
const schemas = createFeatureSchemas(config)
    .withStandard((builder) => builder.create().getById())
    .build();
```

### Custom Schemas

For operations unique to your feature, use `addSchema`. The callback provides access to pre-generated partial schemas derived from your table config.

```typescript
const schemas = createFeatureSchemas(config)
    .addSchema('customAction', ({ schemas, helpers }) => ({
        // Internal service input (e.g., requires userId + specific data)
        service: schemas.input.update,

        // API Endpoint validation
        endpoint: {
            json: schemas.inputData.update, // Body: just the data fields
            param: schemas.id, // Param: just the ID
        },

        // Output selection schema
        query: schemas.return,
    }))
    .build();
```

#### Available Schema Helpers

Inside `addSchema`, you have access to:

- `schemas.table`: Raw Drizzle-Zod schemas (`insert`, `select`, `update`).
- `schemas.input`: Combined inputs (`create` = data+userId, `update` = data+ids+userId).
- `schemas.inputData`: Raw data shapes (`create` = data only, `update` = data only).
- `schemas.base`, `schemas.id`, `schemas.userId`, `schemas.return`: Specific field subsets.
- `helpers.buildIdentifierSchema()`: Generates ID + UserId schema.
- `helpers.buildPaginationSchema()`: Standard pagination fields.

## Type Inference & Safety

The builder uses advanced TypeScript features to ensure that the schemas you generate exactly match your configuration.

### Inferring Types

Use the provided helper types to extract TypeScript definitions from your built schemas:

```typescript
import { InferSchemasByLayer } from '@/lib/schemas_new/types';

// Extract all Service layer types
type ServiceInputs = InferSchemasByLayer<typeof tagSchemas, 'service'>;
type CreateInput = ServiceInputs['create'];

// Extract all Endpoint layer types
type EndpointInputs = InferSchemasByLayer<typeof tagSchemas, 'endpoint'>;
type CreateBody = EndpointInputs['create']['json'];
```

### Validation

The builder prevents invalid configurations at compile time. For example, if you try to use a schema for a column that doesn't exist or has been excluded in your `FeatureTableConfig`, TypeScript will raise an error.
