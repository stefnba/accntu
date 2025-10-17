/**
 * Development JSON Error Exporter with Auto-Cleanup
 *
 * Exports full error details to JSON files for deep debugging in development mode.
 * Automatically manages disk space by keeping only the most recent error files.
 *
 * Features:
 * - Exports complete error object with all metadata
 * - Includes request context and error chain
 * - Auto-cleanup: keeps last 100 error files (configurable)
 * - Deletes oldest files when limit is exceeded
 * - Safe error handling - won't crash if export fails
 *
 * Configuration (environment variables):
 * - DEV_ERROR_EXPORT: Enable/disable export (default: true)
 * - DEV_ERROR_LOG_DIR: Directory for error files (default: logs/errors)
 * - DEV_ERROR_MAX_FILES: Maximum files to keep (default: 100)
 *
 * @example
 * ```typescript
 * await exportErrorToJson(error, {
 *   method: 'POST',
 *   url: '/api/users',
 *   status: 500,
 *   userId: 'user123'
 * });
 * // Creates: logs/errors/{errorId}.json
 * ```
 */

import { AppError } from '@/server/lib/error/base';
import { TErrorRequestData } from '@/server/lib/error/base/error/types';
import fs from 'node:fs';
import path from 'node:path';
import { getTimestamp } from './utils';

const DEFAULT_LOG_DIR = path.join(process.cwd(), 'logs', 'errors');
const DEFAULT_MAX_FILES = 100;

/**
 * Gets the configured log directory for error JSON files
 *
 * @returns Log directory path from env or default
 */
function getLogDir(): string {
    return process.env.DEV_ERROR_LOG_DIR || DEFAULT_LOG_DIR;
}

/**
 * Gets the configured maximum number of error files to keep
 *
 * @returns Maximum file count from env or default (100)
 */
function getMaxFiles(): number {
    const envMax = process.env.DEV_ERROR_MAX_FILES;
    return envMax ? parseInt(envMax, 10) : DEFAULT_MAX_FILES;
}

/**
 * Checks if JSON error export is enabled
 *
 * @returns true if export is enabled (default: true in dev)
 */
function isExportEnabled(): boolean {
    const envValue = process.env.DEV_ERROR_EXPORT;
    if (envValue === undefined) return true;
    return envValue === 'true' || envValue === '1';
}

/**
 * Creates the log directory if it doesn't exist
 */
function ensureLogDirectory(): void {
    const logDir = getLogDir();
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
}

/**
 * Cleans up old error JSON files to prevent disk space accumulation
 *
 * Automatically removes oldest error files when the count exceeds the configured limit.
 * Files are sorted by modification time (mtime) and oldest files are deleted first.
 *
 * This function is called after each error export to ensure automatic cleanup.
 * Errors during cleanup are logged but don't stop the main error logging process.
 *
 * @example
 * ```typescript
 * await cleanupOldErrors();
 * // If 150 error files exist and MAX_FILES=100, deletes 50 oldest files
 * ```
 */
async function cleanupOldErrors(): Promise<void> {
    const logDir = getLogDir();
    const maxFiles = getMaxFiles();

    try {
        const files = await fs.promises.readdir(logDir);

        const jsonFiles = files.filter((f) => f.endsWith('.json')).map((f) => path.join(logDir, f));

        if (jsonFiles.length <= maxFiles) {
            return;
        }

        const filesWithStats = await Promise.all(
            jsonFiles.map(async (file) => {
                const stats = await fs.promises.stat(file);
                return { file, mtime: stats.mtime.getTime() };
            })
        );

        filesWithStats.sort((a, b) => a.mtime - b.mtime);

        const filesToDelete = filesWithStats.slice(0, jsonFiles.length - maxFiles);

        await Promise.all(
            filesToDelete.map(({ file }) =>
                fs.promises.unlink(file).catch((err) => {
                    console.warn(`Failed to delete old error file ${file}:`, err);
                })
            )
        );

        if (filesToDelete.length > 0) {
            console.log(`Cleaned up ${filesToDelete.length} old error files`);
        }
    } catch (error) {
        console.warn('Failed to cleanup old error files:', error);
    }
}

/**
 * Exports an AppError to a JSON file with full details for debugging
 *
 * Creates a JSON file named {errorId}.json containing:
 * - Complete error object (from toObject())
 * - Request context (method, URL, status, userId)
 * - Error chain (if error has a cause)
 * - Export timestamp
 *
 * After exporting, automatically triggers cleanup to maintain file count limit.
 * If export is disabled via DEV_ERROR_EXPORT env variable, this function returns immediately.
 * Errors during export are caught and logged to console but don't crash the application.
 *
 * @param error - The AppError to export
 * @param requestData - Optional HTTP request context
 *
 * @example
 * ```typescript
 * await exportErrorToJson(dbError, {
 *   method: 'POST',
 *   url: '/api/users/create',
 *   status: 500,
 *   userId: 'user_abc123'
 * });
 * // Creates: logs/errors/VQlk0c85wn.json
 * // Triggers cleanup if file count > MAX_FILES
 * ```
 */
export async function exportErrorToJson(
    error: AppError,
    requestData?: TErrorRequestData
): Promise<void> {
    if (!isExportEnabled()) {
        return;
    }

    try {
        ensureLogDirectory();

        const logDir = getLogDir();
        const now = new Date();
        const timestamp = getTimestamp(now);
        const filename = `${timestamp}_${error.id}.json`;
        const filepath = path.join(logDir, filename);

        const errorData = {
            ...error.toObject(),
            request: requestData,
            chain: error.cause ? error.getChain() : undefined,
            exportedAt: now.toISOString(),
        };

        await fs.promises.writeFile(filepath, JSON.stringify(errorData, null, 2), 'utf8');

        await cleanupOldErrors();
    } catch (err) {
        console.error('Failed to export error to JSON:', err);
    }
}
