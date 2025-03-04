/**
 * Error Handling System
 *
 * A comprehensive error handling system for the application that provides:
 *
 * - Standardized error structures with BaseError
 * - Factory methods for creating different types of errors
 * - Global error handling for Hono applications
 * - Route handlers with built-in error handling
 * - Specialized handling for validation and database errors
 * - Consistent API response formats
 *
 * The system ensures consistent error handling throughout the application,
 * with detailed error tracking, logging, and standardized API responses.
 *
 * @module error
 */

export * from './base';
export * from './db';
export * from './factory';
export * from './global-handler';
export * from './response';
export * from './route-handler';
export * from './types';
export * from './validation';
