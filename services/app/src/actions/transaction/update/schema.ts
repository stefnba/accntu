import { z } from 'zod';

export const UpdateTransactionSchema = z.object({
    id: z.string(),
    labelId: z.string().optional(),
    title: z.string().optional()
});
