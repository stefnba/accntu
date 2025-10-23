/**
 * Type definitions for the Service Builder system.
 *
 * This module provides comprehensive type safety for the service builder pattern,
 * enabling automatic type inference and validation throughout the service creation process.
 */

import { TOperationSchemaObject } from '@/lib/schemas/types';
import { QueryFn } from '@/server/lib/db/query/builder/types';
import { ServiceFn } from '@/server/lib/service/factory/types';

/**
 * Function type for defining a service.
 *
 * Receives access to queries, schemas, and previously registered services,
 * and returns a service definition with configuration and implementation.
 *
 * @template TQueries - Record of available query functions
 * @template TSchemas - Record of operation schemas for type inference
 * @template TWrappedServices - Record of previously registered services
 *
 * @param input - Object containing queries, schemas, and services
 * @returns Service definition result with operation config and implementation
 *
 * @example
 * ```typescript
 * const myServiceDef: TServiceDefinition<MyQueries, MySchemas> = ({ queries, services }) => ({
 *     operation: 'Get User',
 *     returnHandler: 'nonNull',
 *     serviceFn: async (input) => {
 *         return await queries.getById(input);
 *     },
 * });
 * ```
 */
export type TServiceDefinition<
    TQueries extends Record<string, QueryFn>,
    TSchemas extends Record<string, TOperationSchemaObject>,
    TWrappedServices extends Record<string, ServiceFn> = Record<string, ServiceFn>,
> = (input: {
    queries: TQueries;
    schemas: TSchemas;
    services: TWrappedServices;
}) => TServiceDefinitionResult;

/**
 * Result type returned by a service definition function.
 *
 * Specifies how the service should be configured and executed.
 *
 * @property operation - Human-readable operation name (used in error messages)
 * @property returnHandler - How to handle null/undefined returns:
 *   - 'nonNull': Throws error if result is null/undefined
 *   - 'nullable': Allows null/undefined to be returned
 * @property serviceFn - The actual service implementation function
 */
export type TServiceDefinitionResult = {
    operation: string;
    returnHandler: 'nonNull' | 'nullable';
    serviceFn: ServiceFn<unknown, unknown>;
};

/**
 * Utility type that wraps a service function to ensure non-null return type.
 *
 * Transforms the output type to exclude null and undefined.
 *
 * @template TFn - Service function to wrap
 * @returns Service function with NonNullable output type
 *
 * @example
 * ```typescript
 * type Original = ServiceFn<Input, Output | null>;
 * type Wrapped = WrapNonNull<Original>; // ServiceFn<Input, Output>
 * ```
 */
export type WrapNonNull<TFn extends ServiceFn<unknown, unknown>> =
    TFn extends ServiceFn<infer Input, infer Output> ? ServiceFn<Input, NonNullable<Output>> : TFn;

/**
 * Transforms a collection of service definitions into wrapped service functions.
 *
 * Applies the appropriate return type based on the returnHandler:
 * - 'nonNull' handlers: Wraps output with NonNullable<T>
 * - 'nullable' handlers: Preserves original output type (including null/undefined)
 *
 * @template TDefinitions - Record of service definition results
 * @returns Record of wrapped service functions with correct return types
 *
 * @example
 * ```typescript
 * type Definitions = {
 *     getById: { serviceFn: ServiceFn<Input, Output | null>; returnHandler: 'nonNull' };
 *     findOptional: { serviceFn: ServiceFn<Input, Output | null>; returnHandler: 'nullable' };
 * };
 *
 * type Wrapped = WrapServiceCollection<Definitions>;
 * // Result:
 * // {
 * //     getById: ServiceFn<Input, Output>;        // NonNullable
 * //     findOptional: ServiceFn<Input, Output | null>; // Nullable preserved
 * // }
 * ```
 */
export type WrapServiceCollection<TDefinitions extends Record<string, TServiceDefinitionResult>> = {
    [K in keyof TDefinitions]: TDefinitions[K] extends {
        serviceFn: ServiceFn<infer Input, infer Output>;
        returnHandler: infer Handler;
    }
        ? Handler extends 'nonNull'
            ? ServiceFn<Input, NonNullable<Output>>
            : ServiceFn<Input, Output>
        : never;
};

/**
 * Options for building the final service collection.
 *
 * @property includeRaw - If true, returns both wrapped and unwrapped services
 */
export type BuildOptions = {
    includeRaw?: boolean;
};

/**
 * Result type of the build operation.
 *
 * Returns either just the wrapped services, or an object containing both
 * wrapped and raw (unwrapped) services.
 *
 * @template TDefinitions - Record of service definitions
 * @template TIncludeRaw - Whether to include raw services
 * @returns Wrapped services, or object with both wrapped and raw services
 *
 * @example
 * ```typescript
 * // includeRaw = false (default)
 * type Result1 = BuildResult<Definitions, false>; // WrapServiceCollection<Definitions>
 *
 * // includeRaw = true
 * type Result2 = BuildResult<Definitions, true>;
 * // {
 * //     services: WrapServiceCollection<Definitions>;
 * //     rawServices: { [K in keyof Definitions]: Definitions[K]['serviceFn'] };
 * // }
 * ```
 */
export type BuildResult<
    TDefinitions extends Record<string, TServiceDefinitionResult>,
    TIncludeRaw extends boolean = false,
> = TIncludeRaw extends true
    ? {
          services: WrapServiceCollection<TDefinitions>;
          rawServices: {
              [K in keyof TDefinitions]: TDefinitions[K]['serviceFn'];
          };
      }
    : WrapServiceCollection<TDefinitions>;
