import { z } from 'zod';

export const GetTransactionByIdSchema = z.object({
    id: z.string()
});
