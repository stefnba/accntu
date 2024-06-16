import { z } from 'zod';

import { UpdateTransactionSchema } from './update-transaction';

export const UpdateTransactionsSchema = z.object({
    values: UpdateTransactionSchema,
    ids: z.array(z.string())
});
