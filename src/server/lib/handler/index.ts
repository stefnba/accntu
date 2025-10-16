/**
 * Handler Utilities
 *
 * This module provides utilities for handling database operations
 * with consistent error handling and response formatting.
 */

// Re-export everything from db.ts as a namespace
import * as dbUtils from '../db/query/handler/old';
export const db = dbUtils;

// Also re-export everything directly for backward compatibility
export * from '../db/query/handler/old';
