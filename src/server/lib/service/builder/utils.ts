/**
 * Utility functions for wrapping service functions with validation handlers.
 *
 * This module provides the core wrapping logic that enables automatic validation
 * of service return values based on null-handling configuration.
 */

import {
    InferServiceInput,
    InferServiceOutput,
    ServiceFn,
} from '@/server/lib/service/builder/types';

import { AppErrors } from '@/server/lib/error';

/**
 * Wraps a service function with optional null validation.
 *
 * Accepts a configuration object to specify the service function and its null-handling behavior.
 *
 * **Null Handling Modes:**
 * - `throwOnNull: true` (default): Validates that the service returns a non-null/undefined value.
 *   Throws an error if the result is null or undefined. Return type is `NonNullable<T>`.
 * - `throwOnNull: false`: Returns the service function as-is with no wrapper.
 *   Preserves the original return type without modification (no `| null` added).
 *
 * @template S - Service function type to wrap
 * @param config - Configuration object
 * @param config.serviceFn - The service function to wrap
 * @param config.throwOnNull - Whether to throw an error when result is null/undefined (default: true)
 * @param config.operation - Optional operation name for error messages
 * @param config.resource - Optional resource name for error messages
 * @returns Wrapped service function with appropriate return type
 *
 * @example
 * ```typescript
 * // Throw on null (strips null/undefined from type)
 * const wrappedStrict = wrapServiceWithHandler({
 *     serviceFn: async (input) => await db.getById(input),  // Returns: User | null
 *     throwOnNull: true,
 *     operation: 'Get User',
 * });
 * // Return type: User (NonNullable<User | null>)
 * // If result is null, throws: "Get User: Resource not found"
 *
 * // Throw on null (default when omitted)
 * const wrappedDefault = wrapServiceWithHandler({
 *     serviceFn: async (input) => await db.getById(input),
 *     operation: 'Get User',
 * });
 * // Also throws on null (default behavior)
 *
 * // Preserve type as-is (no validation, no type modification)
 * const wrappedArray = wrapServiceWithHandler({
 *     serviceFn: async (input) => await db.getMany(input),  // Returns: User[]
 *     throwOnNull: false,
 * });
 * // Return type: User[] (preserved as-is, no | null added)
 * ```
 */
// Overload: throwOnNull is true or omitted (defaults to true) → strips null/undefined
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generic constraint requires `any` for flexible type inference
export function wrapServiceWithHandler<S extends ServiceFn<any, any>>(config: {
    serviceFn: S;
    throwOnNull?: true;
    operation?: string;
    resource?: string;
}): ServiceFn<InferServiceInput<S>, NonNullable<InferServiceOutput<S>>>;
// Overload: throwOnNull is explicitly false → preserves return type as-is
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generic constraint requires `any` for flexible type inference
export function wrapServiceWithHandler<S extends ServiceFn<any, any>>(config: {
    serviceFn: S;
    throwOnNull: false;
    operation?: string;
    resource?: string;
}): ServiceFn<InferServiceInput<S>, InferServiceOutput<S>>;
// Implementation
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generic constraint requires `any` for flexible type inference
export function wrapServiceWithHandler<S extends ServiceFn<any, any>>(config: {
    serviceFn: S;
    throwOnNull?: boolean;
    operation?: string;
    resource?: string;
}) {
    const { serviceFn, throwOnNull = true, operation, resource } = config;

    if (throwOnNull) {
        // Wrap with validation that throws if result is null/undefined
        return async (input: InferServiceInput<S>) => {
            const result = await serviceFn(input);
            const operationName = operation || 'Service Operation';
            const resourceName = resource ? `${resource} ` : '';
            return validateRecordExists(
                result,
                `${operationName}: ${resourceName}Resource not found`,
                {
                    operation,
                    resource,
                    input: input,
                }
            );
        };
    }

    // For non-throwing mode, return the service function as-is
    return serviceFn;
}

/*
 * Validate if the record exists. If not, throw an error.
 * @param record - The record to validate
 * @param errorMessage - The error message to throw if the result does not exist
 * @returns The result
 */
export const validateRecordExists = <T extends object>(
    result: T | null,
    errorMessage: string = 'Resource not found',
    details: Record<string, unknown> = {}
): T => {
    // check if record is null or undefined
    if (!result) {
        // throw service error, central error handler will handle this
        throw AppErrors.resource('NOT_FOUND', {
            layer: 'service',
            message: errorMessage,
            details,
        });
    }
    return result;
};
