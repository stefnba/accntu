import { AppError } from '@/server/lib/error/base';
import { TErrorChainItem } from '@/server/lib/error/base/error/types';

/**
 * Cleans and simplifies file paths for better readability in error logs
 *
 * Removes webpack-internal prefixes, extracts src/ paths, and simplifies node_modules references.
 *
 * @param path - The file path to clean
 * @returns Simplified file path or undefined if path is not provided
 *
 * @example
 * ```typescript
 * cleanFilePath('webpack-internal:///(rsc)/./src/server/db/queries.ts:42:12')
 * // Returns: 'src/server/db/queries.ts:42:12'
 *
 * cleanFilePath('/full/path/to/project/src/features/user/api.ts')
 * // Returns: 'src/features/user/api.ts'
 * ```
 */
export function cleanFilePath(path?: string): string | undefined {
    if (!path) return undefined;

    if (path.includes('webpack-internal:///')) {
        const match = path.match(/webpack-internal:\/\/\/\((?:rsc|instrument)\)\/\.\/(.+)/);
        if (match) {
            return match[1];
        }
        return undefined;
    }

    const srcIndex = path.indexOf('src/');
    if (srcIndex !== -1) {
        return path.substring(srcIndex);
    }

    if (path.includes('node_modules')) {
        const match = path.match(/node_modules\/([^/]+(?:\/[^/]+)?)/);
        if (match) {
            return match[1];
        }
    }

    return path;
}

/**
 * Extracts the most relevant source location line from an error stack trace
 *
 * Finds the first line in the stack trace that references application code (src/)
 * and returns the complete stack line including function name and file location.
 * Skips node_modules and internal code.
 *
 * @param stack - The error stack trace string
 * @returns Full stack trace line for parsing (includes function name and location)
 *
 * @example
 * ```typescript
 * const location = extractLocationFromStack(error.stack);
 * // Returns: "at createFromRegistry (src/server/lib/error/base/factory/error-factory.ts:80:16)"
 * ```
 */
export function extractLocationFromStack(stack?: string): string | undefined {
    if (!stack) return undefined;

    const rootDirectory = 'src/';
    const skipPatterns = [
        '/error/base/factory/',
        '/error/factories',
        'AppErrors.raise',
        'BaseErrorFactory',
    ];

    const lines = stack.split('\n');
    for (const line of lines) {
        if (line.includes(rootDirectory) && !line.includes('node_modules')) {
            const shouldSkip = skipPatterns.some((pattern) => line.includes(pattern));
            if (!shouldSkip) {
                return line.trim();
            }
        }
    }

    return undefined;
}

/**
 * Extracts function name from a stack trace line
 *
 * Parses various stack trace formats to extract the function name.
 *
 * @param stackLine - A single line from a stack trace
 * @returns Function name or undefined if not found
 *
 * @example
 * ```typescript
 * extractFunctionName('    at createFromRegistry (webpack-internal:///(instrument)/./src/file.ts:80:16)')
 * // Returns: 'createFromRegistry'
 *
 * extractFunctionName('    at Object.<anonymous> (/path/to/file.ts:10:5)')
 * // Returns: 'Object.<anonymous>'
 * ```
 */
export function extractFunctionName(stackLine?: string): string | undefined {
    if (!stackLine) return undefined;

    const atMatch = stackLine.match(/at\s+(?:async\s+)?([^\s(]+)/);
    if (atMatch && atMatch[1] !== '<anonymous>') {
        return atMatch[1];
    }

    return undefined;
}

/**
 * Extracts file path, line number, column, and function name from a stack trace location string
 *
 * Parses location strings from stack traces into structured components.
 *
 * @param location - Stack trace location string (e.g., "src/file.ts:42:12")
 * @returns Object with file path, line number, column number, and function name
 *
 * @example
 * ```typescript
 * extractLineAndColumn('src/server/db/queries.ts:42:12')
 * // Returns: { file: 'src/server/db/queries.ts', line: 42, column: 12 }
 *
 * extractLineAndColumn('    at createFromRegistry (src/file.ts:80:16)')
 * // Returns: { file: 'src/file.ts', line: 80, column: 16, functionName: 'createFromRegistry' }
 * ```
 */
export function extractLineAndColumn(location?: string): {
    file: string;
    line?: number;
    column?: number;
    functionName?: string;
} {
    if (!location) return { file: 'unknown' };

    const functionName = extractFunctionName(location);

    const pathMatch = location.match(/at\s+(?:async\s+)?[^\s(]+\s+\((.+)\)$/) || location.match(/\((.+)\)$/);
    const pathStr = pathMatch ? pathMatch[1] : location;

    const match = pathStr.match(/^(.+?):(\d+):(\d+)$/);
    if (match) {
        return {
            file: cleanFilePath(match[1]) || match[1],
            line: parseInt(match[2], 10),
            column: parseInt(match[3], 10),
            functionName,
        };
    }

    return { file: cleanFilePath(pathStr) || pathStr, functionName };
}

/**
 * Formats an error chain item for display in error logs
 *
 * Creates a formatted string representation of an error in the error chain,
 * with visual indicators for hierarchy and root cause.
 *
 * @param item - The error chain item to format
 * @param isRootCause - Whether this is the root cause error
 * @returns Formatted string with error details and location
 *
 * @example
 * ```typescript
 * formatErrorChainItem({ depth: 0, name: 'DbError', message: 'Query failed', location: 'src/db.ts:10' })
 * // Returns:
 * //    ├─ 0. DbError: Query failed
 * //       → src/db.ts:10
 * ```
 */
export function formatErrorChainItem(item: TErrorChainItem, isRootCause: boolean = false): string {
    const location = extractLineAndColumn(item.location);
    const locationStr = location.line ? `${location.file}:${location.line}` : location.file;

    const prefix = isRootCause ? '   └─' : '   ├─';
    const marker = isRootCause ? ' (root cause)' : '';

    const cleanMessage = item.message.split('\n')[0].trim();

    return `${prefix} ${item.depth}. ${item.name}${marker}\n      ${cleanMessage}\n      → ${locationStr}`;
}

/**
 * Truncates a message to a maximum length with ellipsis
 *
 * @param message - The message to truncate
 * @param maxLength - Maximum length before truncation (default: 100)
 * @returns Truncated message with '...' if it exceeds maxLength
 *
 * @example
 * ```typescript
 * truncateMessage('This is a very long error message that needs truncation', 20)
 * // Returns: 'This is a very lo...'
 * ```
 */
export function truncateMessage(message: string, maxLength: number = 100): string {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength - 3) + '...';
}

/**
 * Returns an appropriate emoji icon for an error based on its category
 *
 * @param error - The AppError to get an icon for
 * @returns Emoji icon representing the error category
 *
 * @example
 * ```typescript
 * getErrorIcon(validationError) // Returns: '⚠️'
 * getErrorIcon(dbError) // Returns: '🗄️'
 * ```
 */
export function getErrorIcon(error: AppError): string {
    const category = error.category?.toUpperCase();

    switch (category) {
        case 'VALIDATION':
            return '⚠️';
        case 'AUTH':
        case 'PERMISSION':
            return '🔒';
        case 'DB':
        case 'DATABASE':
            return '🗄️';
        case 'RESOURCE':
            return '📦';
        case 'OPERATION':
            return '⚙️';
        case 'SERVER':
            return '🖥️';
        default:
            return '❌';
    }
}

/**
 * Returns an appropriate emoji icon for an HTTP status code
 *
 * @param status - The HTTP status code
 * @returns Emoji icon representing the status code range
 *
 * @example
 * ```typescript
 * getStatusIcon(200) // Returns: '🟢'
 * getStatusIcon(404) // Returns: '🟡'
 * getStatusIcon(500) // Returns: '🔴'
 * ```
 */
export function getStatusIcon(status: number): string {
    if (status >= 500) return '🔴';
    if (status >= 400) return '🟡';
    if (status >= 300) return '🔵';
    return '🟢';
}

/**
 * Generates a timestamp string in the format YYYYMMDD_HHMMSS
 *
 * Creates a compact timestamp suitable for filenames, sorting chronologically.
 *
 * @param date - Date object to format (default: current time)
 * @returns Formatted timestamp string (e.g., "20251017_142530")
 *
 * @example
 * ```typescript
 * getTimestamp()
 * // Returns: "20251017_142530"
 *
 * getTimestamp(new Date('2025-01-15T09:30:45'))
 * // Returns: "20250115_093045"
 * ```
 */
export function getTimestamp(date: Date = new Date()): string {
    return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}`;
}

/**
 * Formats object details recursively with proper indentation
 *
 * Creates readable multi-line representations of objects with proper indentation
 * for nested structures. Handles primitives, arrays, and nested objects intelligently.
 *
 * @param value - The value to format (any type)
 * @param indent - Current indentation level (default: 0)
 * @param maxDepth - Maximum recursion depth to prevent infinite loops (default: 5)
 * @returns Array of formatted lines
 *
 * @example
 * ```typescript
 * formatDetailsRecursive({ query: 'SELECT 1', params: [], cause: { code: 'ERR' } })
 * // Returns:
 * // [
 * //   'query: SELECT 1',
 * //   'params: []',
 * //   'cause:',
 * //   '   code: ERR'
 * // ]
 * ```
 */
export function formatDetailsRecursive(
    value: unknown,
    indent: number = 0,
    maxDepth: number = 5
): string[] {
    const indentStr = '   '.repeat(indent);
    const lines: string[] = [];

    if (value === null || value === undefined) {
        return [`${indentStr}${String(value)}`];
    }

    if (typeof value === 'string') {
        if (value.length > 80) {
            return [`${indentStr}${truncateMessage(value, 80)}`];
        }
        return [`${indentStr}${value}`];
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return [`${indentStr}${String(value)}`];
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return [`${indentStr}[]`];
        }

        if (value.every((item) => typeof item !== 'object' || item === null)) {
            const compact = JSON.stringify(value);
            if (compact.length <= 60) {
                return [`${indentStr}${compact}`];
            }
        }

        if (indent >= maxDepth) {
            return [`${indentStr}[... ${value.length} items]`];
        }

        value.forEach((item, index) => {
            lines.push(`${indentStr}[${index}]:`);
            lines.push(...formatDetailsRecursive(item, indent + 1, maxDepth));
        });
        return lines;
    }

    if (typeof value === 'object') {
        if (indent >= maxDepth) {
            return [`${indentStr}{...}`];
        }

        const entries = Object.entries(value);
        if (entries.length === 0) {
            return [`${indentStr}{}`];
        }

        entries.forEach(([key, val]) => {
            if (val === null || val === undefined) {
                lines.push(`${indentStr}${key}: ${String(val)}`);
            } else if (typeof val === 'object' && !Array.isArray(val)) {
                lines.push(`${indentStr}${key}:`);
                lines.push(...formatDetailsRecursive(val, indent + 1, maxDepth));
            } else if (Array.isArray(val)) {
                if (val.length === 0) {
                    lines.push(`${indentStr}${key}: []`);
                } else {
                    lines.push(`${indentStr}${key}:`);
                    lines.push(...formatDetailsRecursive(val, indent + 1, maxDepth));
                }
            } else {
                const formatted = formatDetailsRecursive(val, 0, maxDepth)[0].trim();
                lines.push(`${indentStr}${key}: ${formatted}`);
            }
        });
        return lines;
    }

    return [`${indentStr}${String(value)}`];
}
