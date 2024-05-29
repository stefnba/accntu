import { getFilterOptions } from '@/components/data-table/filters/select/db-utils';
import { inArrayFilter, queryBuilder } from '@/server/db/utils';
import { db } from '@db';
import {
    InsertTransactionSchema,
    transaction,
    transactionImport
} from '@db/schema';
import { createId } from '@paralleldrive/cuid2';
import { and, eq } from 'drizzle-orm';
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
export const listTransactions = async () => {};

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
