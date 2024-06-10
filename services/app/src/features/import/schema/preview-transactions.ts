import { TransactionTypeSchema } from '@db/schema';
import { z } from 'zod';

export const ParsedTransactionSchema = z
    .object({
        date: z.coerce.date(),
        country: z.string().nullable(),
        account_amount: z.number(),
        user_amount: z.number(),
        account_currency: z.string().length(3),
        spending_amount: z.number(),
        spending_currency: z.string().length(3),
        user_currency: z.string().length(3),
        spending_account_rate: z.number(),
        type: TransactionTypeSchema,
        title: z.string(),
        key: z.string(),
        is_duplicate: z.boolean()
    })
    .transform((v) => {
        const {
            account_amount,
            is_duplicate,
            spending_account_rate,
            spending_amount,
            spending_currency,
            account_currency,
            user_amount,
            user_currency,
            ...rest
        } = v;

        return {
            ...rest,
            isDuplicate: is_duplicate,
            accountAmount: account_amount,
            accountCurrency: account_currency,
            spendingAccountRate: spending_account_rate,
            spendingAmount: spending_amount,
            spendingCurrency: spending_currency,
            userAmount: user_amount,
            userCurrency: user_currency
        };
    });

export type TParsedTransaction = z.output<typeof ParsedTransactionSchema>;
