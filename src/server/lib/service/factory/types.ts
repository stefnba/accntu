import type { InferServiceSchemas, TOperationSchemasResult } from '@/lib/schemas/types';

/**
 * Standard function signature for all service functions.
 * Services coordinate business logic and call query functions.
 * 
 * @template Input - The input parameter type (defaults to unknown for strict typing)
 * @template Output - The return type (defaults to unknown for strict typing)
 */
export type ServiceFn<Input = unknown, Output = unknown> = (args: Input) => Promise<Output>;

/**
 * Type definition for query function collections that can be registered with service factory.
 * Flexible to accommodate different parameter patterns from query factory systems.
 * 
 * Note: Uses `any` to bridge service factory and query factory type systems.
 * Service input types remain type-safe through schema inference.
 * 
 * @example
 * ```typescript
 * const queries: QueriesConfig = {
 *   create: async ({ data, userId }) => { ... },
 *   getById: async ({ ids, userId }) => { ... }
 * };
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueriesConfig = Record<string, (...args: any[]) => Promise<any>>;

/**
 * Type-safe service configuration object with automatic input type inference.
 * Maps operation names from schemas to service functions with properly typed inputs.
 * 
 * @template TSchemas - The operation schemas result from schema factory
 * @example
 * ```typescript
 * const services: ServicesConfig<typeof userSchemas> = {
 *   create: async (input) => { ... }, // input is automatically typed
 *   getById: async (input) => { ... }  // input is automatically typed
 * };
 * ```
 */
export type ServicesConfig<TSchemas extends TOperationSchemasResult = TOperationSchemasResult> = {
    [K in keyof InferServiceSchemas<TSchemas>]?: ServiceFn<
        InferServiceSchemas<TSchemas>[K],
        unknown
    >;
};
