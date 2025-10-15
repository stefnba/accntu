import { TErrorLayer } from './base/error/types';
import { BaseErrorFactory } from './base/factory/error-factory';
import {
    AuthError,
    OperationError,
    PermissionError,
    ResourceError,
    ServerError,
    ValidationError,
} from './errors';
import { TErrorCodeByCategory, TErrorKeys } from './registry';

// ============================================
// GENERAL FACTORY FUNCTION
// ============================================

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
 * throw makeError('VALIDATION.INVALID_INPUT', {
 *   message: 'Email is required',
 *   details: { field: 'email' }
 * });
 * ```
 */
export function makeError(
    key: TErrorKeys,
    params?: {
        message?: string;
        cause?: Error;
        details?: Record<string, unknown>;
        layer?: TErrorLayer;
    }
) {
    const [category, code] = key.split('.');
    return BaseErrorFactory['createFromRegistry'](category, code, params);
}

// ============================================
// CATEGORY-SPECIFIC FACTORIES
// ============================================

/**
 * Factory for creating validation errors
 *
 * Validation errors are expected errors that occur during input validation.
 * They typically have 400 status codes and are safe to show to users.
 */
export class ValidationErrors extends BaseErrorFactory {
    /**
     * Create a validation error
     *
     * @param code - Validation error code
     * @param params - Optional error parameters
     * @returns ValidationError instance
     *
     * @example
     * ```typescript
     * throw ValidationErrors.make('INVALID_INPUT', {
     *   message: 'Email is required',
     *   details: { field: 'email' }
     * });
     * ```
     */
    static make(
        code: TErrorCodeByCategory<'VALIDATION'>,
        params?: {
            message?: string;
            cause?: Error;
            details?: Record<string, unknown>;
            layer?: TErrorLayer;
        }
    ): ValidationError {
        const appError = this.createFromRegistry('VALIDATION', code, params);
        return new ValidationError({
            code: appError.code,
            httpStatus: appError.httpStatus,
            public: appError.public,
            isExpected: appError.isExpected,
            message: appError.message,
            cause: appError.cause,
            details: appError.details,
            layer: appError.layer,
        });
    }
}

/**
 * Factory for creating authentication/authorization errors
 */
export class AuthErrors extends BaseErrorFactory {
    /**
     * Create an auth error
     *
     * @param code - Auth error code
     * @param params - Optional error parameters
     * @returns AuthError instance
     */
    static make(
        code: TErrorCodeByCategory<'AUTH'>,
        params?: {
            message?: string;
            cause?: Error;
            details?: Record<string, unknown>;
            layer?: TErrorLayer;
        }
    ): AuthError {
        const appError = this.createFromRegistry('AUTH', code, params);
        return new AuthError({
            code: appError.code,
            httpStatus: appError.httpStatus,
            public: appError.public,
            isExpected: appError.isExpected,
            message: appError.message,
            cause: appError.cause,
            details: appError.details,
            layer: appError.layer,
        });
    }
}

/**
 * Factory for creating resource errors (not found, already exists, etc.)
 */
export class ResourceErrors extends BaseErrorFactory {
    /**
     * Create a resource error
     *
     * @param code - Resource error code
     * @param params - Optional error parameters
     * @returns ResourceError instance
     */
    static make(
        code: TErrorCodeByCategory<'RESOURCE'>,
        params?: {
            message?: string;
            cause?: Error;
            details?: Record<string, unknown>;
            layer?: TErrorLayer;
        }
    ): ResourceError {
        const appError = this.createFromRegistry('RESOURCE', code, params);
        return new ResourceError({
            code: appError.code,
            httpStatus: appError.httpStatus,
            public: appError.public,
            isExpected: appError.isExpected,
            message: appError.message,
            cause: appError.cause,
            details: appError.details,
            layer: appError.layer,
        });
    }
}

/**
 * Factory for creating operation errors (create, update, delete failures)
 */
export class OperationErrors extends BaseErrorFactory {
    /**
     * Create an operation error
     *
     * @param code - Operation error code
     * @param params - Optional error parameters
     * @returns OperationError instance
     */
    static make(
        code: TErrorCodeByCategory<'OPERATION'>,
        params?: {
            message?: string;
            cause?: Error;
            details?: Record<string, unknown>;
            layer?: TErrorLayer;
        }
    ): OperationError {
        const appError = this.createFromRegistry('OPERATION', code, params);
        return new OperationError({
            code: appError.code,
            httpStatus: appError.httpStatus,
            public: appError.public,
            isExpected: appError.isExpected,
            message: appError.message,
            cause: appError.cause,
            details: appError.details,
            layer: appError.layer,
        });
    }
}

/**
 * Factory for creating permission errors (access denied, insufficient role, etc.)
 */
export class PermissionErrors extends BaseErrorFactory {
    /**
     * Create a permission error
     *
     * @param code - Permission error code
     * @param params - Optional error parameters
     * @returns PermissionError instance
     */
    static make(
        code: TErrorCodeByCategory<'PERMISSION'>,
        params?: {
            message?: string;
            cause?: Error;
            details?: Record<string, unknown>;
            layer?: TErrorLayer;
        }
    ): PermissionError {
        const appError = this.createFromRegistry('PERMISSION', code, params);
        return new PermissionError({
            code: appError.code,
            httpStatus: appError.httpStatus,
            public: appError.public,
            isExpected: appError.isExpected,
            message: appError.message,
            cause: appError.cause,
            details: appError.details,
            layer: appError.layer,
        });
    }
}

/**
 * Factory for creating server errors (internal errors, service unavailable, etc.)
 */
export class ServerErrors extends BaseErrorFactory {
    /**
     * Create a server error
     *
     * @param code - Server error code
     * @param params - Optional error parameters
     * @returns ServerError instance
     */
    static make(
        code: TErrorCodeByCategory<'SERVER'>,
        params?: {
            message?: string;
            cause?: Error;
            details?: Record<string, unknown>;
            layer?: TErrorLayer;
        }
    ): ServerError {
        const appError = this.createFromRegistry('SERVER', code, params);
        return new ServerError({
            code: appError.code,
            httpStatus: appError.httpStatus,
            public: appError.public,
            isExpected: appError.isExpected,
            message: appError.message,
            cause: appError.cause,
            details: appError.details,
            layer: appError.layer,
        });
    }
}

// ============================================
// DOMAIN-SPECIFIC FACTORIES
// ============================================

/**
 * Domain-specific factory for database/query errors
 *
 * Provides semantic methods for common database error scenarios
 * with pre-configured error details and messages.
 */
export class QueryErrors extends BaseErrorFactory {
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
