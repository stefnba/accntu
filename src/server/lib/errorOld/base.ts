import { TErrorFullCode } from '@/server/lib/error/registry/index';
import { TErrorDefinition } from '@/server/lib/error/registry/types';
import { getCachedErrorDefinition } from '@/server/lib/error/registry/utils';
import { sanitizeErrorForPublic, SanitizeErrorOptions } from '@/server/lib/error/response/sanitize';
import { TAPIErrorResponse } from '@/server/lib/error/response/types';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { logger } from '../logger';
import { ErrorChainItem, ErrorOptions, TErrorRequestData, TErrorType } from './types';
import { convertToAppError, generateErrorId } from './utils';

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
const METRICS_BUFFER_THRESHOLD = 50; // Flush when any error type hits this count
let metricsFlushIntervalId: NodeJS.Timeout | null = null;
let lastFlushTime = Date.now();

/**
 * Flushes buffered error metrics to the main metrics store
 * Called periodically by the flush interval or when buffer threshold is reached
 */
function flushErrorMetrics() {
    // Skip if buffer is empty
    if (Object.keys(ERROR_METRICS_BUFFER).length === 0) {
        return;
    }

    // Update last flush time
    lastFlushTime = Date.now();

    try {
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
    } catch (e) {
        console.error('Error during metrics flush:', e);
        // Still clear buffer to avoid memory leaks even if processing failed
        Object.keys(ERROR_METRICS_BUFFER).forEach((key) => delete ERROR_METRICS_BUFFER[key]);
    }
}

// Check if buffer should be flushed based on size or time
function shouldFlushBuffer(): boolean {
    // Check if any error type has reached the threshold
    const bufferExceeded = Object.values(ERROR_METRICS_BUFFER).some(
        ({ count }) => count >= METRICS_BUFFER_THRESHOLD
    );

    // Check if enough time has passed since last flush
    const timeSinceLastFlush = Date.now() - lastFlushTime;
    const timeThresholdMet = timeSinceLastFlush >= METRICS_FLUSH_INTERVAL;

    return bufferExceeded || timeThresholdMet;
}

// Start the flush interval when this module is loaded
if (typeof window === 'undefined' && !metricsFlushIntervalId) {
    // Server-side only
    metricsFlushIntervalId = setInterval(
        () => {
            if (shouldFlushBuffer()) {
                flushErrorMetrics();
            }
        },
        Math.min(METRICS_FLUSH_INTERVAL, 1000)
    ); // Check at least every second
}

/**
 * Parameters for creating a BaseError
 */
export interface BaseErrorParams {
    /** Error definition from registry */
    errorCode: TErrorFullCode;
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
            // Start with current error
            this._errorChain = [
                {
                    type: this.originalType,
                    message: this.message,
                    code: this.errorDefinition.code,
                    fullCode: this.errorDefinition.fullCode,
                    timestamp: this.timestamp,
                    details: this.details,
                },
            ];

            // Add cause to chain   if it exists - using getErrorData for consistent extraction
            if (this.originalError) {
                const { error } = convertToAppError(this.originalError);
                this._errorChain.push({
                    type: error.errorDefinition.category,
                    message: error.message,
                    code: error.errorDefinition.code,
                    fullCode: error.errorDefinition.fullCode,
                    timestamp: this.timestamp,
                    details: error.details,
                });
            }
        }
        return this._errorChain;
    }

    /**
     * The original layer where the error occurred
     */
    private readonly originalType: TErrorType;

    /**
     * Error definition from registry
     */
    public readonly errorDefinition: TErrorDefinition<TErrorFullCode>;

    /**
     * Cached public response - cleared when options change
     */
    private _cachedResponse?: TAPIErrorResponse;

    /**
     * Cached response options to detect changes
     */
    private _cachedOptions?: string;

    /**
     * The error code
     */
    public readonly code: TErrorFullCode;

    /**
     * The status code
     */
    public readonly statusCode: ContentfulStatusCode;

    /**
     * Creates a new BaseError
     *
     * @param params - Parameters for creating the error
     */
    constructor(params: BaseErrorParams) {
        const { errorCode, message, statusCode, details = {}, options = {} } = params;

        // Get the error definition
        const errorDefinition = getCachedErrorDefinition(errorCode);
        // Use provided message or default from error definition
        const errorMessage = message || errorDefinition.message;

        // Initialize the error
        super(errorMessage);

        // Store error definition
        this.errorDefinition = {
            ...errorDefinition,
            message: errorMessage,
            statusCode: statusCode || errorDefinition.statusCode,
        };

        // Store the error code and status code directly on the instance for easier access
        this.code = errorDefinition.fullCode;
        this.statusCode = this.errorDefinition.statusCode;

        this.name = 'AppError';
        this.traceId = generateErrorId();
        this.timestamp = new Date();
        this.details = details;
        this.originalError = options.cause;

        // Store the original layer
        this.originalType = errorDefinition.category || 'SERVICE';

        // Track this error occurrence
        this.trackError();
    }

    /**
     * Adds a new error to the error chain
     *
     * This is used when an error is caught and re-thrown with additional context.
     *
     * @param layer - The layer where the error was caught
     * @param message - Human-readable error message
     * @param code - Error code for this layer
     * @returns this (for method chaining)
     */
    addToChain(error: unknown) {
        // Ensure the chain is initialized by accessing the getter
        const {
            error: { errorDefinition },
        } = convertToAppError(error);

        this.errorChain.push({
            type: errorDefinition.category,
            message: errorDefinition.message,
            code: errorDefinition.code,
            fullCode: errorDefinition.fullCode,
            timestamp: this.timestamp,
            details: errorDefinition.details,
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
        requestData?: TErrorRequestData,
        options: { includeChain?: boolean; includeStack?: boolean } = {}
    ) {
        const { includeChain = true, includeStack = true } = options;

        // Determine if this is an expected error based on stored definition
        const isExpectedError = this.errorDefinition.isExpected;

        // Auth errors are always logged as errors even if they're expected
        const logLevel = !isExpectedError ? 'error' : 'info';

        // Create formatted chain for logging if needed

        const formattedChain = includeChain
            ? this.errorChain
                  .map(
                      (item) =>
                          `[${item.type.toUpperCase()}] ${item.code}: ${item.message} (${item.timestamp.toISOString()})`
                  )
                  .join(' → ')
            : undefined;

        const logData = {
            error_code: this.errorDefinition.fullCode,
            status_code: this.errorDefinition.statusCode,
            error_message: this.errorDefinition.message,
            trace_id: this.traceId,
            timestamp: this.timestamp.toISOString(),
            error_chain: includeChain ? this.errorChain : undefined,
            formatted_chain: formattedChain,
            details: this.details,
            request: requestData,
            stack: includeStack ? this.stack : undefined,
        };

        if (logLevel === 'info') {
            logger.info(this.message, { data: logData });
        } else {
            logger.error(this.message, { data: logData });
        }
    }

    /**
     * Tracks error occurrence for monitoring
     *
     * This maintains in-memory metrics about error occurrences that can
     * be exposed for monitoring and alerting. If buffer threshold is reached,
     * metrics are flushed immediately.
     *
     * @private
     */
    private trackError() {
        if (!ERROR_METRICS_BUFFER[this.errorDefinition.fullCode]) {
            ERROR_METRICS_BUFFER[this.errorDefinition.fullCode] = { count: 0, timestamps: [] };
        }

        ERROR_METRICS_BUFFER[this.errorDefinition.fullCode].count += 1;
        ERROR_METRICS_BUFFER[this.errorDefinition.fullCode].timestamps.push(new Date());

        // Flush immediately if threshold is exceeded
        if (ERROR_METRICS_BUFFER[this.errorDefinition.fullCode].count >= METRICS_BUFFER_THRESHOLD) {
            flushErrorMetrics();
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
    // Flush any pending metrics before returning
    flushErrorMetrics();

    return Object.entries(errorMetrics).map(([code, metrics]) => ({
        code,
        count: metrics.count,
        lastOccurred: metrics.lastOccurred,
        recent: metrics.occurrences.slice(-10),
    }));
}
