import { inArrayFilter } from '@/server/db/utils';
import { db } from '@db';
import { transaction } from '@db/schema';
import { UpdateTransactionsSchema } from '@features/transaction/schema';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Update multiple transaction records.
 * @param values new values to update
 * @param ids array of transaction ids, or single transaction id
 * @param userId user id
 */
export const updateTransactions = async ({
    userId,
    ids,
    values
}: z.infer<typeof UpdateTransactionsSchema> & { userId: string }) => {
    await db
        .update(transaction)
        .set(values)
        .where(
            and(
                eq(transaction.userId, userId),
                Array.isArray(ids)
                    ? inArrayFilter(transaction.id, ids)
                    : eq(transaction.id, ids)
            )
        )
        .returning();
};
