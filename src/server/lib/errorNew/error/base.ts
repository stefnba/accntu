import { makeError } from '@/server/lib/errorNew/error/factory';
import { TErrorLayer } from '@/server/lib/errorNew/error/types';
import { generateErrorId } from '@/server/lib/errorNew/error/utils';
import { TErrorKeys } from '@/server/lib/errorNew/registry';
import {
    TErrorRegistryDefinition,
    TPublicErrorRegistryDefinition,
} from '@/server/lib/errorNew/registry/types';

export type TAppErrorParams = Required<Omit<TErrorRegistryDefinition, 'layers'>> & {
    key: TErrorKeys;
    cause?: Error;
    layer?: TErrorLayer;
    details?: Record<string, unknown>;
    public?: TPublicErrorRegistryDefinition & { details?: Record<string, unknown> };
};

export interface SerializedAppError {
    name: string;
    message: string;
    code: string;
    httpStatus: number;
    details?: Record<string, unknown>;
    timestamp: string;
    id: string;
    cause?: SerializedAppError | { message: string; stack?: string };
    stack?: string;
    isExpected: boolean;
    public?: TPublicErrorRegistryDefinition & { details?: Record<string, unknown> };
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
     * Returns the error as an object
     */
    toObject(): SerializedAppError {
        let serializedCause: SerializedAppError | { message: string; stack?: string } | undefined;

        if (this.cause) {
            if (AppError.isAppError(this.cause)) {
                serializedCause = this.cause.toObject();
            } else if (this.cause instanceof Error) {
                serializedCause = {
                    message: this.cause.message,
                    stack: this.isExpected ? undefined : this.cause.stack,
                };
            }
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
     */
    static fromUnknown(error: unknown, details?: Record<string, unknown>): AppError {
        if (AppError.isAppError(error)) {
            return error;
        }

        if (error instanceof Error) {
            return makeError('SERVER.INTERNAL_ERROR', {
                message: error.message,
                cause: error,
                details: { ...details, originalError: error.name },
            });
        }

        return makeError('SERVER.INTERNAL_ERROR', {
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
}
