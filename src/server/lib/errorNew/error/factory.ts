import { AppError } from '@/server/lib/errorNew/error/base';
import { ERROR_REGISTRY, TErrorKeys } from '@/server/lib/errorNew/registry';
import { TErrorRegistryDefinition } from '@/server/lib/errorNew/registry/types';

type TMakeErrorParams = {
    key: TErrorKeys;
    message?: string;
    cause?: Error;
    details?: Record<string, unknown>;
};

/**
 * Creates an error instance from the error definition
 *
 */
export function makeError(key: TErrorKeys): AppError;
export function makeError(key: TErrorKeys, params: Omit<TMakeErrorParams, 'key'>): AppError;
export function makeError(params: TMakeErrorParams): AppError;
export function makeError(
    params: TErrorKeys | TMakeErrorParams,
    paramsAdditional?: Omit<TMakeErrorParams, 'key'>
): AppError {
    const key = typeof params === 'string' ? params : params.key;
    const message = typeof params === 'string' ? params : params.message;
    const cause = typeof params === 'string' ? undefined : params.cause;
    const details = typeof params === 'string' ? undefined : params.details;

    // casting to avoid union since not all keys are provided
    const errorDefinition = ERROR_REGISTRY.get(key) as TErrorRegistryDefinition;

    const { httpStatus, public: publicError, isExpected = false } = errorDefinition;

    return new AppError({
        key,
        httpStatus: httpStatus ?? publicError.httpStatus,
        public: publicError,
        message: message ?? publicError.message ?? '',
        cause,
        details,
        isExpected,
    });
}
