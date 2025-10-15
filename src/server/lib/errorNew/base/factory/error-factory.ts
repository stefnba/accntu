import { AppError } from '@/server/lib/errorNew/base/error/app-error';
import { TAppErrorParams, TErrorLayer } from '@/server/lib/errorNew/base/error/types';
import { TErrorRegistryDefinition } from '@/server/lib/errorNew/base/registry/types';
import {
    ERROR_REGISTRY,
    TErrorCategory,
    TErrorCodeByCategory,
    TErrorKeys,
} from '@/server/lib/errorNew/registry';

/**
 * Base factory class for creating errors
 *
 * Provides shared logic for registry lookup and error instantiation.
 * Domain-specific factories extend this class to add custom behavior.
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
     * Create AppError from registry definition
     *
     * Looks up error definition in registry and creates an AppError instance
     * with all required fields populated.
     *
     * @param category - Error category (e.g., 'VALIDATION', 'AUTH')
     * @param code - Error code (e.g., 'INVALID_INPUT', 'UNAUTHORIZED')
     * @param params - Optional error parameters
     * @returns AppError instance
     */
    protected static createFromRegistry(
        category: string,
        code: string,
        params?: {
            message?: string;
            cause?: Error;
            details?: Record<string, unknown>;
            layer?: TErrorLayer;
        }
    ): AppError {
        const key = `${category}.${code}` as TErrorKeys;
        const definition = this.getDefinition(key);

        return new AppError({
            category,
            code,
            httpStatus:
                'httpStatus' in definition ? definition.httpStatus : definition.public.httpStatus,
            public: definition.public,
            isExpected: definition.isExpected,
            message: params?.message ?? definition.public.message ?? '',
            cause: params?.cause,
            details: params?.details,
            layer: params?.layer,
        });
    }
}

abstract class BaseErrorFactoryA {
    protected static registry = ERROR_REGISTRY;

    protected static buildErrorDefinitionFromRegistry<C extends TErrorCategory>(
        category: C,
        code: TErrorCodeByCategory<C>,
        params?: {
            message?: string;
            cause?: Error;
            details?: Record<string, unknown>;
            layer?: TErrorLayer;
            publicDetails?: Record<string, unknown>;
        }
    ): TAppErrorParams {
        const key = `${category}.${code}` as TErrorKeys;
        const definition = this.registry.get(key) as TErrorRegistryDefinition;

        return {
            ...definition,
            ...params,
            code,
            category,
            httpStatus: definition.httpStatus ?? definition.public.httpStatus,
            message: params?.message ?? definition.message ?? 'No message provided',
            public: {
                ...definition.public,
                code,
                details: params?.publicDetails,
            },
        };
    }

    static make<C extends TErrorCategory>(
        category: C,
        code: TErrorCodeByCategory<C>,
        params?: {
            message?: string;
            cause?: Error;
            details?: Record<string, unknown>;
            layer?: TErrorLayer;
        }
    ) {
        return new AppError(this.buildErrorDefinitionFromRegistry(category, code, params));
    }
}

export class ValidationErrorFactory extends BaseErrorFactoryA {
    static make(
        code: TErrorCodeByCategory<'VALIDATION'>,
        params?: {
            message?: string;
            cause?: Error;
            details?: Record<string, unknown>;
            layer?: TErrorLayer;
        }
    ) {
        return super.make('VALIDATION', code, params);
    }
}
