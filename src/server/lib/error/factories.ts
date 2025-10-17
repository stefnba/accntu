import { BaseErrorFactory } from './base/factory/error-factory';
import { TErrorFactoryParams } from './base/factory/types';
import {
    AuthError,
    OperationError,
    PermissionError,
    ResourceError,
    ServerError,
    ValidationError,
} from './errors';
import { TErrorCategory, TErrorCodeByCategory, TErrorKeys } from './registry';

/**
 * AppErrors factory
 *
 * Creates an AppError by looking up the error definition in the registry.
 * Use this for generic error creation or when the error category is dynamic.
 */
export class AppErrors extends BaseErrorFactory {
    /**
     * General error factory function
     *
     * Creates an AppError by looking up the error definition in the registry.
     * Use this for generic error creation or when the error category is dynamic.
     *
     * @param key - Full error key (e.g., 'VALIDATION.INVALID_INPUT')
     * @param params - Optional error parameters
     * @returns AppError instance
     *
     * @example
     * ```typescript
     * throw AppErrors.raise('VALIDATION.INVALID_INPUT', {
     *   message: 'Email is required',
     *   details: { field: 'email' }
     * });
     * ```
     */
    static raise(key: TErrorKeys, params?: TErrorFactoryParams) {
        const [category, code] = key.split('.') as [
            TErrorCategory,
            TErrorCodeByCategory<TErrorCategory>,
        ];
        return BaseErrorFactory['createFromRegistry'](category, code, params);
    }

    /**
     * Factory for creating server errors (internal errors, service unavailable, etc.)
     */

    static server(code: TErrorCodeByCategory<'SERVER'>, params?: TErrorFactoryParams) {
        return new ServerError(this.buildErrorParams('SERVER', code, params));
    }

    /**
     * Factory for creating authentication/authorization errors
     */
    static auth(code: TErrorCodeByCategory<'AUTH'>, params?: TErrorFactoryParams) {
        return new AuthError(this.buildErrorParams('AUTH', code, params));
    }

    /**
     * Factory for creating validation errors
     *
     * Validation errors are expected errors that occur during input validation.
     * They typically have 400 status codes and are safe to show to users.
     */
    static validation(code: TErrorCodeByCategory<'VALIDATION'>, params?: TErrorFactoryParams) {
        return new ValidationError(this.buildErrorParams('VALIDATION', code, params));
    }

    /**
     * Factory for creating resource errors (not found, already exists, etc.)
     */
    static resource(code: TErrorCodeByCategory<'RESOURCE'>, params?: TErrorFactoryParams) {
        return new ResourceError(this.buildErrorParams('RESOURCE', code, params));
    }

    /**
     * Factory for creating operation errors (create, update, delete failures)
     */
    static operation(code: TErrorCodeByCategory<'OPERATION'>, params?: TErrorFactoryParams) {
        return new OperationError(this.buildErrorParams('OPERATION', code, params));
    }

    /**
     * Factory for creating permission errors (access denied, insufficient role, etc.)
     */
    static permission(code: TErrorCodeByCategory<'PERMISSION'>, params?: TErrorFactoryParams) {
        return new PermissionError(this.buildErrorParams('PERMISSION', code, params));
    }

    /**
     * Factory for creating database errors (connection, query, constraint violations)
     *
     * Database errors represent failures in database operations including:
     * - Connection issues (CONNECTION_ERROR)
     * - Query execution failures (QUERY_FAILED)
     * - Constraint violations (UNIQUE_VIOLATION, FOREIGN_KEY_VIOLATION)
     * - Transaction failures (TRANSACTION_FAILED)
     * - Invalid output (INVALID_OUTPUT)
     */
    static db(code: TErrorCodeByCategory<'DB'>, params?: TErrorFactoryParams) {
        return this.raise(`DB.${code}`, params);
    }

    /**
     * Factory for creating cookie errors (invalid, missing, expired, tampered)
     *
     * Cookie errors represent issues with HTTP cookies used for session management:
     * - Invalid cookie values (INVALID_VALUE)
     * - Missing required cookies (MISSING)
     * - Expired cookies (EXPIRED)
     * - Tampered cookies (TAMPERED)
     */
    static cookie(code: TErrorCodeByCategory<'COOKIE'>, params?: TErrorFactoryParams) {
        return this.raise(`COOKIE.${code}`, params);
    }
}
