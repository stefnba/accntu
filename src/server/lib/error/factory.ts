// src/server/error/factory.ts
import { ErrorCodesByCategory } from '@/server/lib/error/registry/types';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { BaseError } from './base';
import { TErrorCodeCategory, TErrorFullCode } from './registry';

/**
 * Base parameters for creating an error
 */
export type ErrorParamsBase = {
    message?: string; // custom error message
    statusCode?: ContentfulStatusCode; // custom status code
    details?: Record<string, unknown>;
    cause?: Error;
    layer?: 'ROUTE' | 'SERVICE' | 'QUERY';
};

/**
 * Parameters for creating an error
 *
 * This type allows for a combination of error code and error parameters
 * or a full error code string.
 */
export type ErrorParams<C extends TErrorCodeCategory> =
    | (ErrorParamsBase &
          (
              | {
                    code: ErrorCodesByCategory<C>;
                    type: C;
                    errorCode?: never; // Explicitly disallow errorCode when using code+type
                }
              | {
                    errorCode: TErrorFullCode;
                    type?: never; // Explicitly disallow type when using errorCode
                    code?: never; // Explicitly disallow code when using errorCode
                }
          ))
    | TErrorFullCode;

/**
 * Parameters for creating an error for a specific category
 *
 * This type allows for a combination of error code and error parameters
 * or a full error code string.
 */
export type CategoryErrorParams<C extends TErrorCodeCategory> =
    | (ErrorParamsBase & {
          code: ErrorCodesByCategory<C>;
      })
    | ErrorCodesByCategory<C>;

/**
 * ErrorFactory
 *
 * A factory class that provides methods to create standardized error objects
 * for different layers of the application. This ensures consistent error
 * structure and handling throughout the system.
 */
class ErrorFactory {
    /**
     * Creates a base error with the specified parameters
     *
     * This is the foundation method used by all other error creation methods.
     * It constructs a BaseError with consistent structure and properties.
     *
     * @param params - Object containing error parameters or error code string
     * @returns A new BaseError instance
     */
    createError<C extends TErrorCodeCategory>(params: ErrorParams<C>): BaseError {
        const normalizedParams: ErrorParamsBase & { code: TErrorFullCode } =
            typeof params === 'string'
                ? { code: params }
                : 'type' in params
                  ? { ...params, code: `${params.type}.${params.code}` as TErrorFullCode }
                  : { ...params, code: params.errorCode };

        const { code, message, statusCode, details, cause } = normalizedParams;

        // Create the BaseError with object parameters
        return new BaseError({
            errorCode: code,
            message,
            statusCode,
            details: details || {},
            options: {
                cause,
            },
        });
    }

    /**
     * Creates an object parameters for the error
     *
     * @param params - Object containing error parameters or error code string
     * @returns object parameters for the error
     */
    private createObjectParams<C extends TErrorCodeCategory>(
        params: ErrorCodesByCategory<C> | (ErrorParamsBase & { code: ErrorCodesByCategory<C> })
    ): ErrorParamsBase & { code: ErrorCodesByCategory<C> } {
        if (typeof params === 'string') {
            return {
                code: params,
            };
        }
        return params;
    }

    /**
     * Creates an error for the authentication layer
     *
     * Use this for errors related to user authentication,
     * such as invalid credentials or expired tokens.
     *
     * @param params - Object containing error parameters or error code string
     * @returns A new BaseError instance with authentication layer context
     */
    createAuthError(params: CategoryErrorParams<'AUTH'>) {
        return this.createError({
            ...this.createObjectParams<'AUTH'>(params),
            type: 'AUTH',
        });
    }

    /**
     * Creates an error for the validation layer
     *
     * Use this for errors related to invalid input or validation failures.
     *
     * @param params - Object containing error parameters or error code string
     * @returns A new BaseError instance with validation layer context
     */
    createValidationError(params: CategoryErrorParams<'VALIDATION'>) {
        return this.createError({
            ...this.createObjectParams<'VALIDATION'>(params),
            type: 'VALIDATION',
        });
    }

    /**
     * Creates an error for the database layer
     *
     * Use this for errors related to the database.
     *
     * @param params - Object containing error parameters or error code string
     * @returns A new BaseError instance with database layer context
     */
    createDatabaseError(params: CategoryErrorParams<'DB'>) {
        return this.createError({
            ...this.createObjectParams<'DB'>(params),
            type: 'DB',
        });
    }

    /**
     * Creates an error for the server layer
     *
     * Use this for errors related to server operations.
     *
     * @param params - Object containing error parameters or error code string
     * @returns A new BaseError instance with server layer context
     */
    createCookieError(params: CategoryErrorParams<'COOKIE'>) {
        return this.createError({
            ...this.createObjectParams<'COOKIE'>(params),
            type: 'COOKIE',
        });
    }

    /**
     * Creates an error for the server layer
     *
     * Use this for errors related to server operations.
     *
     * @param params - Object containing error parameters or error code string
     * @returns A new BaseError instance with server layer context
     */
    createServerError(params: CategoryErrorParams<'SERVER'>) {
        return this.createError({
            ...this.createObjectParams<'SERVER'>(params),
            type: 'SERVER',
        });
    }

    /**
     * Creates an error for the file layer
     *
     * Use this for errors related to file operations.
     *
     * @param params - Object containing error parameters or error code string
     * @returns A new BaseError instance with file layer context
     */
    createFileError(params: CategoryErrorParams<'FILE'>) {
        return this.createError({
            ...this.createObjectParams<'FILE'>(params),
            type: 'FILE',
        });
    }
}

/**
 * Singleton instance of the ErrorFactory
 *
 * Use this exported instance throughout the application to create
 * standardized error objects.
 *
 * @example
 * ```
 * // Using a short code
 * throw errorFactory.createAuthError('OTP_EXPIRED');
 *
 * // Using a full code
 * throw errorFactory.createAuthError('AUTH.OTP_EXPIRED');
 *
 * // Using with additional parameters
 * throw errorFactory.createAuthError({
 *   code: 'OTP_EXPIRED',
 *   message: 'Your verification code has expired',
 *   details: { expiresAt: expiryTimestamp }
 * });
 * ```
 */
export const errorFactory = new ErrorFactory();
