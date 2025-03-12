import { TErrorCode } from '@/server/lib/error/registry/index';
import { ErrorDefinition } from '@/server/lib/error/registry/types';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { logger } from '../logger';
import { LogContext } from '../logger/types';
import { sanitizeErrorForPublic, SanitizeErrorOptions } from './sanitize';
import { ErrorChainItem, ErrorLayer, ErrorOptions, TAPIErrorResponse } from './types';
import { generateErrorId } from './utils';

// Metric tracking for errors
const errorMetrics: Record<
    string,
    {
        count: number;
        lastOccurred: Date;
        occurrences: Date[];
    }
> = {};

// Buffer for batching error metrics updates
const ERROR_METRICS_BUFFER: Record<string, { count: number; timestamps: Date[] }> = {};

// Configuration for metrics flushing
const METRICS_FLUSH_INTERVAL = 5000; // 5 seconds
let metricsFlushIntervalId: NodeJS.Timeout | null = null;

/**
 * Flushes buffered error metrics to the main metrics store
 * Called periodically by the flush interval
 */
function flushErrorMetrics() {
    Object.entries(ERROR_METRICS_BUFFER).forEach(([code, { count, timestamps }]) => {
        if (!errorMetrics[code]) {
            errorMetrics[code] = { count: 0, lastOccurred: new Date(), occurrences: [] };
        }

        errorMetrics[code].count += count;
        errorMetrics[code].lastOccurred = timestamps[timestamps.length - 1];

        // Add new occurrences while maintaining max length
        errorMetrics[code].occurrences.push(...timestamps);
        if (errorMetrics[code].occurrences.length > 100) {
            errorMetrics[code].occurrences = errorMetrics[code].occurrences.slice(-100);
        }
    });

    // Reset buffer
    Object.keys(ERROR_METRICS_BUFFER).forEach((key) => delete ERROR_METRICS_BUFFER[key]);
}

// Start the flush interval when this module is loaded
if (typeof window === 'undefined' && !metricsFlushIntervalId) {
    // Server-side only
    metricsFlushIntervalId = setInterval(flushErrorMetrics, METRICS_FLUSH_INTERVAL);
}

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
     * Lazily constructed on first access
     */
    private _errorChain?: ErrorChainItem[];

    /**
     * Get the error chain
     * Constructed lazily on first access
     */
    public get errorChain(): ErrorChainItem[] {
        if (!this._errorChain) {
            this._errorChain = [
                {
                    layer: this.originalLayer,
                    error: this.message,
                    code: this.code,
                    timestamp: this.timestamp,
                },
            ];
        }
        return this._errorChain;
    }

    /**
     * The original layer where the error occurred
     */
    private readonly originalLayer: ErrorLayer;

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
     * Cached public response - cleared when options change
     */
    private _cachedResponse?: TAPIErrorResponse;

    /**
     * Cached response options to detect changes
     */
    private _cachedOptions?: string;

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
        this.traceId = generateErrorId();
        this.timestamp = new Date();
        this.details = details;
        this.originalError = options.cause;

        // Store the original layer
        this.originalLayer = options.layer || 'route';

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
        // Ensure the chain is initialized by accessing the getter
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
     * @param options - Options for customizing the sanitization
     * @returns A standardized API error response
     */
    toResponse(options?: SanitizeErrorOptions): TAPIErrorResponse {
        // Generate an options key for cache comparison
        const optionsKey = options ? JSON.stringify(options) : '';

        // Only regenerate response if options changed or no cached response exists
        if (!this._cachedResponse || this._cachedOptions !== optionsKey) {
            this._cachedResponse = sanitizeErrorForPublic(
                this.errorDefinition,
                this.traceId,
                this.details,
                options
            );
            this._cachedOptions = optionsKey;
        }

        return this._cachedResponse;
    }

    /**
     * Logs this error
     *
     * The log level is determined by whether this is an expected error.
     * Expected errors (like validation errors) are logged at info level.
     * Unexpected errors are logged at error level.
     *
     * @param requestData - Optional request data to include in the log
     * @param options - Additional options for logging
     */
    logError(
        requestData?: { method: string; url: string },
        options: { includeChain?: boolean; includeStack?: boolean } = {}
    ) {
        const { includeChain = true, includeStack = true } = options;

        // Determine if this is an expected error based on stored definition
        const isExpectedError = this.errorDefinition.isExpected;

        const logLevel = isExpectedError ? 'info' : 'error';
        const layer = this.errorChain[0].layer;
        const contextKey = LAYER_TO_CONTEXT[layer].toLowerCase() as LogContext;

        // Create formatted chain for logging if needed
        const formattedChain = includeChain
            ? this.errorChain
                  .map(
                      (item) =>
                          `[${item.layer.toUpperCase()}] ${item.code}: ${item.error} (${item.timestamp.toISOString()})`
                  )
                  .join(' → ')
            : undefined;

        const logData = {
            error_code: this.code,
            error_message: this.message,
            status_code: this.statusCode,
            trace_id: this.traceId,
            timestamp: this.timestamp.toISOString(),
            error_chain: includeChain ? this.errorChain : undefined,
            formatted_chain: formattedChain,
            details: this.details,
            request: requestData,
            stack: includeStack ? this.stack : undefined,
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
        if (!ERROR_METRICS_BUFFER[this.code]) {
            ERROR_METRICS_BUFFER[this.code] = { count: 0, timestamps: [] };
        }

        ERROR_METRICS_BUFFER[this.code].count += 1;
        ERROR_METRICS_BUFFER[this.code].timestamps.push(new Date());
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
    // Flush any pending metrics before returning
    flushErrorMetrics();

    return Object.entries(errorMetrics).map(([code, metrics]) => ({
        code,
        count: metrics.count,
        lastOccurred: metrics.lastOccurred,
        recent: metrics.occurrences.slice(-10),
    }));
}
