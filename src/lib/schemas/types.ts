import { type Table } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

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

/** Base type constraint for all Zod object schemas used in the layer system */
export type TZodSchema = z.ZodObject<z.ZodRawShape, z.UnknownKeysParam, z.ZodTypeAny>;

/**
 * Type inference for feature schemas created by FeatureSchema.fromTable().forOperations()
 *
 * Infers TypeScript types from the base and raw Zod schemas.
 * Operations are accessed directly (e.g., tagSchemas.create.service)
 *
 * @example
 * ```typescript
 * export type TTagSchemas = InferSchemas<typeof tagSchemas>;
 * type CreateService = TTagSchemas['base']; // Inferred from base schema
 * ```
 */
export type InferSchemasOld<T> = T extends {
    readonly base: infer TBase;
    readonly raw: infer TRaw;
}
    ? {
          /** Inferred TypeScript type from the processed base schema (with omitted/picked fields) */
          base: TBase extends TZodSchema ? z.infer<TBase> : never;
          /** Inferred TypeScript type from the raw unmodified table schema */
          raw: TRaw extends TZodSchema ? z.infer<TRaw> : never;
      }
    : never;

// ====================
// Operation Schema Types
// ====================

/**
 * Type definition for a single operation schema.
 * Defines optional schemas for database, service, and endpoint layers.
 *
 * @example
 * ```typescript
 * const createOperation: TOperationSchemaDefinition = {
 *   service: z.object({ name: z.string() }),
 *   endpoint: z.object({ name: z.string() })
 * };
 * ```
 */
export type TOperationSchemaDefinition = Partial<
    Record<'database' | 'service' | 'endpoint', TZodSchema>
>;

/**
 * Collection of operation schemas for a feature.
 * Used as the return type of forOperations() method.
 *
 * @example
 * ```typescript
 * const operations: TOperationSchemasObject = {
 *   create: { service: schema, endpoint: schema },
 *   update: { service: schema, endpoint: schema }
 * };
 * ```
 */
export type TOperationSchemasObject = Record<string, TOperationSchemaDefinition>;

/**
 * Infers TypeScript types for all operations with their database, service, and endpoint schemas.
 * Creates a mapped type where each operation contains inferred types for all three layers.
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
export type InferSchemasByOperation<T extends TOperationSchemasObject> = {
    [K in keyof T]: {
        database: T[K]['database'] extends TZodSchema ? z.infer<T[K]['database']> : never;
        service: T[K]['service'] extends TZodSchema ? z.infer<T[K]['service']> : never;
        endpoint: T[K]['endpoint'] extends TZodSchema ? z.infer<T[K]['endpoint']> : never;
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
    TLayer extends 'database' | 'service' | 'endpoint',
    T extends TOperationSchemasObject,
> = {
    [K in keyof T]: T[K][TLayer] extends TZodSchema ? z.infer<T[K][TLayer]> : never;
};

/** Convenience type alias for inferring service layer types across all operations */
export type InferServiceSchemas<T extends TOperationSchemasObject> = InferSchemasByLayer<
    'service',
    T
>;

/** Convenience type alias for inferring endpoint layer types across all operations */
export type InferEndpointSchemas<T extends TOperationSchemasObject> = InferSchemasByLayer<
    'endpoint',
    T
>;

/** Convenience type alias for inferring database layer types across all operations */
export type InferDatabaseSchemas<T extends TOperationSchemasObject> = InferSchemasByLayer<
    'database',
    T
>;

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
export type InferSchemas<T extends TOperationSchemasObject> = {
    /** Inferred types organized by operation, then by layer */
    operations: InferSchemasByOperation<T>;
    /** Inferred types for database layer across all operations */
    databases: InferSchemasByLayer<'database', T>;
    /** Inferred types for service layer across all operations */
    services: InferSchemasByLayer<'service', T>;
    /** Inferred types for endpoint layer across all operations */
    endpoints: InferSchemasByLayer<'endpoint', T>;
};
