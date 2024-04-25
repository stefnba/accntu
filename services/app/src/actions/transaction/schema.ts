import { z } from 'zod';

export const UpdateTransactionSchema = z.object({
    id: z.string(),
    data: z.object({
        labelId: z.string().optional(),
        title: z.string().optional()
    })
});

const TransactionSchema = z.object({
    title: z.string().min(1),
    key: z.string().min(1),
    date: z.string(),
    spending_currency: z.string().length(3),
    spending_amount: z.number().nonnegative(),
    account_amount: z.number().nonnegative(),
    type: z.enum(['TRANSFER', 'CREDIT', 'DEBIT']),
    account_currency: z.string().length(3),
    country: z.string().length(2).optional().nullable(),
    city: z.string().optional().nullable(),
    note: z.string().optional().nullable()
});

// export type TTransaction = z.infer<typeof TransactionSchema>;

export const CreateTransactionsSchema = z.object({
    accountId: z.string(),
    importId: z.string(),
    transactions: z.array(TransactionSchema)
});

export const FilterOptionsSchema = z.object({
    filterKey: z.union([
        z.literal('label'),
        z.literal('account'),
        z.literal('title')
    ])
});
