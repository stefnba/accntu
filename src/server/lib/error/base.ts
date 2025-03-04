import { ContentfulStatusCode } from 'hono/utils/http-status';
import { APIErrorResponse, ErrorChainItem, ErrorCode, ErrorLayer, ErrorOptions } from './types';

// Simple in-memory error tracking
const errorMetrics: Record<string, { count: number; lastOccurred: Date; occurrences: Date[] }> = {};

/**
 * BaseError class for standardized error handling
 *
 * This class extends the native Error class to provide a structured approach to error handling
 * with additional metadata like error codes, status codes, and error chains. It includes
 * functionality for:
 *
 * - Tracking error occurrences for monitoring
 * - Generating consistent API error responses
 * - Logging errors with detailed information
 * - Building error chains to trace error propagation
 *
 * All application errors should extend from or be created using this class to ensure
 * consistent error handling throughout the application.
 */
export class BaseError extends Error {
    public readonly traceId: string;
    public readonly timestamp: Date;
    public readonly originalError?: Error;
    public readonly errorChain: ErrorChainItem[];

    /**
     * Creates a new BaseError instance
     *
     * @param message - Human-readable error message
     * @param code - Error code for categorizing errors
     * @param statusCode - HTTP status code to return to clients
     * @param options - Additional error options like cause and layer
     */
    constructor(
        message: string,
        public readonly code: ErrorCode,
        public readonly statusCode: ContentfulStatusCode,
        options?: ErrorOptions
    ) {
        super(message);
        this.name = this.constructor.name;
        this.traceId = crypto.randomUUID();
        this.timestamp = new Date();
        this.originalError = options?.cause;
        this.errorChain = [
            {
                layer: options?.layer || 'query',
                error: message,
                code: this.code,
                timestamp: this.timestamp,
            },
        ];

        if (options?.cause instanceof BaseError) {
            this.errorChain.push(...options.cause.errorChain);
        }

        // Track error for metrics
        this.trackError();
    }

    /**
     * Adds a new error to the error chain
     *
     * This allows tracking the propagation of errors through different layers
     * of the application (e.g., from query to service to route).
     *
     * @param layer - The application layer where the error occurred
     * @param error - The error message
     * @param code - The error code
     * @returns This error instance for chaining
     */
    addToChain(layer: ErrorLayer, error: string, code: ErrorCode) {
        this.errorChain.push({
            layer,
            error,
            code,
            timestamp: new Date(),
        });
        return this;
    }

    /**
     * Converts the error to a standardized API response
     *
     * This ensures all errors returned to clients follow the same structure,
     * making error handling on the client side more predictable.
     *
     * @returns A structured API error response
     */
    toResponse(): APIErrorResponse {
        return {
            success: false,
            error: {
                code: this.code,
                message: this.message,
                details:
                    this.errorChain[0].layer === 'route'
                        ? undefined
                        : {
                              trace_id: this.traceId,
                          },
            },
            trace_id: this.traceId,
        };
    }

    /**
     * Logs the error to the console with detailed information
     *
     * This provides comprehensive error information for debugging,
     * including the error chain, original error, and stack trace.
     */
    logError() {
        console.error('Error:', {
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            traceId: this.traceId,
            timestamp: this.timestamp,
            chain: this.errorChain,
            originalError: this.originalError,
            stack: this.stack,
        });
    }

    /**
     * Tracks error occurrences for monitoring
     *
     * This maintains an in-memory record of error frequencies and timestamps,
     * which can be used for monitoring error patterns and rates.
     *
     * @private
     */
    private trackError() {
        const key = `${this.code}:${this.statusCode}`;
        if (!errorMetrics[key]) {
            errorMetrics[key] = {
                count: 0,
                lastOccurred: new Date(),
                occurrences: [],
            };
        }

        errorMetrics[key].count += 1;
        errorMetrics[key].lastOccurred = new Date();
        errorMetrics[key].occurrences.push(new Date());

        // Keep only the last 100 occurrences to prevent memory leaks
        if (errorMetrics[key].occurrences.length > 100) {
            errorMetrics[key].occurrences = errorMetrics[key].occurrences.slice(-100);
        }
    }
}

/**
 * Retrieves the current error metrics
 *
 * This provides access to the in-memory error tracking data for monitoring
 * and analysis purposes.
 *
 * @returns A record of error metrics by error code and status
 */
export function getErrorMetrics() {
    return errorMetrics;
}
