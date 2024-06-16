import { InsertTransactionSchema } from '@db/schema';
import { z } from 'zod';

export const UpdateTransactionsSchema = z.object({
    values: InsertTransactionSchema.pick({
        title: true,
        type: true,
        labelId: true,
        note: true
    }).partial(),
    ids: z.array(z.string())
});
