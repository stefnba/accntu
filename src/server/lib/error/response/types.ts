import { APIErrorResponseSchema } from '@/server/lib/error/response/schema';
import { InvalidJSONValue, JSONValue, SimplifyDeepArray } from 'hono/utils/types';
import { z } from 'zod';
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
