import { InsertTransactionSchema } from '@db/schema';

export const UpdateTransactionSchema = InsertTransactionSchema.pick({
    title: true,
    type: true,
    labelId: true,
    note: true
}).partial();
