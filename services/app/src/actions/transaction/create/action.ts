'use server';

import { db, schema as dbSchema } from '@/db';
import { createMutation } from '@/lib/mutation';
import { and, eq } from 'drizzle-orm';

import { CreateTransactionSchema } from './schema';

/**
 * Create import record.
 */
export const createTransaction = createMutation(
    async ({ transactions, accountId, importId }, user) => {
        const importTransactions = transactions.map((transaction) => {
            const {
                spending_amount,
                spending_currency,
                account_amount,
                account_currency,
                date,
                ...rest
            } = transaction;

            return {
                ...rest,
                date,
                spendingAmount: spending_amount,
                spendingCurrency: spending_currency,
                accountAmount: account_amount,
                accountCurrency: account_currency,
                accountId,
                importId,
                userId: user.id
            };
        });

        const newTransactions = await db
            .insert(dbSchema.transaction)
            .values(importTransactions)
            .returning()
            .onConflictDoNothing();

        // update import record
        await db
            .update(dbSchema.transactionImport)
            .set({
                successAt: new Date(),
                countTransactions: newTransactions.length
            })
            .where(
                and(
                    eq(dbSchema.transactionImport.id, importId),
                    eq(dbSchema.transactionImport.userId, user.id)
                )
            );

        return {
            ...newTransactions,
            success: true
        };
    },
    CreateTransactionSchema
);
