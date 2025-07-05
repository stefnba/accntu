import { and, eq, sql } from 'drizzle-orm';

import { bucketQuerySchemas } from '@/features/bucket/schemas';
import { bucket, bucketToTransaction } from '@/features/bucket/server/db/schemas';
import { transaction } from '@/features/transaction/server/db/schema';
import { TQueryDeleteUserRecord, TQueryUpdateUserRecord } from '@/lib/schemas';
import { db } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';

const getById = (id: string, userId: string) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .select({
                    id: bucket.id,
                    userId: bucket.userId,
                    title: bucket.title,
                    type: bucket.type,
                    status: bucket.status,
                    paidAmount: bucket.paidAmount,
                    currency: bucket.currency,
                    createdAt: bucket.createdAt,
                    updatedAt: bucket.updatedAt,
                    isActive: bucket.isActive,
                    // Computed fields via subqueries
                    totalTransactions: sql<number>`(
                        SELECT COUNT(*)::int
                        FROM ${bucketToTransaction} tb
                        WHERE tb.bucket_id = ${bucket.id}
                        AND tb.is_active = true
                    )`,
                    totalAmount: sql<string>`COALESCE((
                        SELECT SUM(CAST(t.user_amount AS DECIMAL))::text
                        FROM ${bucketToTransaction} tb
                        JOIN ${transaction} t ON tb.transaction_id = t.id
                        WHERE tb.bucket_id = ${bucket.id}
                        AND tb.is_active = true
                        AND t.is_active = true
                    ), '0.00')`,
                    openAmount: sql<string>`(
                        COALESCE((
                            SELECT SUM(CAST(t.user_amount AS DECIMAL))::text
                            FROM ${bucketToTransaction} tb
                            JOIN ${transaction} t ON tb.transaction_id = t.id
                            WHERE tb.bucket_id = ${bucket.id}
                            AND tb.is_active = true
                            AND t.is_active = true
                        ), '0.00')::decimal - ${bucket.paidAmount}
                    )::text`,
                })
                .from(bucket)
                .where(
                    and(eq(bucket.id, id), eq(bucket.userId, userId), eq(bucket.isActive, true))
                );
            return result || null;
        },
        operation: 'get_bucket_by_id_with_stats',
        allowNull: true,
    });

const getAll = (userId: string) =>
    withDbQuery({
        queryFn: () =>
            db
                .select({
                    id: bucket.id,
                    userId: bucket.userId,
                    title: bucket.title,
                    type: bucket.type,
                    status: bucket.status,
                    paidAmount: bucket.paidAmount,
                    currency: bucket.currency,
                    createdAt: bucket.createdAt,
                    updatedAt: bucket.updatedAt,
                    isActive: bucket.isActive,
                    // Computed fields via subqueries
                    totalTransactions: sql<number>`(
                        SELECT COUNT(*)::int
                        FROM ${bucketTransaction} tb
                        WHERE tb.bucket_id = ${bucket.id}
                        AND tb.is_active = true
                    )`,
                    totalAmount: sql<string>`COALESCE((
                        SELECT SUM(CAST(t.user_amount AS DECIMAL))::text
                        FROM ${bucketTransaction} tb
                        JOIN ${transaction} t ON tb.transaction_id = t.id
                        WHERE tb.bucket_id = ${bucket.id}
                        AND tb.is_active = true
                        AND t.is_active = true
                    ), '0.00')`,
                    openAmount: sql<string>`(
                        COALESCE((
                            SELECT SUM(CAST(t.user_amount AS DECIMAL))::text
                            FROM ${bucketTransaction} tb
                            JOIN ${transaction} t ON tb.transaction_id = t.id
                            WHERE tb.bucket_id = ${bucket.id}
                            AND tb.is_active = true
                            AND t.is_active = true
                        ), '0.00')::decimal - ${bucket.paidAmount}
                    )::text`,
                })
                .from(bucket)
                .where(and(eq(bucket.userId, userId), eq(bucket.isActive, true))),
        operation: 'get_all_buckets_with_stats',
    });

const create = (data: typeof bucketQuerySchemas.insert._type, userId: string) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .insert(bucket)
                .values({ ...data, userId })
                .returning();
            return result;
        },
        operation: 'create_bucket',
    });

const update = ({
    id,
    data,
    userId,
}: TQueryUpdateUserRecord<typeof bucketQuerySchemas.update._type>) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .update(bucket)
                .set({ ...data, updatedAt: new Date() })
                .where(and(eq(bucket.id, id), eq(bucket.userId, userId)))
                .returning();
            return result;
        },
        operation: 'update_bucket',
    });

const remove = ({ id, userId }: TQueryDeleteUserRecord) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .update(bucket)
                .set({ isActive: false, updatedAt: new Date() })
                .where(and(eq(bucket.id, id), eq(bucket.userId, userId)))
                .returning();

            return result;
        },
        operation: 'remove_bucket',
    });

const updatePaidAmount = ({
    id,
    userId,
    paidAmount,
}: {
    id: string;
    userId: string;
    paidAmount: string;
}) =>
    withDbQuery({
        queryFn: async () => {
            const [result] = await db
                .update(bucket)
                .set({ paidAmount, updatedAt: new Date() })
                .where(and(eq(bucket.id, id), eq(bucket.userId, userId)))
                .returning();

            return result;
        },
        operation: 'update_bucket_paid_amount',
    });

export const bucketQueries = {
    getById,
    getAll,
    create,
    update,
    remove,
    updatePaidAmount,
};
