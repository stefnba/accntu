/**
 * Development-optimized error formatter
 *
 * Provides clean, concise error output in development mode while
 * maintaining the comprehensive error system for production.
 */

import { BaseError } from './base';
import { TErrorRequestData } from './types';

interface DevErrorInfo {
    operation: string;
    error: string;
    cause?: string;
    location?: string;
    userMessage?: string;
}

/**
 * Extract the root cause from PostgreSQL error
 */
function extractPostgresError(error: any): string | null {
    if (error?.cause?.detail) {
        // Extract human readable constraint violation
        const detail = error.cause.detail;
        if (detail.includes('already exists')) {
            const match = detail.match(/Key \([^)]+\)=\([^)]+\) already exists/);
            if (match) {
                return `Duplicate entry: ${match[0]}`;
            }
        }
        return detail;
    }

    if (error?.cause?.message) {
        return error.cause.message;
    }

    return null;
}

/**
 * Extract source location from stack trace
 */
function extractLocation(stack?: string): string | null {
    if (!stack) return null;

    // Look for lines containing our source code (src/)
    const lines = stack.split('\n');
    for (const line of lines) {
        if (line.includes('src/') && !line.includes('node_modules')) {
            const match = line.match(/\(([^)]+)\)/) || line.match(/at (.+)/);
            if (match) {
                const location = match[1];
                // Simplify the path
                const srcIndex = location.indexOf('src/');
                if (srcIndex !== -1) {
                    return location.substring(srcIndex);
                }
                return location;
            }
        }
    }
    return null;
}

/**
 * Generate user-friendly error message from error code
 */
function generateUserMessage(error: BaseError): string | undefined {
    const code = error.errorDefinition.code;

    switch (code) {
        case 'OPERATION_FAILED':
            if (error.originalError) {
                const pgError = extractPostgresError(error.originalError);
                if (pgError?.includes('already exists')) {
                    return 'Item already exists';
                }
                if (pgError?.includes('violates foreign key')) {
                    return 'Referenced item not found';
                }
                if (pgError?.includes('violates not-null')) {
                    return 'Required field missing';
                }
            }
            return 'Database operation failed';
        case 'VALIDATION_ERROR':
            return 'Input validation failed';
        case 'NOT_FOUND':
            return 'Item not found';
        case 'ACCESS_DENIED':
            return 'Access denied';
        default:
            return undefined;
    }
}

/**
 * Format error for development console output
 */
export function formatDevError(error: BaseError, requestData?: TErrorRequestData): DevErrorInfo {
    const operation = error.message || 'Unknown operation';
    const cause = error.originalError ? extractPostgresError(error.originalError) : null;
    const location = extractLocation(error.originalError?.stack || error.stack);
    const userMessage = generateUserMessage(error);

    let errorText = error.errorDefinition.code;
    if (cause) {
        // todo: fix this
        errorText = cause;
    } else if (error.originalError?.message) {
        // todo: fix this
        errorText = error.originalError.message;
    }

    return {
        operation,
        error: errorText,
        cause: cause || undefined,
        location: location || undefined,
        userMessage,
    };
}

/**
 * Log error in development mode with clean output
 */
export function logDevError(error: BaseError, requestData?: TErrorRequestData): void {
    const info = formatDevError(error, requestData);

    // Build clean console output
    const parts: string[] = [];

    // Request info
    if (requestData) {
        parts.push(
            `${requestData.method} ${new URL(requestData.url).pathname} ${requestData.status}`
        );
    }

    // Main error
    parts.push(`❌ ${info.operation}: ${info.error}`);

    // Location
    if (info.location) {
        parts.push(`📍 ${info.location}`);
    }

    // User message
    if (info.userMessage) {
        parts.push(`💡 ${info.userMessage}`);
    }

    // Output as single console.error for better grouping
    console.error('\n' + parts.join('\n') + '\n');
}

/**
 * Check if we should use development formatting
 */
export function shouldUseDevFormatting(): boolean {
    return process.env.NODE_ENV === 'development';
}
