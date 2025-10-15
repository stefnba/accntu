import { AppError } from '@/server/lib/error/base/error/app-error';
import { TErrorFactoryParams } from '@/server/lib/error/base/factory/types';
import {
    ERROR_REGISTRY,
    TErrorCategory,
    TErrorCodeByCategory,
    TErrorKeys,
} from '@/server/lib/error/registry';

/**
 * Base factory class for creating errors
 *
 * Provides shared logic for registry lookup and error instantiation.
 * Subclasses extend this to create category-specific factories.
 *
 * @abstract
 */
export abstract class BaseErrorFactory {
    /**
     * Get error definition from registry
     *
     * @param key - Full error key (e.g., 'VALIDATION.INVALID_INPUT')
     * @returns Error definition from registry
     */
    protected static getDefinition(key: TErrorKeys) {
        return ERROR_REGISTRY.get(key);
    }

    /**
     * Build error parameters from registry definition
     *
     * This method:
     * 1. Looks up the error definition in registry
     * 2. Builds parameter object with all registry metadata
     * 3. Returns parameters ready for domain error constructor
     *
     * @template C - Error category type
     * @param category - Error category (e.g., 'VALIDATION', 'AUTH')
     * @param code - Error code (e.g., 'INVALID_INPUT', 'UNAUTHORIZED')
     * @param params - Optional error parameters
     * @returns Error parameters for domain error constructor
     *
     * @example
     * ```typescript
     * const params = this.buildErrorParams('VALIDATION', 'INVALID_INPUT', { ... });
     * return new ValidationError(params);
     * ```
     */
    protected static buildErrorParams<C extends TErrorCategory>(
        category: C,
        code: TErrorCodeByCategory<C>,
        params?: TErrorFactoryParams
    ) {
        const key = `${category}.${code}` as TErrorKeys;
        const definition = this.getDefinition(key);

        const httpStatus =
            'httpStatus' in definition && definition.httpStatus
                ? definition.httpStatus
                : definition.public.httpStatus;

        return {
            code,
            httpStatus,
            public: definition.public,
            isExpected: definition.isExpected,
            message: params?.message ?? definition.public.message ?? '',
            cause: params?.cause,
            details: params?.details,
            layer: params?.layer,
        };
    }

    /**
     * Create error from registry definition
     *
     * This method:
     * 1. Looks up the error definition in registry
     * 2. Creates an AppError with all registry metadata
     * 3. Returns the base AppError instance
     *
     * Used by the general `makeError` function for dynamic error creation.
     *
     * @template C - Error category type
     * @param category - Error category (e.g., 'VALIDATION', 'AUTH')
     * @param code - Error code (e.g., 'INVALID_INPUT', 'UNAUTHORIZED')
     * @param params - Optional error parameters
     * @returns AppError instance with registry metadata
     *
     * @example
     * ```typescript
     * const appError = this.createFromRegistry('VALIDATION', 'INVALID_INPUT', { ... });
     * ```
     */
    protected static createFromRegistry<C extends TErrorCategory>(
        category: C,
        code: TErrorCodeByCategory<C>,
        params?: TErrorFactoryParams
    ): AppError {
        return new AppError({
            category,
            ...this.buildErrorParams(category, code, params),
        });
    }
}
