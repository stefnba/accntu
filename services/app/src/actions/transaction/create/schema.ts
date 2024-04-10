import { TransactionType } from '@prisma/client';
import { z } from 'zod';

const TransactionSchema = z.object({
    title: z.string().min(1),
    key: z.string().min(1),
    date: z.string(),
    spending_currency: z.string().length(3),
    spending_amount: z.number().nonnegative(),
    account_amount: z.number().nonnegative(),
    type: z.nativeEnum(TransactionType),
    account_currency: z.string().length(3),
    country: z.string().length(2).optional().nullable(),
    city: z.string().optional().nullable(),
    note: z.string().optional().nullable()
});

export type TTransaction = z.infer<typeof TransactionSchema>;

export const CreateTransactionSchema = z.object({
    accountId: z.string(),
    importId: z.string(),
    transactions: z.array(TransactionSchema)
});
