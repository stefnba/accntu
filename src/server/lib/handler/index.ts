/**
 * Handler Utilities
 *
 * This module provides utilities for handling database operations and route handling
 * with consistent error handling and response formatting.
 */

// Re-export everything from db.ts as a namespace
import * as dbUtils from './db';
export const db = dbUtils;

// Re-export everything from route.ts as a namespace
import * as routeUtils from './route';
export const route = routeUtils;

// Also re-export everything directly for backward compatibility
export * from './db';
export * from './route';
