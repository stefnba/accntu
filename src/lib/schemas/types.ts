import { type Table } from 'drizzle-orm';
import { createInsertSchema, type BuildSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Builds a select schema from a Drizzle table with full type inference
 * @template TTable - The Drizzle table to build the schema from
 */
export type BuildTableSchema<TTable extends Table> = BuildSchema<
    'select',
    TTable['_']['columns'],
    undefined
>;

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

/** Record type for grouping related schemas within a layer (query, service, endpoint) */
export type TLayerSchemas<TKey extends string | number | symbol = string> = Record<
    TKey,
    TZodSchema
>;

/** Schema input provided to query schema functions - includes both processed and raw schemas */
export type QuerySchemaInput<TBaseSchema extends TZodSchema, TRawSchema extends TZodSchema> = {
    /** Processed base schema (may have omitted/picked fields) */
    base: TBaseSchema;
    /** Raw unmodified schema from the original table/source */
    raw: TRawSchema;
};

/** Utility type that infers TypeScript types from all Zod schemas in a layer */
type InferLayerSchemas<T extends TLayerSchemas> = {
    [K in keyof T]: T[K] extends TZodSchema ? z.infer<T[K]> : never;
};

/**
 * Comprehensive type inference for feature schemas across all layers
 * Conditionally infers types based on which schema layers are present
 */
export type InferSchemas<T> = T extends {
    readonly base: infer TBase;
    readonly raw: infer TRaw;
}
    ? T extends { readonly query: infer TQuery }
        ? T extends { readonly service: infer TService }
            ? T extends { readonly endpoint: infer TEndpoint }
                ? {
                      // All schemas available
                      base: TBase extends TZodSchema ? z.infer<TBase> : never;
                      raw: TRaw extends TZodSchema ? z.infer<TRaw> : never;
                      query: TQuery extends TLayerSchemas ? InferLayerSchemas<TQuery> : never;
                      service: TService extends TLayerSchemas ? InferLayerSchemas<TService> : never;
                      endpoint: TEndpoint extends TLayerSchemas
                          ? InferLayerSchemas<TEndpoint>
                          : never;
                  }
                : {
                      // Base + Query + Service
                      base: TBase extends TZodSchema ? z.infer<TBase> : never;
                      raw: TRaw extends TZodSchema ? z.infer<TRaw> : never;
                      query: TQuery extends TLayerSchemas ? InferLayerSchemas<TQuery> : never;
                      service: TService extends TLayerSchemas ? InferLayerSchemas<TService> : never;
                  }
            : {
                  // Base + Query only
                  base: TBase extends TZodSchema ? z.infer<TBase> : never;
                  raw: TRaw extends TZodSchema ? z.infer<TRaw> : never;
                  query: TQuery extends TLayerSchemas ? InferLayerSchemas<TQuery> : never;
              }
        : {
              // Base only
              base: TBase extends TZodSchema ? z.infer<TBase> : never;
              raw: TRaw extends TZodSchema ? z.infer<TRaw> : never;
          }
    : never;

/** Extracts and infers the base schema type from a built feature schema */
export type InferBuiltBase<T> = T extends { readonly base: infer TBase }
    ? TBase extends TZodSchema
        ? z.infer<TBase>
        : never
    : never;

/** Extracts and infers the raw schema type from a built feature schema */
export type InferBuiltRaw<T> = T extends { readonly raw: infer TRaw }
    ? TRaw extends TZodSchema
        ? z.infer<TRaw>
        : never
    : never;

/** Extracts the query schemas object from a built feature schema */
export type InferBuiltQuery<T> = T extends { readonly query: infer TQuery } ? TQuery : never;

/** Extracts the service schemas object from a built feature schema */
export type InferBuiltService<T> = T extends { readonly service: infer TService }
    ? TService
    : never;

/** Extracts the endpoint schemas object from a built feature schema */
export type InferBuiltEndpoint<T> = T extends { readonly endpoint: infer TEndpoint }
    ? TEndpoint
    : never;
