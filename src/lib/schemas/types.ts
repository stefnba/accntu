import { Table } from 'drizzle-orm';
import { BuildSchema } from 'drizzle-zod';
import { type ValidationTargets } from 'hono';
import { z } from 'zod';
/**
 * Type constraint for all Zod objects used in the layer system
 */
export type TZodObject = z.ZodObject<z.ZodRawShape>;

/**
 * Type constraint for all Zod shapes used in the layer system. This is more flexible than TZodObject.
 */
export type TZodShape = z.core.$ZodShape;

/**
 * Type constraint for all Zod types used in the layer system. This is using zod core since z.ZodType is not working.
 */
export type TZodType = z.core.$ZodType;

// ========================================
//
// Operation Schema
//
// ========================================

/**
 * Endpoint schema object supporting Hono validation targets
 * Each target is optional to allow flexible endpoint definitions
 */
export type TEndpointSchemaObject = Partial<Record<keyof ValidationTargets, TZodObject>>;

/**
 * Mapping of core service input parameters to their respective schemas
 */
export type MappingCoreServiceInput<TUser extends TZodType, TId extends TZodObject = TZodObject> = {
    /**
     * Create a record
     */
    create: <S extends TZodObject>(params: {
        data: S;
        userFields?: TUser;
    }) => z.ZodObject<{ data: S; userId: TUser }>;
    /**
     * Get a record by id
     */
    getById: (params?: {
        idFields?: TId;
        userFields?: TUser;
    }) => z.ZodObject<{ ids: TId; userId: TUser }>;
    /**
     * Update a record by id
     */
    updateById: <D extends TZodObject>(params: {
        data: D;
        idFields?: TId;
        userFields?: TUser;
    }) => z.ZodObject<{ ids: TId; userId: TUser; data: D }>;
    /**
     * Remove a record by id (soft delete)
     */
    removeById: MappingCoreServiceInput<TUser, TId>['getById'];
    /**
     * Get many records
     */
    getMany: {
        // <F extends TZodObject, P extends TZodObject>(params: {
        //     filters: F;
        //     pagination: P;
        //     userFields?: TUser;
        // }): z.ZodObject<{ filters: z.ZodOptional<F>; pagination: z.ZodOptional<P>; userId: TUser }>;
        // <F extends TZodObject>(params: {
        //     filters: F;
        //     userFields?: TUser;
        // }): z.ZodObject<{ filters: z.ZodOptional<F>; userId: TUser }>;
        <F extends TZodObject>(params?: {
            filters: F;
            userFields?: TUser;
        }): z.ZodObject<{
            filters: z.ZodOptional<F | z.ZodUndefined> | z.ZodUndefined;
            userId: TUser;
        }>;
        <P extends TZodObject>(params?: {
            pagination: P;
            userFields?: TUser;
        }): z.ZodObject<{
            pagination: z.ZodOptional<P | z.ZodUndefined> | z.ZodUndefined;
            userId: TUser;
        }>;
        <F extends TZodObject, P extends TZodObject>(params?: {
            filters: F;
            pagination: P;
            userFields?: TUser;
        }): z.ZodObject<{
            filters: z.ZodOptional<F | z.ZodUndefined> | z.ZodUndefined;
            pagination: z.ZodOptional<P | z.ZodUndefined> | z.ZodUndefined;
            userId: TUser;
        }>;
        (params?: { userFields?: TUser }): z.ZodObject<{ userId: TUser }>;
    };
};

/**
 * Object with schemas for query, service, and endpoint layers.
 * The endpoint layer supports Hono validation targets (json, query, param, etc.)
 */
export type TOperationSchemaObject = {
    query?: TZodObject;
    service?: TZodObject | Record<string, TZodObject>;
    endpoint?: TEndpointSchemaObject;
};

/**
 * Result of building operation schemas for a feature
 */
export type TOperationSchemasResult = Record<string, TOperationSchemaObject>;

// ========================================
//
// Infer Schemas
//
// ========================================

/**
 * Comprehensive type inference for feature operation schemas.
 * Provides multiple ways to access inferred types from operation schemas.
 *
 * @template T - The operation schemas object from buildOpSchemas()
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
                      [Target in keyof T[K][L]]: T[K][L][Target] extends TZodObject
                          ? z.infer<T[K][L][Target]>
                          : never;
                  }
                : never
            : L extends 'service'
              ? InferSchemabject<T[K][L]>
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
    TLayer extends keyof TOperationSchemaObject,
    T extends Record<string, TOperationSchemaObject>,
> = {
    [K in keyof T]: InferSchemabject<T[K][TLayer]>;
};

/**
 * Recursively infer types from schema objects or nested structures.
 * Handles both Zod objects and nested object structures.
 *
 * @template T - The input type to infer from
 */
export type InferSchemabject<T> = T extends z.ZodObject
    ? z.infer<T>
    : T extends object
      ? { [key in keyof T]: InferSchemabject<T[key]> }
      : never;

/**
 * Convenience type for inferring service layer schemas across all operations.
 * Equivalent to InferSchemasByLayer<'service', T>.
 *
 * @template T - The operation schemas object
 */
export type InferServiceSchemas<T extends Record<string, TOperationSchemaObject>> =
    InferSchemasByLayer<'service', T>;

/**
 * Convenience type for inferring query layer schemas across all operations.
 * Equivalent to InferSchemasByLayer<'query', T>.
 *
 * @template T - The operation schemas object
 */
export type InferQuerySchemas<T extends Record<string, TOperationSchemaObject>> =
    InferSchemasByLayer<'query', T>;

// ========================================
//
// Drizzle table helpers
//
// ========================================

/**
 * Build a schema from a Drizzle table
 * @template TTable - The source Drizzle table
 * @template TType - The type of schema to build
 * @returns The schema
 */
export type BuildSchemaFromTable<
    TTable extends Table,
    TType extends 'insert' | 'select' | 'update' = 'insert',
> = BuildSchema<TType, TTable['_']['columns'], undefined, undefined>;

/**
 * Infer the columns of a Drizzle table
 * @template TTable - The source Drizzle table
 * @returns The columns of the Drizzle table
 */
export type InferTableColumns<TTable extends Table> = readonly (keyof TTable['_']['columns'])[];
