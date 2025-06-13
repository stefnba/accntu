// src/server/error/types.ts

import {
    TErrorCodeCategory,
    TErrorFullCode,
    TErrorShortCode,
} from '@/server/lib/error/registry/index';

import { ContentfulStatusCode } from 'hono/utils/http-status';

export type TErrorRequestData = {
    method: string;
    url: string;
    userId: string | undefined | null;
    status: ContentfulStatusCode;
};

/**
 * The type of error that occurred
 */
export type TErrorType = TErrorCodeCategory;

/**
 * Structure for an error in the error chain
 *
 * Each item in the chain represents an error as it propagates through
 * different layers of the application.
 */
export type ErrorChainItem = {
    type: TErrorType;
    message: string;
    code: TErrorShortCode;
    fullCode: TErrorFullCode;
    timestamp: Date;
    details?: Record<string, unknown>;
};

/**
 * Options for creating a BaseError
 *
 * These options provide additional context about the error.
 */
export type ErrorOptions = {
    cause?: Error;
    details?: Record<string, unknown>;
};

export type { TErrorFullCode };
