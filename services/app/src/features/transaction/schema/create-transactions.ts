import { InsertTransactionSchema } from '@db/schema';
import { z } from 'zod';

export const CreateTransactionsSchema = z.object({
    values: z.array(InsertTransactionSchema).min(1),
    accountId: z.string(),
    importFileId: z.string()
});

export type TCreateTransactions = z.input<typeof CreateTransactionsSchema>;
