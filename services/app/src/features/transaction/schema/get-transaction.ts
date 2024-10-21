import { z } from 'zod';

export const GetTransactionByIdSchema = z.object({
    transactionId: z.string()
});
