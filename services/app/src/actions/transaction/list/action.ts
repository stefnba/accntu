'use server';

import { update } from '@/actions/import';
import { db, schema as dbSchema } from '@/db';
import { createFetch } from '@/lib/actions/fetch';
import { withPagination } from '@/lib/db/utils';
import { and, count, eq } from 'drizzle-orm';

import { ListTransactionSchema } from './schema';
import type { TTransactionListActionReturn } from './types';

export type Test = (typeof dbSchema.transaction)['_']['inferSelect'];

export const listTransactions = createFetch(
    async (
        user,
        { pageSize, page, ...filters }
    ): Promise<TTransactionListActionReturn> => {
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
