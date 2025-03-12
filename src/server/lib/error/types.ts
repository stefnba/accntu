// src/server/error/types.ts

import { TErrorCode } from '@/server/lib/error/registry/index';
import { APIErrorResponseSchema } from '@/server/lib/error/schema';
import { InvalidJSONValue, JSONValue, SimplifyDeepArray } from 'hono/utils/types';
import { z } from 'zod';

/**
 * Application layers where errors can occur
 *
 * This helps track where in the application stack an error originated.
 */
export type ErrorLayer = 'query' | 'service' | 'route';

/**
 * Structure for an error in the error chain
 *
 * Each item in the chain represents an error as it propagates through
 * different layers of the application.
 */
export type ErrorChainItem = {
    layer: ErrorLayer;
    error: string;
    code: TErrorCode;
    timestamp: Date;
};

/**
 * Options for creating a BaseError
 *
 * These options provide additional context about the error.
 */
export type ErrorOptions = {
    cause?: Error;
    layer?: ErrorLayer;
    details?: Record<string, unknown>;
};

/**
 * Standard structure for succesful API mutation responses
 *
 * This ensures all success responses follow the same format.
 */
export type TAPIMutationResponse<T> = {
    success: true;
    data: T;
};

/**
 * Standard structure for API error responses
 *
 * This ensures all error responses follow the same format,
 * making client-side error handling more predictable.
 */
export type TAPIErrorResponse = z.infer<typeof APIErrorResponseSchema>;

/**
 * Union type for all possible API responses
 *
 * This allows for type-safe handling of both success and error responses.
 */
export type TAPIResponse<T extends JSONValue | SimplifyDeepArray<unknown> | InvalidJSONValue> =
    | TAPIMutationResponse<T>
    | TAPIErrorResponse
    | T;

export type { TErrorCode };
