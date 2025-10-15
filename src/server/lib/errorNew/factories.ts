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

// ============================================
// DOMAIN-SPECIFIC FACTORIES
// ============================================

/**
 * Domain-specific factory for database/query errors
 *
 * Provides semantic methods for common database error scenarios
 * with pre-configured error details and messages.
 */
class QueryErrors extends BaseErrorFactory {
    /**
     * Database duplicate key/unique constraint violation
     *
     * @param params - Table, field, and value details
     * @returns AppError instance
     *
     * @example
     * ```typescript
     * throw QueryErrors.duplicate({
     *   table: 'users',
     *   field: 'email',
     *   value: 'test@example.com',
     *   cause: prismaError
     * });
     * ```
     */
    static duplicate(params: { table: string; field: string; value: unknown; cause?: Error }) {
        return this.createFromRegistry('OPERATION', 'CREATE_FAILED', {
            message: `Duplicate ${params.field} in ${params.table}: ${params.value}`,
            cause: params.cause,
            details: {
                table: params.table,
                field: params.field,
                value: params.value,
                reason: 'duplicate_key',
            },
            layer: 'db',
        });
    }

    /**
     * Database record not found
     *
     * @param params - Table and ID details
     * @returns AppError instance
     *
     * @example
     * ```typescript
     * throw QueryErrors.notFound({
     *   table: 'posts',
     *   id: '123'
     * });
     * ```
     */
    static notFound(params: { table: string; id: string }) {
        return this.createFromRegistry('RESOURCE', 'NOT_FOUND', {
            message: `${params.table} with id ${params.id} not found`,
            details: {
                table: params.table,
                id: params.id,
            },
            layer: 'db',
        });
    }

    /**
     * Foreign key constraint violation
     *
     * @param params - Table, field, and referenced table details
     * @returns AppError instance
     *
     * @example
     * ```typescript
     * throw QueryErrors.foreignKeyViolation({
     *   table: 'posts',
     *   field: 'userId',
     *   referencedTable: 'users',
     *   cause: prismaError
     * });
     * ```
     */
    static foreignKeyViolation(params: {
        table: string;
        field: string;
        referencedTable: string;
        cause?: Error;
    }) {
        return this.createFromRegistry('VALIDATION', 'INVALID_INPUT', {
            message: `Invalid ${params.field}: referenced ${params.referencedTable} does not exist`,
            cause: params.cause,
            details: {
                table: params.table,
                field: params.field,
                referencedTable: params.referencedTable,
                constraint: 'foreign_key',
            },
            layer: 'db',
        });
    }
}

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
}
