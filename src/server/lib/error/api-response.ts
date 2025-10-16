import { typedKeys } from '@/lib/utils';
import { PUBLIC_ERROR_REGISTRY, TPublicErrorCode } from '@/server/lib/error/registry';
import { z } from 'zod';

/**
 * Zod schema for the public error codes
 */
export const PublicErrorCodesSchema = z.enum(
    typedKeys(PUBLIC_ERROR_REGISTRY).map((category) => category) as [
        TPublicErrorCode,
        ...TPublicErrorCode[],
    ]
);

/**
 * Zod schema for the API error response
 */
export const APIErrorResponseSchema = z.object({
    success: z.literal(false),
    error: z.object({
        code: PublicErrorCodesSchema,
        message: z.string(),
        details: z.record(z.string(), z.unknown()).optional(),
    }),
    request_id: z.string(),
});

/**
 * Type for the API error response
 */
export type TAPIErrorResponse = z.infer<typeof APIErrorResponseSchema>;
