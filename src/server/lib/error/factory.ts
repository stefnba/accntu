// src/server/error/factory.ts
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { BaseError } from './base';
import { ErrorCode, ErrorOptions } from './types';

/**
 * Parameters for creating an error
 */
export type ErrorParams = {
    message: string;
    code: ErrorCode;
    statusCode?: ContentfulStatusCode;
    cause?: Error;
    layer?: ErrorOptions['layer'];
    details?: Record<string, unknown>;
};

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
     * @param params - Object containing error parameters
     * @returns A new BaseError instance
     */
    createError(params: ErrorParams): BaseError {
        const { message, code, statusCode, cause, layer, details } = params;
        return new BaseError(message, code, statusCode || 500, details || {}, {
            cause,
            layer,
        });
    }

    /**
     * Creates an error for the API layer
     *
     * Use this for errors that occur in API routes, controllers, or middleware.
     *
     * @param params - Object containing error parameters
     * @returns A new BaseError instance with API layer context
     */
    createApiError(params: Omit<ErrorParams, 'layer'>): BaseError {
        return this.createError({
            ...params,
            statusCode: params.statusCode || 400,
            layer: 'route',
        });
    }

    /**
     * Creates an error for the service layer
     *
     * Use this for errors that occur in business logic or service functions.
     *
     * @param params - Object containing error parameters
     * @returns A new BaseError instance with service layer context
     */
    createServiceError(params: Omit<ErrorParams, 'layer'>): BaseError {
        return this.createError({
            ...params,
            statusCode: params.statusCode || 500,
            layer: 'service',
        });
    }

    /**
     * Creates an error for the database layer
     *
     * Use this for errors that occur during database operations.
     *
     * @param params - Object containing error parameters
     * @returns A new BaseError instance with database layer context
     */
    createDatabaseError(params: Omit<ErrorParams, 'layer'>): BaseError {
        return this.createError({
            ...params,
            statusCode: params.statusCode || 500,
            layer: 'query',
        });
    }

    /**
     * Creates an error for the validation layer
     *
     * Use this for errors that occur during data validation,
     * such as schema validation failures.
     *
     * @param params - Object containing error parameters
     * @returns A new BaseError instance with validation layer context
     */
    createValidationError(params: Omit<ErrorParams, 'layer'>): BaseError {
        return this.createError({
            ...params,
            statusCode: params.statusCode || 400,
            layer: 'route',
        });
    }

    /**
     * Creates an error for external service interactions
     *
     * Use this for errors that occur during interactions with external services,
     * such as third-party APIs or external systems.
     *
     * @param params - Object containing error parameters
     * @returns A new BaseError instance with service layer context
     */
    createExternalError(params: Omit<ErrorParams, 'layer'>): BaseError {
        return this.createError({
            ...params,
            statusCode: params.statusCode || 502,
            layer: 'service',
        });
    }

    /**
     * Creates an error for the authentication layer
     *
     * Use this for errors related to user authentication,
     * such as invalid credentials or expired tokens.
     *
     * @param params - Object containing error parameters
     * @returns A new BaseError instance with authentication layer context
     */
    createAuthError(params: Omit<ErrorParams, 'layer'>): BaseError {
        return this.createError({
            ...params,
            statusCode: params.statusCode || 401,
            layer: 'service',
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
 * // Creating a service error
 * throw errorFactory.createServiceError({
 *   message: 'User not found',
 *   code: 'USER.NOT_FOUND',
 *   cause: originalError,
 *   statusCode: 404
 * });
 * ```
 */
export const errorFactory = new ErrorFactory();
