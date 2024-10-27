import { InsertTransactionSchema } from '@db/schema';

export const UpdateTransactionSchema = InsertTransactionSchema.pick({
    title: true,
    type: true,
    labelId: true,
    note: true,
    description: true,
    isNew: true,
    city: true,
    counterparty: true,
    country: true
}).partial();
