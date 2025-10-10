import { generateErrorId } from '@/server/lib/errorNew/error/utils';
import { TErrorKeys } from '@/server/lib/errorNew/registry';
import { TErrorRegistryDefinition } from '@/server/lib/errorNew/registry/types';

export type TAppErrorParams = TErrorRegistryDefinition & {
    code: TErrorKeys;
    cause?: Error;
};

export class AppError extends Error {
    code: TAppErrorParams['code'];
    httpStatus: TAppErrorParams['httpStatus'];
    isExpected: TAppErrorParams['isExpected'];
    public: TAppErrorParams['public'];
    timestamp: Date;
    cause?: Error;

    readonly traceId?: string; // attach by middleware
    readonly id: string; // stable error id for logs (e.g., ulid/uuid)

    constructor(params: TAppErrorParams) {
        const { code, httpStatus, isExpected, public: publicError, message, cause } = params;

        super(message);

        this.name = 'AppError';
        this.timestamp = new Date();
        this.id = generateErrorId();

        this.code = code;
        this.httpStatus = httpStatus;
        this.isExpected = isExpected;
        this.public = publicError;
        this.cause = cause;
    }

    /**
     * Logs the error
     */
    logError() {
        console.error(this);
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
}
