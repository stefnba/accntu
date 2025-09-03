import type { InferServiceSchemas, TOperationSchemaObject } from '@/lib/schemas/types';

/**
 * Service function signature
 */
export type ServiceFn<Input = unknown, Output = unknown> = (args: Input) => Promise<Output>;

/**
 * Queries config - can be any record of query functions
 * Flexible to accommodate different parameter patterns from query factory
 * 
 * Note: Uses `any` to bridge service factory and query factory type systems.
 * Service input types remain type-safe through schema inference.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueriesConfig = Record<string, (...args: any[]) => Promise<any>>;

/**
 * Services config with type inference from operation schemas
 * Maps operation names to service functions with properly typed inputs
 */
export type ServicesConfig<
    TSchemas extends Record<string, TOperationSchemaObject> = Record<string, TOperationSchemaObject>,
> = {
        [K in keyof InferServiceSchemas<TSchemas>]?: ServiceFn<
            InferServiceSchemas<TSchemas>[K],
            unknown
        >;
    };
