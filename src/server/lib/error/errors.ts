import { AppError, BaseAppError } from '@/server/lib/error/base/error/app-error';
import { TDomainErrorParams } from '@/server/lib/error/base/error/types';

/**
 * Validation error class for input validation failures
 *
 * Use this for errors related to invalid user input, missing fields, or format violations.
 * These are expected errors that occur during normal operation and typically return 400 status.
 *
 * @example
 * ```typescript
 * throw new ValidationError({
 *   code: 'INVALID_INPUT',
 *   message: 'Email is required',
 *   httpStatus: 400,
 *   public: PUBLIC_ERROR_REGISTRY.INVALID_INPUT,
 *   isExpected: true,
 *   details: { field: 'email' }
 * });
 * ```
 */
export class ValidationError extends AppError {
    constructor(params: TDomainErrorParams<'VALIDATION'>) {
        super({
            ...params,
            category: 'VALIDATION',
        });
    }
}

/**
 * Authentication error class for auth-related failures
 *
 * Use this for errors related to authentication/authorization like invalid tokens,
 * missing credentials, or expired sessions. Typically returns 401 status.
 *
 * @example
 * ```typescript
 * throw new AuthError({
 *   code: 'UNAUTHORIZED',
 *   message: 'Invalid token',
 *   httpStatus: 401,
 *   public: PUBLIC_ERROR_REGISTRY.UNAUTHORIZED,
 *   isExpected: true
 * });
 * ```
 */
export class AuthError extends AppError {
    constructor(params: TDomainErrorParams<'AUTH'>) {
        super({
            ...params,
            category: 'AUTH',
        });
    }
}

/**
 * Resource error class for resource-related failures
 *
 * Use this for errors related to resource existence like not found, already exists,
 * or conflicts. Typically returns 404 or 409 status.
 *
 * @example
 * ```typescript
 * throw new ResourceError({
 *   code: 'NOT_FOUND',
 *   message: 'User not found',
 *   httpStatus: 404,
 *   public: PUBLIC_ERROR_REGISTRY.NOT_FOUND,
 *   isExpected: true,
 *   details: { userId: '123' }
 * });
 * ```
 */
export class ResourceError extends AppError {
    constructor(params: TDomainErrorParams<'RESOURCE'>) {
        super({
            ...params,
            category: 'RESOURCE',
        });
    }
}

/**
 * Operation error class for operation failures
 *
 * Use this for errors during CRUD operations like create, update, or delete failures.
 * These are unexpected errors that typically return 500 status.
 *
 * @example
 * ```typescript
 * throw new OperationError({
 *   code: 'CREATE_FAILED',
 *   message: 'Failed to create user',
 *   httpStatus: 500,
 *   public: PUBLIC_ERROR_REGISTRY.OPERATION_FAILED,
 *   isExpected: false,
 *   cause: dbError
 * });
 * ```
 */
export class OperationError extends AppError {
    constructor(params: TDomainErrorParams<'OPERATION'>) {
        super({
            ...params,
            category: 'OPERATION',
        });
    }
}

/**
 * Permission error class for access control failures
 *
 * Use this for errors related to permissions and access control like insufficient
 * role or access denied. Typically returns 403 status.
 *
 * @example
 * ```typescript
 * throw new PermissionError({
 *   code: 'ACCESS_DENIED',
 *   message: 'Insufficient permissions',
 *   httpStatus: 403,
 *   public: PUBLIC_ERROR_REGISTRY.FORBIDDEN,
 *   isExpected: true,
 *   details: { requiredRole: 'admin', userRole: 'user' }
 * });
 * ```
 */
export class PermissionError extends BaseAppError<'PERMISSION'> {
    constructor(params: TDomainErrorParams<'PERMISSION'>) {
        super('PERMISSION', params);
    }
}

/**
 * Server error class for internal server failures
 *
 * Use this for unexpected internal errors, service unavailable, or infrastructure
 * failures. Typically returns 500 or 503 status.
 *
 * @example
 * ```typescript
 * throw new ServerError({
 *   code: 'INTERNAL_ERROR',
 *   message: 'Database connection failed',
 *   httpStatus: 500,
 *   public: PUBLIC_ERROR_REGISTRY.INTERNAL_ERROR,
 *   isExpected: false,
 *   cause: connectionError
 * });
 * ```
 */
export class ServerError extends BaseAppError<'SERVER'> {
    constructor(params: TDomainErrorParams<'SERVER'>) {
        super('SERVER', params);
    }
}
