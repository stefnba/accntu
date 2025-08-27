import { z } from 'zod';

/**
 * Service function signature
 */
export type ServiceFn<Input = unknown, Output = unknown> = (args: Input) => Promise<Output>;

/**
 * Queries config - can be any record of query functions
 */
export type QueriesConfig = Record<string, (...args: any[]) => Promise<any>>;

/**
 * Extract input type from schemas for a specific service key and infer the Zod type
 */
export type ServiceInputFromSchema<
    TSchemas,
    K extends string | number | symbol,
> = TSchemas extends { serviceSchemas: infer TServiceSchemas }
    ? TServiceSchemas extends Record<K, infer TSchema>
        ? TSchema extends z.ZodType<infer T>
            ? T
            : unknown
        : unknown
    : unknown;

/**
 * Check if a service schema exists for a given key
 */
export type HasServiceSchema<TSchemas, K extends string | number | symbol> = TSchemas extends {
    serviceSchemas: infer TServiceSchemas;
}
    ? K extends keyof TServiceSchemas
        ? true
        : false
    : false;

/**
 * Services config - combines query-derived services + custom services with schema-based typing
 */
export type ServicesConfig<TQueries extends QueriesConfig, TSchemas = any> =
    // Services derived from queries (same keys as queries) - allow custom input when no schema
    {
        [K in keyof TQueries]?: HasServiceSchema<TSchemas, K> extends true
            ? ServiceFn<ServiceInputFromSchema<TSchemas, K>, any>
            : ServiceFn<any, any>;
    } & Record<string, ServiceFn<any, any>>; // Custom services - use schema if available, otherwise any

/**
 * Service handler result
 */
export type ServiceHandlerResult<
    TQueries extends QueriesConfig,
    TServices extends ServicesConfig<TQueries, any>,
> = TServices;
