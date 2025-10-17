/**
 * Development Console Formatter for AppError
 *
 * Provides a smart, compact, and visually appealing console output for errors in development mode.
 * Creates a boxed format with emoji indicators, error chain visualization, and key information
 * at the top for quick debugging.
 *
 * Features:
 * - Box drawing characters for visual separation
 * - Emoji icons for quick error category identification
 * - Error chain showing propagation from latest to root cause
 * - Cleaned file paths (strips webpack-internal, node_modules noise)
 * - Truncated messages for readability
 * - Link to full JSON export for deep debugging
 *
 * @example
 * ```typescript
 * const formatted = formatDevConsole(error, { method: 'GET', url: '/api/users', status: 500 });
 * console.error(formatted);
 * ```
 */

import { AppError } from '@/server/lib/error/base';
import { TErrorRequestData } from '@/server/lib/error/base/error/types';
import {
    extractLineAndColumn,
    extractLocationFromStack,
    formatDetailsRecursive,
    getErrorIcon,
    getStatusIcon,
    getTimestamp,
    truncateMessage,
} from './utils';

const BOX_TOP = '╭─';
const BOX_BOTTOM = '╰─';
const BOX_SIDE = '│';
const BOX_WIDTH = 65;

/**
 * Creates a horizontal line for the error box
 *
 * @param char - Character to repeat for the line (default: '─')
 * @returns Repeated character string for box width
 */
function createBoxLine(char: string = '─'): string {
    return char.repeat(BOX_WIDTH - 2);
}

/**
 * Creates a row within the error box
 *
 * @param content - Content to display in the row (empty for blank row)
 * @returns Formatted box row with side borders
 */
function createBoxRow(content: string = ''): string {
    if (!content) {
        return `${BOX_SIDE} `;
    }
    return `${BOX_SIDE} ${content}`;
}

/**
 * Formats an AppError into a compact, developer-friendly console output
 *
 * Creates a visually appealing boxed format with key error information:
 * - Error category and code with emoji icon
 * - Source location where error occurred
 * - Error ID for correlation with JSON export
 * - Error message (truncated if too long)
 * - Error details if present
 * - Complete error chain from latest to root cause
 * - Request context (method, URL, status, userId)
 * - Link to full JSON export
 *
 * @param error - The AppError to format
 * @param requestData - Optional HTTP request context
 * @returns Formatted string ready for console.error()
 *
 * @example
 * ```typescript
 * const formatted = formatDevConsole(dbError, {
 *   method: 'POST',
 *   url: '/api/users',
 *   status: 500,
 *   userId: 'user123'
 * });
 * console.error(formatted);
 * ```
 */
export function formatDevConsole(error: AppError, requestData?: TErrorRequestData): string {
    const lines: string[] = [];

    const icon = getErrorIcon(error);
    const errorTitle = `${error.category || 'Error'}`;

    lines.push(`${BOX_TOP} ${icon} ${errorTitle} ${createBoxLine('─')}`);
    lines.push(createBoxRow());

    lines.push(createBoxRow(`🔑 ${error.key} ${error.layer ? `[${error.layer}]` : ''}`));

    const locationLine = extractLocationFromStack(error.stack);
    const location = extractLineAndColumn(locationLine);
    if (location.file !== 'unknown') {
        const locationStr = location.functionName
            ? location.line
                ? `${location.functionName} (${location.file}:${location.line})`
                : `${location.functionName} (${location.file})`
            : location.line
              ? `${location.file}:${location.line}`
              : location.file;
        lines.push(createBoxRow(`📍 ${locationStr}`));
    }

    lines.push(createBoxRow(`🆔 ${error.id}`));
    lines.push(createBoxRow());

    const cleanMessage = error.message.split('\n')[0].trim();
    const message = truncateMessage(cleanMessage, 80);
    lines.push(createBoxRow(`💬 ${message}`));

    if (error.details && Object.keys(error.details).length > 0) {
        lines.push(createBoxRow());
        lines.push(createBoxRow(`📋 Details:`));
        for (const [key, value] of Object.entries(error.details)) {
            if (typeof value === 'object' && value !== null) {
                lines.push(createBoxRow(`   ${key}:`));
                const formatted = formatDetailsRecursive(value, 2);
                formatted.forEach((line) => lines.push(createBoxRow(line)));
            } else {
                const valueStr = String(value);
                lines.push(createBoxRow(`   ${key}: ${truncateMessage(valueStr, 50)}`));
            }
        }
    }

    if (error.cause) {
        const chain = error.getChain();
        lines.push(createBoxRow());
        lines.push(createBoxRow(`⛓️  Error Chain (depth: ${chain.depth})`));

        for (let i = 0; i < chain.chain.length; i++) {
            const item = chain.chain[i];
            const isLast = i === chain.chain.length - 1;

            const location = extractLineAndColumn(item.location);
            const locationStr = location.functionName
                ? location.line
                    ? `${location.functionName} (${location.file}:${location.line})`
                    : `${location.functionName} (${location.file})`
                : location.line
                  ? `${location.file}:${location.line}`
                  : location.file;

            const treeMarker = isLast ? '└─' : '├─';
            const continueMarker = isLast ? '  ' : '│ ';
            const label = isLast ? ' (root cause)' : '';

            const cleanMessage = item.message.split('\n')[0].trim();

            lines.push(createBoxRow(`   ${treeMarker} ${item.depth}. ${item.name}${label}`));
            if (cleanMessage) {
                lines.push(
                    createBoxRow(`   ${continueMarker}    ${truncateMessage(cleanMessage, 52)}`)
                );
            }
            lines.push(createBoxRow(`   ${continueMarker}    → ${locationStr}`));
        }
    }

    if (requestData) {
        lines.push(createBoxRow());
        const statusIcon = getStatusIcon(requestData.status);
        lines.push(
            createBoxRow(
                `🌐 Request: ${requestData.method} ${requestData.url} ${statusIcon} ${requestData.status}`
            )
        );
        if (requestData.userId) {
            lines.push(createBoxRow(`   User: ${requestData.userId}`));
        }
    }

    lines.push(createBoxRow());

    const timestamp = getTimestamp();
    lines.push(createBoxRow(`💡 Full details: logs/errors/${timestamp}_${error.id}.json`));

    lines.push(createBoxRow());
    lines.push(`${BOX_BOTTOM}${createBoxLine('─')}`);

    return '\n' + lines.join('\n') + '\n';
}
