'use server';

import db from '@/db';
import { createMutation } from '@/lib/mutation';
import { Transaction, TransactionType } from '@prisma/client';

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
                date: new Date(date),
                spendingAmount: spending_amount,
                spendingCurrency: spending_currency,
                accountAmount: account_amount,
                accountCurrency: account_currency,
                accountId,
                importId,
                userId: user.id
            };
        });

        const newTransactions = await db.transaction.createMany({
            data: importTransactions,
            skipDuplicates: true
        });

        // update import record
        await db.import.update({
            data: {
                successAt: new Date(),
                countTransactions: newTransactions.count
            },
            where: {
                id: importId,
                userId: user.id
            }
        });

        return {
            ...newTransactions,
            success: true
        };
    },
    CreateTransactionSchema
);
