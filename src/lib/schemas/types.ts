import { InferFeatureQueryReturnTypes, TCustomQueries } from '@/server/lib/db/query/factory/types';
import { Table } from 'drizzle-orm';
import { BuildSchema } from 'drizzle-zod';

// ============================================================================
// Type Inference Helpers
// ============================================================================

/**
 * Infer return type from query function
 */
export type InferQuerySchemas<TQueryFn, TBaseSchema> = TQueryFn extends (
    baseSchema: TBaseSchema
) => infer R
    ? R
    : Record<string, never>;

/**
 * Infer return type from service function
 */
export type InferServiceSchemas<TServiceFn, TQuerySchemas> = TServiceFn extends (
    querySchemas: TQuerySchemas
) => infer R
    ? R
    : Record<string, never>;

/**
 * Infer return type from custom function
 */
export type InferCustomSchemas<TCustomFn, TBaseSchema, TQuerySchemas, TServiceSchemas> =
    TCustomFn extends (schemas: {
        baseSchema: TBaseSchema;
        querySchemas: TQuerySchemas;
        serviceSchemas: TServiceSchemas;
    }) => infer R
        ? R
        : Record<string, never>;

// ============================================================================
// Schema Configuration Types
// ============================================================================

/**
 * Three-layer schema configuration with full type inference
 */
export type TFeatureSchemaConfig<
    TFeature extends string,
    TQueries extends TCustomQueries,
    TTable extends Table,
    TBaseSchema extends BuildSchema<'select', TTable['_']['columns'], undefined>,
    TInputSchemas extends {
        query?: (baseSchema: TBaseSchema) => unknown;
        service?: (querySchemas: unknown) => unknown;
        custom?: (schemas: {
            baseSchema: TBaseSchema;
            querySchemas: unknown;
            serviceSchemas: unknown;
        }) => unknown;
    } = {
        query?: (baseSchema: TBaseSchema) => unknown;
        service?: (querySchemas: unknown) => unknown;
        custom?: (schemas: {
            baseSchema: TBaseSchema;
            querySchemas: unknown;
            serviceSchemas: unknown;
        }) => unknown;
    },
> = {
    feature: TFeature;
    queries: TQueries;
    table: TTable;
    inputSchemas: TInputSchemas;
};

// ============================================================================
// Result Types
// ============================================================================

/**
 * Infer complete schema result types from configuration
 */
export type InferFeatureSchemas<TInputSchemas, TBaseSchema> = TInputSchemas extends {
    query?: infer TQueryFn;
    service?: infer TServiceFn;
    custom?: infer TCustomFn;
}
    ? {
          query: InferQuerySchemas<TQueryFn, TBaseSchema>;
          service: InferServiceSchemas<TServiceFn, InferQuerySchemas<TQueryFn, TBaseSchema>>;
          custom: InferCustomSchemas<
              TCustomFn,
              TBaseSchema,
              InferQuerySchemas<TQueryFn, TBaseSchema>,
              InferServiceSchemas<TServiceFn, InferQuerySchemas<TQueryFn, TBaseSchema>>
          >;
      }
    : {
          query: Record<string, never>;
          service: Record<string, never>;
          custom: Record<string, never>;
      };

// ============================================================================
// Schemas Types
// ============================================================================

// ============================================================================
// Schema Types Inference
// ============================================================================

/**
 * Extract TypeScript types from a record of Zod schemas
 * @template T - Record of Zod schemas to infer types from
 */
export type InferZodSchemaTypes<T extends Record<string, unknown>> = {
    [K in keyof T]: T[K] extends import('zod').ZodType<infer R> ? R : never;
};

/**
 * Extract all types from createFeatureSchemas result
 *
 * Provides:
 * - `return` - Database query result types (from actual query functions)
 * - `input` - Request validation types (from Zod schemas in query/service/custom layers)
 * - `schemas` - Runtime Zod schema access for `.parse()`
 * - `feature` - Literal feature name for discriminated unions
 *
 * @template TFeatureSchemas - Result object from createFeatureSchemas()
 *
 * @example
 * ```typescript
 * type UserTypes = InferSchemaTypes<typeof userSchemas>;
 *
 * type UserList = UserTypes['return']['getAll'];              // Query result
 * type CreateInput = UserTypes['input']['service']['create']; // Zod input type
 * const schema = userSchemas.inputSchemas.service.create;     // Runtime validation
 * ```
 */
export type InferSchemaTypes<
    TFeatureSchemas extends {
        inputSchemas: {
            query: Record<string, unknown>;
            service: Record<string, unknown>;
            custom: Record<string, unknown>;
        };
        queries: TCustomQueries;
        feature: string;
    },
> = {
    // Return types - for API responses and data retrieval (from actual query functions)
    return: InferFeatureQueryReturnTypes<TFeatureSchemas['queries']>;

    // Input types - for API parameters and operations (from Zod schemas)
    input: {
        // Service layer operations (create, update, etc.)
        service: InferZodSchemaTypes<TFeatureSchemas['inputSchemas']['service']>;

        // Query parameters and filters
        query: InferZodSchemaTypes<TFeatureSchemas['inputSchemas']['query']>;

        // Custom schemas (assignments, filters, etc.)
        custom: InferZodSchemaTypes<TFeatureSchemas['inputSchemas']['custom']>;
    };

    // Raw schemas - for runtime validation and schema composition
    schemas: TFeatureSchemas['inputSchemas'];

    // Feature metadata
    feature: TFeatureSchemas['feature'];
};

/**
 * Extract common "many" and "one" return types from queries
 * Perfect for components handling both list and detail views
 *
 * @template TFeatureSchemas - Result object from createFeatureSchemas()
 * @template TManyKey - Query key for "get many" operations (defaults to 'getAll')
 * @template TOneKey - Query key for "get one" operations (defaults to 'getById')
 *
 * @example
 * ```typescript
 * type UserSelectTypes = InferSelectReturnTypes<typeof userSchemas>;
 * type UserList = UserSelectTypes['many'];  // getAll return type
 * type SingleUser = UserSelectTypes['one']; // getById return type
 *
 * // Custom keys
 * type ActiveTypes = InferSelectReturnTypes<typeof userSchemas, 'getAllActive', 'getByEmail'>;
 * ```
 */
export type InferSelectReturnTypes<
    TFeatureSchemas extends {
        queries: TCustomQueries;
        [key: string]: unknown;
    },
    TManyKey extends keyof TFeatureSchemas['queries'] = 'getAll',
    TOneKey extends keyof TFeatureSchemas['queries'] = 'getById',
> = {
    // Return type for "get many" operations (usually getAll)
    many: TManyKey extends keyof TFeatureSchemas['queries']
        ? InferFeatureQueryReturnTypes<TFeatureSchemas['queries'], TManyKey>[TManyKey]
        : never;

    // Return type for "get one" operations (usually getById)
    one: TOneKey extends keyof TFeatureSchemas['queries']
        ? InferFeatureQueryReturnTypes<TFeatureSchemas['queries'], TOneKey>[TOneKey]
        : never;
};
