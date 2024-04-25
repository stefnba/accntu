'use server';

import { createFetch, createMutation } from '@/lib/actions';
import { db, schema as dbSchema } from '@/lib/db/client';
import { and, eq, sql } from 'drizzle-orm';

import {
    CreateTransactionsSchema,
    FilterOptionsSchema,
    UpdateTransactionSchema
} from './schema';

/**
 * Update transaction record.
 */
export const update = createMutation(async ({ user, data: { data, id } }) => {
    const updated = await db
        .update(dbSchema.transaction)
        .set(data)
        .where(
            and(
                eq(dbSchema.transaction.userId, user.id),
                eq(dbSchema.transaction.id, id)
            )
        )
        .returning();

    return updated[0];
}, UpdateTransactionSchema);

/**
 * Create import records.
 */
export const create = createMutation(
    async ({ data: { transactions, accountId, importId }, user }) => {
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
    CreateTransactionsSchema
);

export const listFilterOptions = createFetch(
    async ({ user, data: { filterKey } }) => {
        const filterKeys = {
            label: dbSchema.transaction.labelId,
            account: dbSchema.transaction.accountId,
            title: dbSchema.transaction.title
        };

        const a = filterKeys[filterKey];

        const test = await db
            .select({
                value: dbSchema.transaction.labelId,
                label: sql<string>`COALESCE(${dbSchema.label.name}, 'None')`,
                count: sql<number>`cast(count(*) as int)`
            })
            .from(dbSchema.transaction)
            .where(
                and(
                    eq(dbSchema.transaction.userId, user.id),
                    eq(dbSchema.transaction.isDeleted, false)
                )
            )
            .leftJoin(
                dbSchema.label,
                eq(dbSchema.transaction.labelId, dbSchema.label.id)
            )
            .groupBy(dbSchema.transaction.labelId, dbSchema.label.name);

        console.log('test', test);

        return test;
    },
    FilterOptionsSchema
);
