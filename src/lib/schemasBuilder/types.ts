import { Table } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { type ValidationTargets } from 'hono';
import { z } from 'zod';

// ====================
// Operation Schema
// ====================

/**
 * Base type constraint for all Zod schemas used in the layer system
 * Includes objects, optionals, and other Zod types for flexibility
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TZodSchema = z.ZodType<any, any, any>;

/**
 * Core CRUD operation keys - these get IntelliSense priority
 */
export type CoreOperationKeys = 'getById' | 'getMany' | 'create' | 'updateById' | 'removeById';

/**
 * All operation keys - includes core CRUD operations plus any custom string
 */
export type OperationKeys = CoreOperationKeys | string;

/**
 * Helper type to get remaining operation keys that haven't been used yet
 * Shows unused core operations first, then allows any string for custom operations
 */
export type AvailableOperationKeys<TUsedKeys extends string> =
    | Exclude<CoreOperationKeys, TUsedKeys>
    | (string & {});

/**
 * Layer keys
 */
export type LayerKeys = 'query' | 'service' | 'endpoint';

/**
 * Endpoint schema object supporting Hono validation targets
 * Each target is optional to allow flexible endpoint definitions
 */
export type TEndpointSchemaObject = Partial<Record<keyof ValidationTargets, TZodSchema>>;

/**
 * Object with schemas for query, service, and endpoint layers.
 * The endpoint layer supports Hono validation targets (json, query, param, etc.)
 *
 * @example
 * ```typescript
 * const createOperation: TOperationSchemaObject = {
 *   service: z.object({ name: z.string() }),
 *   endpoint: {
 *     json: z.object({ name: z.string() }),
 *     param: z.object({ id: z.string() })
 *   }
 * };
 * ```
 *
 * @returns Object with schemas for query, service, and endpoint layers
 */
export type TOperationSchemaObject = {
    query?: TZodSchema;
    service?: TZodSchema;
    endpoint?: TEndpointSchemaObject;
};

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
 * For endpoint layer, creates nested object with inferred types for each Hono validation target.
 *
 * @template T - The operation schemas object from forOperations()
 * @returns Mapped type with inferred types for each operation's layers
 *
 * @example
 * ```typescript
 * type TagOperations = InferSchemasByOperation<typeof tagSchemas>;
 * type CreateService = TagOperations['create']['service']; // Inferred service type
 * type CreateEndpointJson = TagOperations['create']['endpoint']['json']; // Inferred endpoint json type
 * ```
 */
export type InferSchemasByOperation<T extends Record<string, TOperationSchemaObject>> = {
    [K in keyof T]: {
        [L in keyof T[K]]: L extends 'endpoint'
            ? T[K][L] extends TEndpointSchemaObject
                ? {
                      [Target in keyof T[K][L]]: T[K][L][Target] extends TZodSchema
                          ? z.infer<T[K][L][Target]>
                          : never;
                  }
                : never
            : T[K][L] extends TZodSchema
              ? z.infer<T[K][L]>
              : never;
    };
};

/**
 * Generic helper for inferring types from a specific layer across all operations.
 * Extracts and infers types for either query, service, or endpoint layer.
 * For endpoint layer, creates nested object with inferred types for each Hono validation target.
 *
 * @template TLayer - Which layer to extract ('query' | 'service' | 'endpoint')
 * @template T - The operation schemas object from forOperations()
 * @returns Mapped type with inferred types for the specified layer only
 *
 * @example
 * ```typescript
 * type TagServices = InferSchemasByLayer<'service', typeof tagSchemas>;
 * type CreateService = TagServices['create']; // z.infer<service schema>
 * type TagEndpoints = InferSchemasByLayer<'endpoint', typeof tagSchemas>;
 * type CreateEndpointJson = TagEndpoints['create']['json']; // z.infer<endpoint json schema>
 * ```
 */
export type InferSchemasByLayer<
    TLayer extends LayerKeys,
    T extends Record<string, TOperationSchemaObject>,
> = {
    [K in keyof T]: TLayer extends 'endpoint'
        ? T[K][TLayer] extends TEndpointSchemaObject
            ? {
                  [Target in keyof T[K][TLayer]]: T[K][TLayer][Target] extends TZodSchema
                      ? z.infer<T[K][TLayer][Target]>
                      : never;
              }
            : never
        : T[K][TLayer] extends TZodSchema
          ? z.infer<T[K][TLayer]>
          : never;
};
