import type { InferServiceSchemas, TOperationSchemasObject } from '@/lib/schemas/types';

/**
 * Service function signature
 */
export type ServiceFn<Input = unknown, Output = unknown> = (args: Input) => Promise<Output>;

/**
 * Queries config - can be any record of query functions
 */
export type QueriesConfig = Record<string, (...args: any[]) => Promise<any>>;

/**
 * Services config using the convenience InferServiceSchemas type
 */
export type ServicesConfig<
    TQueries extends QueriesConfig,
    TSchemas extends TOperationSchemasObject,
> = {
    [K in keyof InferServiceSchemas<TSchemas>]: ServiceFn<
        InferServiceSchemas<TSchemas>[K],
        unknown
    >;
};

/**
 * Service handler result
 */

export type ServiceHandlerResult<
    TQueries extends QueriesConfig,
    TServices extends ServicesConfig<TQueries, any>,
> = TServices;
