import { AppErrors } from '@/server/lib/error';
import { AppError } from '@/server/lib/error/base/error/app-error';
import { NonNullableService, ServiceFn } from './types';

/**
 * Wraps a service function with robust error handling and optional null validation.
 *
 * **Features:**
 * - **Error Handling**: Catches unexpected errors and wraps them in AppErrors.
 * - **Context**: Adds operation and resource context to errors.
 * - **Null Handling**:
 *   - `throwOnNull: true` (default): Throws RESOURCE.NOT_FOUND if result is null/undefined.
 *   - `throwOnNull: false`: Returns result as-is.
 *
 * @example
 * ```typescript
 * const safeService = serviceHandler({
 *   serviceFn: unsafeService,
 *   throwOnNull: true,
 *   operation: 'getUser',
 *   resource: 'User'
 * });
 * ```
 */
// Overload: throwOnNull is true or omitted (defaults to true) → strips null/undefined from return type
export function serviceHandler<I, O, S extends ServiceFn<I, O>>(config: {
    serviceFn: S;
    throwOnNull?: true;
    operation?: string;
    resource?: string;
}): NonNullableService<S>;

// Overload: throwOnNull is explicitly false → preserves original return type (nullable)
export function serviceHandler<I, O, S extends ServiceFn<I, O>>(config: {
    serviceFn: S;
    throwOnNull: false;
    operation?: string;
    resource?: string;
}): S;

// Implementation
export function serviceHandler<I, O, S extends ServiceFn<I, O>>(config: {
    serviceFn: S;
    throwOnNull?: boolean;
    operation?: string;
    resource?: string;
}) {
    const { serviceFn, throwOnNull = true, operation, resource } = config;

    return async (input: I) => {
        const operationName = operation || 'Service Operation';
        const resourceName = resource ? `${resource} ` : '';

        try {
            const result = await serviceFn(input);

            if (throwOnNull && result == null) {
                throw AppErrors.resource('NOT_FOUND', {
                    layer: 'service',
                    message: `${operationName}: ${resourceName}Resource not found`,
                    details: { operation, resource, input },
                });
            }

            // Cast needed because TypeScript doesn't narrow generic conditional return types automatically
            return result;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }

            throw AppErrors.server('INTERNAL_ERROR', {
                layer: 'service',
                message: `${operationName}: Unexpected error`,
                details: { operation, resource, input },
                cause: error instanceof Error ? error : undefined,
            });
        }
    };
}
