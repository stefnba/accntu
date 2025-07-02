import { and, eq } from 'drizzle-orm';

import { 
    insertTransactionBucketSchema, 
    transactionBucket, 
    updateTransactionBucketSchema 
} from '@/features/bucket/server/db/schemas';
import { db } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';

const getByTransactionId = (transactionId: string) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .select()
                .from(transactionBucket)
                .where(
                    and(
                        eq(transactionBucket.transactionId, transactionId), 
                        eq(transactionBucket.isActive, true)
                    )
                );
            return result || null;
        },
        operation: 'get_transaction_bucket_by_transaction_id',
        allowNull: true,
    });

const getByBucketId = (bucketId: string) =>
    withDbQuery({
        queryFn: () =>
            db
                .select()
                .from(transactionBucket)
                .where(
                    and(
                        eq(transactionBucket.bucketId, bucketId), 
                        eq(transactionBucket.isActive, true)
                    )
                ),
        operation: 'get_transaction_buckets_by_bucket_id',
    });

const create = (data: typeof insertTransactionBucketSchema._type) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .insert(transactionBucket)
                .values(data)
                .returning();
            return result;
        },
        operation: 'create_transaction_bucket',
    });

const update = ({
    id,
    data,
}: {
    id: string;
    data: typeof updateTransactionBucketSchema._type;
}) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .update(transactionBucket)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(transactionBucket.id, id))
                .returning();
            return result;
        },
        operation: 'update_transaction_bucket',
    });

const remove = (id: string) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .update(transactionBucket)
                .set({ isActive: false, updatedAt: new Date() })
                .where(eq(transactionBucket.id, id))
                .returning();

            return result;
        },
        operation: 'remove_transaction_bucket',
    });

const removeByTransactionId = (transactionId: string) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .update(transactionBucket)
                .set({ isActive: false, updatedAt: new Date() })
                .where(
                    and(
                        eq(transactionBucket.transactionId, transactionId),
                        eq(transactionBucket.isActive, true)
                    )
                )
                .returning();

            return result;
        },
        operation: 'remove_transaction_bucket_by_transaction_id',
    });

const updateSplitWiseStatus = (id: string, isRecorded: boolean) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .update(transactionBucket)
                .set({ 
                    isRecorded, 
                    updatedAt: new Date() 
                })
                .where(eq(transactionBucket.id, id))
                .returning();
            return result;
        },
        operation: 'update_transaction_bucket_splitwise_status',
    });

export const transactionBucketQueries = {
    getByTransactionId,
    getByBucketId,
    create,
    update,
    remove,
    removeByTransactionId,
    updateSplitWiseStatus,
};