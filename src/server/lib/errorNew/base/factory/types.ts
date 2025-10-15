import { TErrorLayer } from '@/server/lib/errorNew/base/error/types';

/**
 * Optional parameters for error factory methods
 *
 * These parameters can be provided when creating errors to customize
 * the error instance beyond the registry defaults.
 *
 * @property message - Custom error message (overrides registry default)
 * @property cause - Underlying error that caused this error (for error chaining)
 * @property details - Additional context/metadata for debugging
 * @property layer - Application layer where error occurred (endpoint, service, db, etc.)
 */
export type TErrorFactoryParams = {
    message?: string;
    cause?: Error;
    details?: Record<string, unknown>;
    layer?: TErrorLayer;
    publicDetails?: Record<string, unknown>;
};
