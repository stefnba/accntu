import { and, eq } from 'drizzle-orm';

import {
    bucketTransaction,
    insertbucketTransactionSchema,
    updatebucketTransactionSchema,
} from '@/features/bucket/server/db/schemas';
import { db } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';

const getByTransactionId = (transactionId: string) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .select()
                .from(bucketTransaction)
                .where(
                    and(
                        eq(bucketTransaction.transactionId, transactionId),
                        eq(bucketTransaction.isActive, true)
                    )
                );
            return result || null;
        },
        operation: 'get_bucket_transaction_by_transaction_id',
        allowNull: true,
    });

const getByBucketId = (bucketId: string) =>
    withDbQuery({
        queryFn: () =>
            db
                .select()
                .from(bucketTransaction)
                .where(
                    and(
                        eq(bucketTransaction.bucketId, bucketId),
                        eq(bucketTransaction.isActive, true)
                    )
                ),
        operation: 'get_bucket_transactions_by_bucket_id',
    });

const create = (data: typeof insertbucketTransactionSchema._type) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db.insert(bucketTransaction).values(data).returning();
            return result;
        },
        operation: 'create_bucket_transaction',
    });

const update = ({ id, data }: { id: string; data: typeof updatebucketTransactionSchema._type }) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .update(bucketTransaction)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(bucketTransaction.id, id))
                .returning();
            return result;
        },
        operation: 'update_bucket_transaction',
    });

const remove = (id: string) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .update(bucketTransaction)
                .set({ isActive: false, updatedAt: new Date() })
                .where(eq(bucketTransaction.id, id))
                .returning();

            return result;
        },
        operation: 'remove_bucket_transaction',
    });

const removeByTransactionId = (transactionId: string) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .update(bucketTransaction)
                .set({ isActive: false, updatedAt: new Date() })
                .where(
                    and(
                        eq(bucketTransaction.transactionId, transactionId),
                        eq(bucketTransaction.isActive, true)
                    )
                )
                .returning();

            return result;
        },
        operation: 'remove_bucket_transaction_by_transaction_id',
    });

const updateSplitWiseStatus = (id: string, isRecorded: boolean) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .update(bucketTransaction)
                .set({
                    isRecorded,
                    updatedAt: new Date(),
                })
                .where(eq(bucketTransaction.id, id))
                .returning();
            return result;
        },
        operation: 'update_bucket_transaction_splitwise_status',
    });

export const bucketTransactionQueries = {
    getByTransactionId,
    getByBucketId,
    create,
    update,
    remove,
    removeByTransactionId,
    updateSplitWiseStatus,
};
