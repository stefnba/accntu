import { AppError } from '@/server/lib/errorNew/error/base';
import { TErrorLayer } from '@/server/lib/errorNew/error/types';
import { ERROR_REGISTRY, TErrorKeys } from '@/server/lib/errorNew/registry';
import { TErrorRegistryDefinition } from '@/server/lib/errorNew/registry/types';

type TMakeErrorParams = {
    key: TErrorKeys;
    message?: string;
    cause?: Error;
    details?: Record<string, unknown>;
    publicDetails?: Record<string, unknown>;
    layer?: TErrorLayer;
};

type TOptionalErrorParams = Omit<TMakeErrorParams, 'key'>;

export function makeError(key: TErrorKeys): AppError;
export function makeError(key: TErrorKeys, params: TOptionalErrorParams): AppError;
export function makeError(params: TMakeErrorParams): AppError;
export function makeError(
    keyOrParams: TErrorKeys | TMakeErrorParams,
    maybeParams?: TOptionalErrorParams
): AppError {
    let key: TErrorKeys;
    let message: string | undefined;
    let cause: Error | undefined;
    let details: Record<string, unknown> | undefined;
    let publicDetails: Record<string, unknown> | undefined;
    let layer: TErrorLayer | undefined;

    if (typeof keyOrParams === 'string') {
        key = keyOrParams;
        message = maybeParams?.message;
        cause = maybeParams?.cause;
        details = maybeParams?.details;
        publicDetails = maybeParams?.publicDetails;
        layer = maybeParams?.layer;
    } else {
        key = keyOrParams.key;
        message = keyOrParams.message;
        cause = keyOrParams.cause;
        details = keyOrParams.details;
        publicDetails = keyOrParams.publicDetails;
        layer = keyOrParams.layer;
    }

    const errorDefinition = ERROR_REGISTRY.get(key) as TErrorRegistryDefinition;
    const { httpStatus, public: publicError, isExpected = false } = errorDefinition;

    const [category, code] = key.split(/[.|_:]/);

    return new AppError({
        category,
        code,
        layer,
        httpStatus: httpStatus ?? publicError.httpStatus,
        public: { ...publicError, details: publicDetails ?? {} },
        message: message ?? publicError.message ?? '',
        cause,
        details,
        isExpected,
    });
}
