import { AppError } from '@/server/lib/errorNew/error/base';
import { ERROR_REGISTRY, TErrorKeys } from '@/server/lib/errorNew/registry';

type TMakeErrorParams = {
    code: TErrorKeys;
    message?: string;
    cause?: Error;
};

/**
 * Creates an error instance from the error definition
 *
 */
export function makeError(params: TErrorKeys | TMakeErrorParams): AppError {
    const code = typeof params === 'string' ? params : params.code;
    const message = typeof params === 'string' ? params : params.message;
    const cause = typeof params === 'string' ? undefined : params.cause;
    const errorDefinition = ERROR_REGISTRY.get(code);

    const { httpStatus, layers, public: publicError } = errorDefinition;

    return new AppError({
        code,
        httpStatus,
        layers,
        public: publicError,
        message,
        cause,
        isExpected,
    });
}
