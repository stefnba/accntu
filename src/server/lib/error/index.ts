/**
 * Error Handling System
 *
 * A comprehensive error handling system for the application that provides:
 *
 * - Standardized error structures with BaseError
 * - Factory methods for creating different types of errors
 * - Global error handling for Hono applications
 * - Specialized handling for validation and database errors
 * - Consistent API response formats
 * - Type-safe error handling for Hono RPC
 *
 * The system ensures consistent error handling throughout the application,
 * with detailed error tracking, logging, and standardized API responses.
 *
 * @module error
 */

// Core error components
export * from './base';
export * from './factory';
export * from './handler';
export * from './response';
export * from './types';
export * from './validation';

// Error handling utilities
export * from './db';
export * from './route';

// Note: For database and route handler utilities, prefer importing from '@/server/lib/handler'
