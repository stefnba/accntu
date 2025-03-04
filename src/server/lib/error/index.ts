/**
 * Error Handling System
 *
 * This module provides a comprehensive error handling system for the application.
 * It includes:
 *
 * 1. BaseError - A standardized error class that extends the native Error
 * 2. ErrorFactory - A factory for creating different types of errors
 * 3. Middleware - Error handling middleware for Hono applications
 * 4. Validation - Utilities for handling validation errors
 * 5. Client-side utilities - Functions for handling errors on the client
 *
 * The error handling system is designed to:
 * - Provide consistent error structures throughout the application
 * - Enable detailed error tracking and logging
 * - Support error propagation across application layers
 * - Transform errors into standardized API responses
 * - Facilitate client-side error handling
 *
 * @module error
 */

export * from './base';
export * from './client';
export * from './db';
export * from './factory';
export * from './middleware';
export * from './response';
export * from './types';
export * from './validation';
