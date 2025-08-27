import { type Table } from 'drizzle-orm';
import { createInsertSchema, type BuildSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Build a schema from a drizzle table
 * @template TTable - The drizzle table to build the schema from
 */
export type BuildTableSchema<TTable extends Table> = BuildSchema<
    'select',
    TTable['_']['columns'],
    undefined
>;

export type CreateOmittedSchema<
    TTable extends Table,
    TOmitFields extends readonly (keyof TTable['_']['columns'])[],
> = z.ZodObject<
    Omit<ReturnType<typeof createInsertSchema<TTable>>['shape'], TOmitFields[number]>,
    ReturnType<typeof createInsertSchema<TTable>>['_def']['unknownKeys'],
    ReturnType<typeof createInsertSchema<TTable>>['_def']['catchall']
>;

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

export type TZodSchema = z.ZodObject<z.ZodRawShape, z.UnknownKeysParam, z.ZodTypeAny>;
export type TLayerSchemas<TKey extends string | number | symbol = string> = Record<
    TKey,
    TZodSchema
>;

// Helper to infer all schemas in a layer
type InferLayerSchemas<T extends TLayerSchemas> = {
    [K in keyof T]: T[K] extends TZodSchema ? z.infer<T[K]> : never;
};

// Comprehensive type helper that returns typed object based on available schemas
export type InferSchemas<T> = T extends { readonly baseSchema: infer TBase }
    ? T extends { readonly querySchemas: infer TQuery }
        ? T extends { readonly serviceSchemas: infer TService }
            ? T extends { readonly endpointSchemas: infer TEndpoint }
                ? {
                      // All schemas available
                      baseSchema: TBase extends TZodSchema ? z.infer<TBase> : never;
                      querySchemas: TQuery extends TLayerSchemas
                          ? InferLayerSchemas<TQuery>
                          : never;
                      serviceSchemas: TService extends TLayerSchemas
                          ? InferLayerSchemas<TService>
                          : never;
                      endpointSchemas: TEndpoint extends TLayerSchemas
                          ? InferLayerSchemas<TEndpoint>
                          : never;
                  }
                : {
                      // Base + Query + Service
                      baseSchema: TBase extends TZodSchema ? z.infer<TBase> : never;
                      querySchemas: TQuery extends TLayerSchemas
                          ? InferLayerSchemas<TQuery>
                          : never;
                      serviceSchemas: TService extends TLayerSchemas
                          ? InferLayerSchemas<TService>
                          : never;
                  }
            : {
                  // Base + Query only
                  baseSchema: TBase extends TZodSchema ? z.infer<TBase> : never;
                  querySchemas: TQuery extends TLayerSchemas ? InferLayerSchemas<TQuery> : never;
              }
        : {
              // Base only
              baseSchema: TBase extends TZodSchema ? z.infer<TBase> : never;
          }
    : never;

// Individual type helpers (for backward compatibility)
export type InferBuiltBase<T> = T extends { readonly baseSchema: infer TBase }
    ? TBase extends TZodSchema
        ? z.infer<TBase>
        : never
    : never;

export type InferBuiltQuery<T> = T extends { readonly querySchemas: infer TQuery } ? TQuery : never;

export type InferBuiltService<T> = T extends { readonly serviceSchemas: infer TService }
    ? TService
    : never;

export type InferBuiltEndpoint<T> = T extends { readonly endpointSchemas: infer TEndpoint }
    ? TEndpoint
    : never;
