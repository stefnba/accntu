import { TCustomQueries } from '@/server/lib/db/query/factory/types';
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
    feature: string;
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
 * Infer all Zod schema types from createFeatureSchemas result
 */
export type InferSchemaTypes<
    TFeatureSchemas extends {
        inputSchemas: {
            query: Record<string, unknown>;
            service: Record<string, unknown>;
            custom: Record<string, unknown>;
        };
        feature: string;
    },
> = {
    // Return types - for API responses and data retrieval
    return: {
        [K in keyof TFeatureSchemas['inputSchemas']['query']]: TFeatureSchemas['inputSchemas']['query'][K] extends import('zod').ZodType<
            infer T
        >
            ? T
            : never;
    };

    // Input types - for API parameters and operations
    input: {
        // Service layer operations (create, update, etc.)
        service: {
            [K in keyof TFeatureSchemas['inputSchemas']['service']]: TFeatureSchemas['inputSchemas']['service'][K] extends import('zod').ZodType<
                infer T
            >
                ? T
                : never;
        };

        // Query parameters and filters
        query: {
            [K in keyof TFeatureSchemas['inputSchemas']['query']]: TFeatureSchemas['inputSchemas']['query'][K] extends import('zod').ZodType<
                infer T
            >
                ? T
                : never;
        };

        // Custom schemas (assignments, filters, etc.)
        custom: {
            [K in keyof TFeatureSchemas['inputSchemas']['custom']]: TFeatureSchemas['inputSchemas']['custom'][K] extends import('zod').ZodType<
                infer T
            >
                ? T
                : never;
        };
    };

    // Raw schemas - for runtime validation and schema composition
    schemas: TFeatureSchemas['inputSchemas'];

    // Feature metadata
    feature: TFeatureSchemas['feature'];
};
