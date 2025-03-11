import { TErrorCode } from '@/server/lib/error/registry/index';
import { ErrorDefinition } from '@/server/lib/error/registry/types';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { nanoid } from 'nanoid';
import { logger } from '../logger';
import { LogContext } from '../logger/types';
import { sanitizeErrorForPublic, SanitizeErrorOptions } from './sanitize';
import { ErrorChainItem, ErrorLayer, ErrorOptions, TAPIErrorResponse } from './types';

// Metric tracking for errors
const errorMetrics: Record<
    string,
    {
        count: number;
        lastOccurred: Date;
        occurrences: Date[];
    }
> = {};

/**
 * Maps error layer to log context
 */
const LAYER_TO_CONTEXT: Record<ErrorLayer, string> = {
    query: 'database',
    service: 'service',
    route: 'route',
};

/**
 * Parameters for creating a BaseError
 */
export interface BaseErrorParams {
    /** Error definition from registry */
    errorDefinition: ErrorDefinition<TErrorCode>;
    /** Human-readable error message (defaults to errorDefinition.description) */
    message?: string;
    /** HTTP status code (defaults to errorDefinition.statusCode) */
    statusCode?: ContentfulStatusCode;
    /** Additional details about the error */
    details?: Record<string, unknown>;
    /** Additional options for this error */
    options?: ErrorOptions;
}

/**
 * Base error class for all application errors
 *
 * This class extends the native Error class with additional functionality
 * for error tracking, logging, and API response generation.
 *
 * @extends Error
 */
export class BaseError extends Error {
    /**
     * Unique trace ID for this error
     */
    public readonly traceId: string;

    /**
     * Timestamp when this error was created
     */
    public readonly timestamp: Date;

    /**
     * Additional details about the error
     */
    public readonly details: Record<string, unknown>;

    /**
     * Original error that caused this error (if any)
     */
    public readonly originalError?: Error;

    /**
     * Chain of errors that led to this error
     */
    public readonly errorChain: ErrorChainItem[];

    /**
     * Error definition from registry
     */
    public readonly errorDefinition: ErrorDefinition<TErrorCode>;

    /**
     * Error code for this error
     */
    public readonly code: TErrorCode;

    /**
     * HTTP status code for this error
     */
    public readonly statusCode: ContentfulStatusCode;

    /**
     * Creates a new BaseError
     *
     * @param params - Parameters for creating the error
     */
    constructor(params: BaseErrorParams) {
        const { errorDefinition, message, statusCode, details = {}, options = {} } = params;

        // Use provided message or default from error definition
        const errorMessage = message || errorDefinition.description;
        super(errorMessage);

        // Store error definition
        this.errorDefinition = errorDefinition;

        // Use provided code or default from error definition
        this.code = errorDefinition.fullCode;

        // Use provided status code or default from error definition
        this.statusCode = statusCode || errorDefinition.statusCode;

        this.name = 'BaseError';
        this.traceId = nanoid();
        this.timestamp = new Date();
        this.details = details;
        this.originalError = options.cause;

        // Create the initial error chain
        this.errorChain = [
            {
                layer: options.layer || 'route',
                error: errorMessage,
                code: this.code,
                timestamp: this.timestamp,
            },
        ];

        // Track this error occurrence
        this.trackError();
    }

    /**
     * Adds a new error to the error chain
     *
     * This is used when an error is caught and re-thrown with additional context.
     *
     * @param layer - The layer where the error was caught
     * @param error - Human-readable error message
     * @param code - Error code for this layer
     * @returns this (for method chaining)
     */
    addToChain(layer: ErrorLayer, error: string, code: TErrorCode) {
        this.errorChain.push({
            layer,
            error,
            code,
            timestamp: new Date(),
        });
        return this;
    }

    /**
     * Converts this error to an API response suitable for the public client
     *
     * This standardizes the format of error responses across the application.
     *
     * @returns A standardized API error response
     */
    toResponse(options?: SanitizeErrorOptions): TAPIErrorResponse {
        return sanitizeErrorForPublic(this.errorDefinition, this.traceId, this.details, options);
    }

    /**
     * Logs this error
     *
     * The log level is determined by whether this is an expected error.
     * Expected errors (like validation errors) are logged at info level.
     * Unexpected errors are logged at error level.
     *
     * @param requestData - Optional request data to include in the log
     */
    logError(requestData?: { method: string; url: string; status: number }) {
        // Determine if this is an expected error based on stored definition
        const isExpectedError = this.errorDefinition.isExpected;

        const logLevel = isExpectedError ? 'info' : 'error';
        const layer = this.errorChain[0].layer;
        const contextKey = LAYER_TO_CONTEXT[layer].toLowerCase() as LogContext;

        const logData = {
            error_code: this.code,
            error_message: this.message,
            status_code: this.statusCode,
            trace_id: this.traceId,
            timestamp: this.timestamp.toISOString(),
            error_chain: this.errorChain,
            details: this.details,
            request: requestData,
            stack: this.stack,
        };

        if (logLevel === 'info') {
            logger.info(this.message, { context: contextKey, data: logData });
        } else {
            logger.error(this.message, { context: contextKey, data: logData });
        }
    }

    /**
     * Tracks error occurrence for monitoring
     *
     * This maintains in-memory metrics about error occurrences that can
     * be exposed for monitoring and alerting.
     *
     * @private
     */
    private trackError() {
        if (!errorMetrics[this.code]) {
            errorMetrics[this.code] = {
                count: 0,
                lastOccurred: new Date(),
                occurrences: [],
            };
        }

        errorMetrics[this.code].count += 1;
        errorMetrics[this.code].lastOccurred = new Date();

        // Keep track of the last 100 occurrences
        errorMetrics[this.code].occurrences.push(new Date());
        if (errorMetrics[this.code].occurrences.length > 100) {
            errorMetrics[this.code].occurrences.shift();
        }
    }
}

/**
 * Gets metrics about error occurrences
 *
 * This is useful for monitoring and alerting.
 *
 * @returns Object with error metrics
 */
export function getErrorMetrics() {
    return Object.entries(errorMetrics).map(([code, metrics]) => ({
        code,
        count: metrics.count,
        lastOccurred: metrics.lastOccurred,
        recent: metrics.occurrences.slice(-10),
    }));
}
