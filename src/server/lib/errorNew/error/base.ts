import { makeError } from '@/server/lib/errorNew/error/factory';
import { TErrorLayer } from '@/server/lib/errorNew/error/types';
import { generateErrorId } from '@/server/lib/errorNew/error/utils';
import { TErrorKeys } from '@/server/lib/errorNew/registry';
import { TErrorRegistryDefinition } from '@/server/lib/errorNew/registry/types';

export type TAppErrorParams = Required<Omit<TErrorRegistryDefinition, 'layers'>> & {
    key: TErrorKeys;
    cause?: Error;
    layer?: TErrorLayer;
    details?: Record<string, unknown>;
};

export interface SerializedAppError {
    name: string;
    message: string;
    code: string;
    httpStatus: number;
    details?: Record<string, unknown>;
    // context?: ErrorContext;
    timestamp: string;
    requestId?: string;
    id: string;
    cause?: SerializedAppError;
    stack?: string;
}

export class AppError extends Error {
    key: TAppErrorParams['key'];
    code: string;
    category: string;
    httpStatus: TAppErrorParams['httpStatus'];
    isExpected: TAppErrorParams['isExpected'];
    public: TAppErrorParams['public'];
    timestamp: Date;
    cause?: Error;
    details?: Record<string, unknown>;

    readonly traceId?: string; // attach by middleware
    readonly id: string; // stable error id for logs (e.g., ulid/uuid)

    constructor(params: TAppErrorParams) {
        const {
            key,
            httpStatus,
            isExpected,
            public: publicError,
            message,
            cause,
            details,
        } = params;

        const [category, code] = key.split('.');

        super(message);

        // Maintain proper stack trace for where error was thrown
        Error.captureStackTrace(this, this.constructor);

        this.name = this.createErrorName(code);
        this.details = details;
        this.timestamp = new Date();
        this.id = generateErrorId();

        this.code = code;
        this.category = category;
        this.key = key;
        this.httpStatus = httpStatus;
        this.isExpected = isExpected;
        this.public = publicError;
        this.cause = cause;

        // Ensure prototype chain is maintained
        Object.setPrototypeOf(this, new.target.prototype);
    }

    /**
     * Logs the error
     */
    logError() {
        console.error(this);
    }

    /**
     * Returns the error as an object
     */
    toObject(): SerializedAppError {
        const obj: SerializedAppError = {
            message: this.message,
            name: this.name,
            code: this.code,
            // category: this.category,
            httpStatus: this.httpStatus,
            // isExpected: this.isExpected,
            // public: this.public,
            details: this.details || {},
            timestamp: this.timestamp.toISOString(),
            id: this.id,
            // cause: this.cause ? this.cause.toObject() : undefined,
            stack: this.stack,
        };

        return obj;
    }

    /**
     * Returns the error as a JSON string
     */
    toJSON() {
        return JSON.stringify(this.toObject());
    }

    /**
     * Type guard to check if an unknown value is a AppError
     *
     * @param error - The value to check
     * @returns True if the value is a AppError
     */
    isAppError(error: unknown): error is AppError {
        return !!error && typeof error === 'object' && error instanceof AppError;
    }

    /**
     * Converts an unknown error to a AppError
     *
     * @param error - The error to convert
     * @returns A AppError
     */
    convertToAppError(error: unknown, details?: Record<string, unknown>): AppError {
        // If the error is already a AppError, return it
        if (this.isAppError(error)) {
            return error;
        }

        // If the error is an Error, create a AppError from it
        if (error instanceof Error) {
            return makeError('SERVER.INTERNAL_ERROR', {
                message: error.message,
                cause: error,
                details: { error, ...details },
            });
        }

        // If the error is unknown, create a AppError from it
        return makeError('SERVER.INTERNAL_ERROR', {
            message: 'Unknown error',
            details: { error, ...details },
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
}
