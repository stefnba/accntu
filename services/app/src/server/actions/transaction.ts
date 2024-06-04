import { getFilterOptions } from '@/components/data-table/filters/select/db-utils';
import { ListTransactionSchema } from '@/features/transaction/schema/get-transactions';
import { inArrayFilter, queryBuilder } from '@/server/db/utils';
import { db } from '@db';
import {
    InsertTransactionSchema,
    connectedAccount,
    label,
    transaction,
    transactionImport
} from '@db/schema';
import { createId } from '@paralleldrive/cuid2';
import { and, count, eq } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Create new transaction records.
 */
export const createTransactions = async (
    values: z.infer<typeof InsertTransactionSchema>[],
    importId: string,
    accountId: string,
    userId: string
) => {
    const newTransactions = await db
        .insert(transaction)
        .values(
            values.map((transaction) => ({
                ...transaction,
                id: createId(),
                accountId,
                userId,
                importId
            }))
        )
        .returning()
        .onConflictDoNothing();

    // update import record
    await db
        .update(transactionImport)
        .set({
            successAt: new Date()
            //  countTransactions: newTransactions.length
        })
        .where(
            and(
                eq(transactionImport.id, importId),
                eq(transactionImport.userId, userId)
            )
        );

    return newTransactions;
};

/**
 * List transaction records with pagination, ordering, filtering.
 */
export const listTransactions = async (
    params: z.infer<typeof ListTransactionSchema>,
    userId: string
) => {
    const { orderBy, page, pageSize, ...filters } = params;

    const filterClause = and(
        eq(transaction.userId, userId),
        eq(transaction.isDeleted, false),
        ...Object.values(filters).map((f) => f)
    );

    const countTransactions = (
        await db
            .select({ count: count() })
            .from(transaction)
            .where(filterClause)
    )[0].count;

    const transactionsQuery = db
        .select({
            id: transaction.id,
            title: transaction.title,
            key: transaction.key,
            date: transaction.date,
            note: transaction.note,
            city: transaction.city,
            userId: transaction.userId,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
            country: transaction.country,
            isNew: transaction.isNew,
            type: transaction.type,
            accountAmount: transaction.accountAmount,
            accountCurrency: transaction.accountCurrency,
            spendingAmount: transaction.spendingAmount,
            spendingCurrency: transaction.spendingCurrency,
            importId: transaction.importId,
            label: {
                id: label.id,
                name: label.name
            },
            account: {
                id: connectedAccount.id,
                name: connectedAccount.name
            }
        })
        .from(transaction)
        .leftJoin(label, eq(label.id, transaction.labelId))
        .leftJoin(
            connectedAccount,
            eq(connectedAccount.id, transaction.accountId)
        );

    const transactions = queryBuilder(transactionsQuery.$dynamic(), {
        orderBy,
        filters: filterClause,
        page,
        pageSize
    });

    return {
        count: 0,
        transactions: await transactions
    };
};

export const updateTransactions = async (
    data: any,
    id: string,
    userId: string
) => {
    await db
        .update(transaction)
        .set(data)
        .where(
            and(
                eq(transaction.userId, userId),
                Array.isArray(id)
                    ? inArrayFilter(transaction.id, id)
                    : eq(transaction.id, id)
            )
        )
        .returning();
};
