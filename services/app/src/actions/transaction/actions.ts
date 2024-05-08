'use server';

import { getFilterOptions } from '@/components/data-table/filters/select/db-utils';
import { createFetch, createMutation, createQueryFetch } from '@/lib/actions';
import { db, schema as dbSchema } from '@/lib/db/client';
import { inArrayFilter, queryBuilder } from '@/lib/db/utils';
import { and, count, desc, eq, sql } from 'drizzle-orm';

import {
    CreateTransactionsSchema,
    FilterOptionsSchema,
    FindTransactionByIdSchema,
    ListTransactionSchema,
    UpdateTransactionSchema
} from './schema';
import { TTransactionListActionReturn } from './types';

/**
 * Fetch transaction record by id.
 */
export const findById = createQueryFetch(async ({ user, data: { id } }) => {
    return db.query.transaction.findFirst({
        where: (fields, { and, eq }) =>
            and(eq(fields.userId, user.id), eq(fields.id, id)),
        with: {
            label: true
        }
    });
}, FindTransactionByIdSchema);

export const list = createQueryFetch(
    async ({
        data: { pageSize, page, orderBy, ...filters },
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

        const transactionsQuery = db
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
            );

        const transactions = queryBuilder(transactionsQuery.$dynamic(), {
            orderBy,
            filters: filterClause,
            page,
            pageSize
        });

        return {
            count: countTransactions,
            transactions: await transactions
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
                Array.isArray(id)
                    ? inArrayFilter(dbSchema.transaction.id, id)
                    : eq(dbSchema.transaction.id, id)
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

/**
 * Fetch filter options for transactions.
 */
export const listFilterOptions = createQueryFetch(
    async ({ user, data: { filterKey, filters } }) => {
        const filter = and(
            eq(dbSchema.transaction.userId, user.id),
            eq(dbSchema.transaction.isDeleted, false),
            ...Object.values(filters || []).map((f) => f)
        );

        const filterQueries = {
            label: getFilterOptions(
                dbSchema.transaction,
                dbSchema.transaction.labelId,
                filter,
                dbSchema.label,
                dbSchema.label.name,
                [dbSchema.transaction.labelId, dbSchema.label.id]
            ),
            account: getFilterOptions(
                dbSchema.transaction,
                dbSchema.transaction.accountId,
                filter,
                dbSchema.transactionAccount,
                dbSchema.transactionAccount.name,
                [dbSchema.transaction.accountId, dbSchema.transactionAccount.id]
            ),
            title: getFilterOptions(
                dbSchema.transaction,
                dbSchema.transaction.title,
                filter
            ),
            spendingCurrency: getFilterOptions(
                dbSchema.transaction,
                dbSchema.transaction.spendingCurrency,
                filter
            ),
            accountCurrency: getFilterOptions(
                dbSchema.transaction,
                dbSchema.transaction.accountCurrency,
                filter
            ),
            date: undefined
        };

        const query = await filterQueries[filterKey];

        return query;
    },
    FilterOptionsSchema
);
