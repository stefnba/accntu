import { z } from 'zod';

export const UpdateUserSchema = z.object({
    firstName: z
        .string()
        .min(3, {
            message: 'Your name must be at least 3 characters.'
        })
        .optional(),
    lastName: z.string().optional(),
    theme: z.enum(['LIGHT', 'DARK']).optional()
});
