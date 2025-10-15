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
 * - Error sanitization for public consumption
 * - Centralized error registry for consistent error definitions
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

// Import and re-export registry items explicitly to avoid naming conflicts

export * from './registry';

export * from './types';
