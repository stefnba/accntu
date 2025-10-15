import {
    ErrorChainContext,
    SerializedAppError,
    TAppErrorParams,
    TDomainErrorParams,
    TErrorChainItem,
    TErrorLayer,
    TErrorRequestData,
} from '@/server/lib/errorNew/base/error/types';
import { TPublicErrorRegistryDefinitionWithCode } from '@/server/lib/errorNew/base/registry/types';
import { generateErrorId } from '@/server/lib/errorNew/base/utils';
import { TErrorCategory } from '@/server/lib/errorNew/registry';
import { logger } from '@/server/lib/logger';

export class AppError extends Error {
    /**
     * The full qualified key of the error
     */
    key: string;
    /**
     * The code of the error
     */
    code: string;
    /**
     * The category of the error
     */
    category: string;
    /**
     * The HTTP status code of the error
     */
    httpStatus: TAppErrorParams['httpStatus'];
    /**
     * Whether the error is expected
     */
    isExpected: TAppErrorParams['isExpected'];
    /**
     * The public error information
     */
    public: TAppErrorParams['public'];
    /**
     * The timestamp of the error
     */
    timestamp: Date;
    /**
     * The cause of the error
     */
    cause?: Error;
    /**
     * The details of the error
     */
    details?: Record<string, unknown>;
    /**
     * The layer of the error
     */
    layer?: TErrorLayer;

    /**
     * The request ID of the error. Attach by middleware
     */
    readonly requestId?: string;
    /**
     * The ID of the error. Stable error id for logs (e.g., ulid/uuid)
     */
    readonly id: string;

    private static readonly MAX_SERIALIZATION_DEPTH = 10;

    constructor(params: TAppErrorParams) {
        const {
            httpStatus,
            isExpected,
            public: publicError,
            message,
            cause,
            details,
            code,
            category,
            layer,
        } = params;

        super(message);

        // Maintain proper stack trace for where error was thrown
        Error.captureStackTrace(this, this.constructor);

        this.name = this.createErrorName(category);
        this.details = details;
        this.timestamp = new Date();
        this.id = generateErrorId();

        this.code = code;
        this.category = category;
        this.key = `${category}.${code}`;
        this.httpStatus = httpStatus;
        this.isExpected = isExpected;
        this.public = publicError;
        this.cause = cause;
        this.layer = layer;

        // Ensure prototype chain is maintained
        Object.setPrototypeOf(this, new.target.prototype);
    }

    /**
     * Returns the error as an object
     *
     * @param depth - Current recursion depth (internal use)
     * @returns Serialized error object
     */
    toObject(depth = 0): SerializedAppError {
        let serializedCause: SerializedAppError | { message: string; stack?: string } | undefined;

        if (this.cause && depth < AppError.MAX_SERIALIZATION_DEPTH) {
            if (AppError.isAppError(this.cause)) {
                serializedCause = this.cause.toObject(depth + 1);
            } else if (this.cause instanceof Error) {
                serializedCause = {
                    message: this.cause.message,
                    stack: this.isExpected ? undefined : this.cause.stack,
                };
            }
        } else if (this.cause && depth >= AppError.MAX_SERIALIZATION_DEPTH) {
            serializedCause = {
                message: `[Max serialization depth ${AppError.MAX_SERIALIZATION_DEPTH} reached]`,
            };
        }

        return {
            message: this.message,
            name: this.name,
            code: this.code,
            httpStatus: this.httpStatus,
            isExpected: this.isExpected,
            public: this.public,
            details: this.details,
            timestamp: this.timestamp.toISOString(),
            id: this.id,
            cause: serializedCause,
            stack: this.isExpected ? undefined : this.stack,
        };
    }

    /**
     * Type guard to check if an unknown value is a AppError
     *
     * @param error - The value to check
     * @returns True if the value is a AppError
     */
    static isAppError(error: unknown): error is AppError {
        return !!error && typeof error === 'object' && error instanceof AppError;
    }

    /**
     * Converts an unknown error to a AppError
     *
     * @param error - The error to convert
     * @param details - Additional details to attach to the error
     * @returns A AppError
     *
     * @example
     * ```typescript
     * try {
     *   await someOperation();
     * } catch (err) {
     *   throw AppError.fromUnknown(err, { context: 'someOperation' });
     * }
     * ```
     */
    static fromUnknown(error: unknown, details?: Record<string, unknown>): AppError {
        if (AppError.isAppError(error)) {
            return error;
        }

        const publicError: TPublicErrorRegistryDefinitionWithCode = {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
            i18nKey: 'ERRORS.INTERNAL_ERROR',
            httpStatus: 500,
        };

        // Create error directly to avoid circular dependency with factories
        if (error instanceof Error) {
            return new AppError({
                category: 'SERVER',
                code: 'INTERNAL_ERROR',
                httpStatus: 500,
                public: publicError,
                isExpected: false,
                message: error.message,
                cause: error,
                details: { ...details, originalError: error.name },
            });
        }

        // Create error directly to avoid circular dependency with factories
        return new AppError({
            category: 'SERVER',
            code: 'INTERNAL_ERROR',
            httpStatus: 500,
            public: publicError,
            isExpected: false,
            message: 'Unknown error',
            details: { ...details, error },
        });
    }

    /**
     * Creates the error name
     *
     * @param category - The category of the error
     * @returns The error name
     */
    private createErrorName(category: string) {
        return `${category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()}Error`;
    }

    /**
     * Get root cause (deepest error in chain)
     *
     * @returns The deepest error in the cause chain
     *
     * @example
     * ```typescript
     * const root = error.getRootCause();
     * // Returns: PrismaError (if that's the deepest)
     * ```
     */
    getRootCause(): Error {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let current: Error = this;
        while ('cause' in current && current.cause instanceof Error) {
            current = current.cause;
        }
        return current;
    }

    /**
     * Get chain depth (1 = no cause, 2 = one cause, etc.)
     *
     * @returns Number of errors in the chain
     *
     * @example
     * ```typescript
     * const depth = error.getChainDepth();
     * // Returns: 3 (current error + 2 causes)
     * ```
     */
    getChainDepth(): number {
        let depth = 1;
        let current = this.cause;
        while (current && depth < 50) {
            depth++;
            current =
                'cause' in current && current.cause instanceof Error ? current.cause : undefined;
        }
        return depth;
    }

    /**
     * Check if specific error type exists in chain
     *
     * @param predicate - Function to test each error in chain
     * @returns true if predicate matches any error in chain
     *
     * @example
     * ```typescript
     * const hasPrismaError = error.hasInChain(e => e.name.includes('Prisma'));
     * ```
     */
    hasInChain(predicate: (err: Error) => boolean): boolean {
        let current: Error | undefined = this.cause;
        while (current) {
            if (predicate(current)) return true;
            current =
                'cause' in current && current.cause instanceof Error ? current.cause : undefined;
        }
        return false;
    }

    /**
     * Get structured context for logging/monitoring
     *
     * Builds a complete picture of the error chain with metadata for each error.
     * Includes depth, names, messages, and AppError-specific fields (id, key, httpStatus).
     *
     * Chain depth numbering: 0 = latest error (top of chain), highest = root cause (bottom of chain)
     *
     * @returns Structured error chain context
     *
     * @example
     * ```typescript
     * const context = error.getChainContext();
     * // {
     * //   depth: 3,
     * //   rootCause: { name: 'Error', message: 'Unique constraint failed' },
     * //   chain: [
     * //     { depth: 0, name: 'Internal_errorError', id: 'abc123', key: 'SERVER.INTERNAL_ERROR', ... },
     * //     { depth: 1, name: 'Create_failedError', id: 'xyz789', key: 'OPERATION.CREATE_FAILED', ... },
     * //     { depth: 2, name: 'Error', message: 'Unique constraint failed' }
     * //   ]
     * // }
     * ```
     */
    getChain(): ErrorChainContext {
        const chain: ErrorChainContext['chain'] = [];
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let current: Error | undefined = this;
        let depth = 0;

        // Build chain (limit to 50 for safety)
        // depth: 0 = latest error, highest depth = root cause
        while (current && depth < 50) {
            const entry: TErrorChainItem = {
                depth,
                name: current.name,
                message: current.message,
            };

            // Add AppError-specific fields
            if (AppError.isAppError(current)) {
                entry.id = current.id;
                entry.key = current.key;
                entry.code = current.code;
                entry.category = current.category;
                entry.layer = current.layer;
            }

            chain.push(entry);
            current =
                'cause' in current && current.cause instanceof Error ? current.cause : undefined;
            depth++;
        }

        const rootCause = chain[chain.length - 1];

        return {
            depth: chain.length,
            rootCause: {
                name: rootCause.name,
                message: rootCause.message,
                id: rootCause.id,
                key: rootCause.key,
            },
            chain,
        };
    }

    /**
     * Logs the error with optional chain context
     *
     * @param requestData - Optional request data to include in the log
     * @param options - Additional options for logging
     * @param options.includeChain - Whether to include error chain context (default: true)
     * @param options.includeStack - Whether to include stack trace (default: true)
     *
     * @example
     * ```typescript
     * error.log({ method: 'POST', url: '/api/users', userId: '123', status: 500 });
     * // Logs with full chain context showing error propagation
     * ```
     */
    log(
        requestData?: TErrorRequestData,
        options: { includeChain?: boolean; includeStack?: boolean } = {}
    ) {
        const { includeChain = true, includeStack = true } = options;

        const logData: Record<string, unknown> = {
            ...this.toObject(),
            stack: !this.isExpected || includeStack ? this.stack : undefined,
            request: requestData,
        };

        // Add chain context if requested and chain exists
        if (includeChain && this.cause) {
            logData.chain = this.getChain();
        }

        if (this.isExpected) {
            logger.info(this.message, { data: logData });
        } else {
            logger.error(this.message, { data: logData });
        }
    }
}

export class BaseAppError<C extends TErrorCategory> extends AppError {
    constructor(category: C, params: TDomainErrorParams<C>) {
        super({
            ...params,
            category,
        });
    }
}
