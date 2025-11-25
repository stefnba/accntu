import { TFeatureSchemas } from '@/lib/schemas_new/types';
import { QueryFn } from '@/server/lib/db/query/feature-queries/types';

/**
 * Standard function signature for all service functions.
 * All service functions must be async and return a Promise.
 *
 * @template Input - The input parameter type
 * @template Output - The return type
 */
export type ServiceFn<Input = unknown, Output = unknown> = (args: Input) => Promise<Output>;

/**
 * Empty object type used as the initial state in service builders.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type TEmptyServices = {};

/**
 * Represents the accumulated state of the service builder.
 */
export type ServiceBuilderState = {
    services: Record<string, ServiceFn>;
    queries: Record<string, QueryFn>;
    schemas: TFeatureSchemas;
};

/**
 * Initial state for the service builder.
 */
export type InitialServiceBuilderState = {
    services: TEmptyServices;
    queries: Record<string, never>;
    schemas: TFeatureSchemas;
};

/**
 * Helper to transform a service function type to a non-nullable return type.
 *
 * @template S - The service function type
 */
export type NonNullableService<S> =
    S extends ServiceFn<infer I, infer O> ? ServiceFn<I, NonNullable<O>> : S;
