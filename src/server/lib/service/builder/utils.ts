/**
 * Utility functions for wrapping service functions with validation handlers.
 *
 * This module provides the core wrapping logic that enables automatic validation
 * of service return values based on the specified handler type.
 */

import { ServiceFn } from '@/server/lib/service/factory/types';
import { validateExists } from '@/server/lib/service/handler/helpers';

/**
 * Extracts the input type from a ServiceFn type.
 *
 * @template T - Service function type
 * @returns Input type of the service function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for type inference in generic constraints
type InferServiceInput<T> = T extends ServiceFn<infer I, any> ? I : never;

/**
 * Extracts the output type from a ServiceFn type.
 *
 * @template T - Service function type
 * @returns Output type of the service function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for type inference in generic constraints
type InferServiceOutput<T> = T extends ServiceFn<any, infer O> ? O : never;

/**
 * Wraps a service function with a validation handler.
 *
 * This function provides two modes of operation:
 *
 * 1. **nonNull mode**: Validates that the service returns a non-null/undefined value.
 *    Throws an error if the result is null or undefined.
 *
 * 2. **nullable mode**: Allows the service to return null or undefined without validation.
 *    The service function is returned as-is with no wrapper.
 *
 * @template S - Service function type to wrap
 * @param serviceFn - The service function to wrap
 * @param returnHandler - Type of handler to apply
 * @param operation - Optional operation name for error messages
 * @returns Wrapped service function with appropriate return type
 *
 * @example
 * ```typescript
 * // NonNull handler - throws if result is null
 * const wrappedNonNull = wrapServiceWithHandler(
 *     async (input) => await db.getById(input),
 *     'nonNull',
 *     'Get User'
 * );
 * // If result is null, throws: "Get User: Resource not found"
 *
 * // Nullable handler - allows null results
 * const wrappedNullable = wrapServiceWithHandler(
 *     async (input) => await db.findOptional(input),
 *     'nullable'
 * );
 * // Returns null if not found, no error thrown
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generic constraint requires `any` for flexible type inference
export function wrapServiceWithHandler<S extends ServiceFn<any, any>>(
    serviceFn: S,
    returnHandler: 'nonNull',
    operation?: string
): ServiceFn<InferServiceInput<S>, NonNullable<InferServiceOutput<S>>>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generic constraint requires `any` for flexible type inference
export function wrapServiceWithHandler<S extends ServiceFn<any, any>>(
    serviceFn: S,
    returnHandler: 'nullable',
    operation?: string
): ServiceFn<InferServiceInput<S>, InferServiceOutput<S>>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generic constraint requires `any` for flexible type inference
export function wrapServiceWithHandler<S extends ServiceFn<any, any>>(
    serviceFn: S,
    returnHandler: 'nonNull' | 'nullable',
    operation?: string
) {
    if (returnHandler === 'nonNull') {
        // Wrap with validation that throws if result is null/undefined
        return async (input: InferServiceInput<S>) => {
            const result = await serviceFn(input);
            return validateExists(
                result as object | null,
                `${operation || 'Operation'}: Resource not found`
            );
        };
    }

    // For nullable handlers, return the service function as-is
    return serviceFn;
}
