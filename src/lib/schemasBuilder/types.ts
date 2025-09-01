import { Table } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// ====================
// Operation Schema
// ====================

/**
 * Base type constraint for all Zod object schemas used in the layer system
 */
export type TZodSchema = z.ZodObject<z.ZodRawShape, z.UnknownKeysParam, z.ZodTypeAny>;

/**
 * Operation keys
 */
export type OperationKeys = 'getById' | 'getMany' | 'create' | 'updateById' | 'removeById';

/**
 * Layer keys
 */
export type LayerKeys = 'query' | 'service' | 'endpoint';

/**
 * Object with schemas for query, service, and endpoint layers.
 *
 * @example
 * ```typescript
 * const createOperation: TOperationSchemaObject = {
 *   service: z.object({ name: z.string() }),
 *   endpoint: z.object({ name: z.string() })
 * };
 * ```
 *
 * @returns Object with schemas for query, service, and endpoint layers
 */
export type TOperationSchemaObject = Partial<Record<LayerKeys, TZodSchema>>;

/**
 * Function that returns an object with schemas for query, service, and endpoint layers.
 */
export type OperationSchemaDefinitionFn<
    TBaseSchema extends TZodSchema,
    TSchemasObject extends TOperationSchemaObject,
> = ({ baseSchema }: { baseSchema: TBaseSchema }) => TSchemasObject;

// ====================
// Drizzle table helpers
// ====================

/**
 * Creates a Zod schema by omitting specified fields from a Drizzle table schema
 * @template TTable - The source Drizzle table
 * @template TOmitFields - Array of field names to exclude from the schema
 */
export type CreateOmittedSchema<
    TTable extends Table,
    TOmitFields extends readonly (keyof TTable['_']['columns'])[],
> = z.ZodObject<
    Omit<ReturnType<typeof createInsertSchema<TTable>>['shape'], TOmitFields[number]>,
    ReturnType<typeof createInsertSchema<TTable>>['_def']['unknownKeys'],
    ReturnType<typeof createInsertSchema<TTable>>['_def']['catchall']
>;

/**
 * Creates a Zod schema by picking only specified fields from a Drizzle table schema
 * @template TTable - The source Drizzle table
 * @template TPickFields - Array of field names to include in the schema
 */
export type CreatePickedSchema<
    TTable extends Table,
    TPickFields extends readonly (keyof TTable['_']['columns'])[],
> = z.ZodObject<
    Pick<
        ReturnType<typeof createInsertSchema<TTable>>['shape'],
        TPickFields[number] extends keyof ReturnType<typeof createInsertSchema<TTable>>['shape']
            ? TPickFields[number]
            : never
    >,
    ReturnType<typeof createInsertSchema<TTable>>['_def']['unknownKeys'],
    ReturnType<typeof createInsertSchema<TTable>>['_def']['catchall']
>;

// ====================
// Infer Schemas
// ====================

/**
 * Comprehensive type inference for feature operation schemas.
 * Provides multiple ways to access inferred types from operation schemas.
 *
 * @template T - The operation schemas object from forOperations()
 * @returns Object with different views of the inferred types
 *
 * @example
 * ```typescript
 * export type TTagSchemas = InferSchemas<typeof tagSchemas>;
 *
 * // Access by operation and layer
 * type CreateService = TTagSchemas['operations']['create']['service'];
 * type UpdateEndpoint = TTagSchemas['operations']['updateById']['endpoint'];
 *
 * // Access by layer (all operations)
 * type AllServices = TTagSchemas['services']; // { create: Type, update: Type, ... }
 * type AllEndpoints = TTagSchemas['endpoints'];
 * type AllDatabases = TTagSchemas['databases'];
 * ```
 */
export type InferSchemas<T extends Record<string, TOperationSchemaObject>> = {
    /** Inferred types organized by operation, then by layer */
    operations: InferSchemasByOperation<T>;
    /** Inferred types for query layer across all operations */
    query: InferSchemasByLayer<'query', T>;
    /** Inferred types for service layer across all operations */
    services: InferSchemasByLayer<'service', T>;
    /** Inferred types for endpoint layer across all operations */
    endpoints: InferSchemasByLayer<'endpoint', T>;
};

/**
 * Infers TypeScript types for all operations with their query, service, and endpoint schemas.
 * Creates a mapped type where each operation contains inferred types for the layers that were defined.
 *
 * @template T - The operation schemas object from forOperations()
 * @returns Mapped type with inferred types for each operation's layers
 *
 * @example
 * ```typescript
 * type TagOperations = InferSchemasByOperation<typeof tagSchemas>;
 * type CreateService = TagOperations['create']['service']; // Inferred service type
 * type UpdateEndpoint = TagOperations['updateById']['endpoint']; // Inferred endpoint type
 * ```
 */
export type InferSchemasByOperation<T extends Record<string, TOperationSchemaObject>> = {
    [K in keyof T]: {
        [L in keyof T[K]]: T[K][L] extends TZodSchema ? z.infer<T[K][L]> : never;
    };
};

/**
 * Generic helper for inferring types from a specific layer across all operations.
 * Extracts and infers types for either database, service, or endpoint layer.
 *
 * @template TLayer - Which layer to extract ('database' | 'service' | 'endpoint')
 * @template T - The operation schemas object from forOperations()
 * @returns Mapped type with inferred types for the specified layer only
 *
 * @example
 * ```typescript
 * type TagServices = InferSchemasByLayer<'service', typeof tagSchemas>;
 * type CreateService = TagServices['create']; // z.infer<service schema>
 * ```
 */
export type InferSchemasByLayer<
    TLayer extends LayerKeys,
    T extends Record<string, TOperationSchemaObject>,
> = {
    [K in keyof T]: T[K][TLayer] extends TZodSchema ? z.infer<T[K][TLayer]> : never;
};
