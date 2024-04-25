'use server';

import { createFetch, createMutation, createQueryFetch } from '@/lib/actions';
import { db, schema as dbSchema } from '@/lib/db/client';
import { and, count, eq, sql } from 'drizzle-orm';

import {
    CreateTransactionsSchema,
    FilterOptionsSchema,
    ListTransactionSchema,
    UpdateTransactionSchema
} from './schema';
import { TTransactionListActionReturn } from './types';

export const list = createQueryFetch(
    async ({
        data: { pageSize, page, ...filters },
        user
    }): Promise<TTransactionListActionReturn> => {
        // build filter based on filter input validated by zod
        // add userId and isDeleted
        const filterClause = and(
            eq(dbSchema.transaction.userId, user.id),
            eq(dbSchema.transaction.isDeleted, false),
            ...Object.values(filters).map((f) => f)
        );

        const countTransactions = (
            await db
                .select({ count: count() })
                .from(dbSchema.transaction)
                .where(filterClause)
        )[0].count;

        const transactions = await db
            .select({
                id: dbSchema.transaction.id,
                title: dbSchema.transaction.title,
                key: dbSchema.transaction.key,
                date: dbSchema.transaction.date,
                note: dbSchema.transaction.note,
                city: dbSchema.transaction.city,
                userId: dbSchema.transaction.userId,
                createdAt: dbSchema.transaction.createdAt,
                updatedAt: dbSchema.transaction.updatedAt,
                country: dbSchema.transaction.country,
                isNew: dbSchema.transaction.isNew,
                type: dbSchema.transaction.type,
                accountAmount: dbSchema.transaction.accountAmount,
                accountCurrency: dbSchema.transaction.accountCurrency,
                spendingAmount: dbSchema.transaction.spendingAmount,
                spendingCurrency: dbSchema.transaction.spendingCurrency,
                importId: dbSchema.transaction.importId,
                // labelId: dbSchema.transaction.labelId,
                // accountId: dbSchema.transaction.accountId,
                // isDeleted: dbSchema.transaction.isDeleted,
                label: {
                    id: dbSchema.label.id,
                    name: dbSchema.label.name
                },
                account: {
                    id: dbSchema.transactionAccount.id,
                    name: dbSchema.transactionAccount.name
                }
            })
            .from(dbSchema.transaction)
            .leftJoin(
                dbSchema.label,
                eq(dbSchema.label.id, dbSchema.transaction.labelId)
            )
            .leftJoin(
                dbSchema.transactionAccount,
                eq(
                    dbSchema.transactionAccount.id,
                    dbSchema.transaction.accountId
                )
            )
            .where(filterClause);

        return {
            count: countTransactions,
            transactions: transactions
        };
    },
    ListTransactionSchema
);

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

export const listFilterOptions = createQueryFetch(
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
