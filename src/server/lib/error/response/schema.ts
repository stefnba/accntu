import { PublicErrorCodesSchema } from '@/server/lib/error/registry/schema';
import { z } from 'zod';

export const APIErrorResponseSchema = z.object({
    success: z.literal(false),
    error: z.object({
        code: PublicErrorCodesSchema,
        message: z.string(),
        details: z.record(z.unknown()).optional(),
    }),
    request_id: z.string(),
});
