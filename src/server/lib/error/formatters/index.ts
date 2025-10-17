/**
 * Error Formatters for Development Mode
 *
 * Provides smart, developer-friendly error logging in development:
 * - formatDevConsole: Compact, boxed console output with emoji indicators
 * - exportErrorToJson: Full error details exported to JSON files with auto-cleanup
 * - utils: Helper functions for path cleaning, formatting, and icon selection
 *
 * These formatters replace the overwhelming JSON dumps with readable, actionable error information.
 */

export { formatDevConsole } from './dev-console';
export { exportErrorToJson } from './dev-json';
export * from './utils';
