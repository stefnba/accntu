/**
 * Utility functions for wrapping service functions with validation handlers.
 *
 * This module provides the core wrapping logic that enables automatic validation
 * of service return values based on the specified handler type.
 */

import {
    InferServiceInput,
    InferServiceOutput,
    ServiceFn,
} from '@/server/lib/service/builder/types';

import { AppErrors } from '@/server/lib/error';

type TWrapServiceWithHandlerDetails = {
    operation?: string;
    resource?: string;
};

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
    details?: TWrapServiceWithHandlerDetails
): ServiceFn<InferServiceInput<S>, NonNullable<InferServiceOutput<S>>>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generic constraint requires `any` for flexible type inference
export function wrapServiceWithHandler<S extends ServiceFn<any, any>>(
    serviceFn: S,
    returnHandler: 'nullable',
    details?: TWrapServiceWithHandlerDetails
): ServiceFn<InferServiceInput<S>, InferServiceOutput<S>>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generic constraint requires `any` for flexible type inference
export function wrapServiceWithHandler<S extends ServiceFn<any, any>>(
    serviceFn: S,
    returnHandler: 'nonNull' | 'nullable' = 'nullable',
    details?: TWrapServiceWithHandlerDetails
) {
    if (returnHandler === 'nonNull') {
        // Wrap with validation that throws if result is null/undefined
        return async (input: InferServiceInput<S>) => {
            const result = await serviceFn(input);
            const operation = details?.operation || 'Service Operation';
            const resource = details?.resource ? `${details.resource} ` : '';
            return validateRecordExists(result, `${operation}: ${resource}Resource not found`, {
                ...details,
                input: input,
            });
        };
    }

    // For nullable handlers, return the service function as-is
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
