import { tagSchemas, tagToTransactionSchemas } from '@/features/tag/schemas';
import { transactionServices } from '@/features/transaction/server/services';
import { db } from '@/server/db';
import { tag, tagToTransaction } from '@/server/db/schemas';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';
import { and, eq } from 'drizzle-orm';

export const { queries: tagQueries } = createFeatureQueries({
    table: tag,
    schemas: tagSchemas,
})
    /**
     * Get all tags for a user
     */
    .addQuery('getMany', {
        operation: 'get tags by user ID',
        fn: async ({ userId }) => {
            return await db.query.tag.findMany({
                where: and(eq(tag.userId, userId), eq(tag.isActive, true)),
            });
        },
    })
    /**
     * Create a tag
     */
    .addQuery('create', {
        fn: async ({ data, userId }) => {
            const [newTag] = await db
                .insert(tag)
                .values({ ...data, userId })
                .returning();
            return newTag;
        },
        operation: 'create tag',
    })
    /**
     * Get a tag by ID
     */
    .addQuery('getById', {
        operation: 'get tag by ID',
        fn: async ({ id, userId }) => {
            const [result] = await db
                .select()
                .from(tag)
                .where(and(eq(tag.id, id), eq(tag.userId, userId)))
                .limit(1);
            return result || null;
        },
    })
    /**
     * Soft delete a tag
     */
    .addQuery('removeById', {
        operation: 'delete tag',
        fn: async ({ id, userId }) => {
            await db
                .update(tag)
                .set({ isActive: false, updatedAt: new Date() })
                .where(and(eq(tag.id, id), eq(tag.userId, userId)));
        },
    })
    /**
     * Update a tag
     */
    .addQuery('updateById', {
        operation: 'update tag',
        fn: async ({ id, data, userId }) => {
            const [updated] = await db
                .update(tag)
                .set({ ...data, updatedAt: new Date() })
                .where(and(eq(tag.id, id), eq(tag.userId, userId)))
                .returning();
            return updated || null;
        },
    });

export const { queries: tagToTransactionQueries } = createFeatureQueries({
    table: tagToTransaction,
    schemas: tagToTransactionSchemas,
})
    /**
     * Assign tags to a transaction
     */
    .addQuery('assignToTransaction', {
        operation: 'assign tags to transaction',
        fn: async ({ tagIds, transactionId, userId }) => {
            // Verify user owns the transaction (security check)
            const transaction = await transactionServices.getById({
                id: transactionId,
                userId,
            });
            if (!transaction) {
                throw new Error('Transaction not found');
            }

            // First, remove existing tags for this transaction
            await db
                .delete(tagToTransaction)
                .where(eq(tagToTransaction.transactionId, transactionId));

            // Then add new tags if any
            if (tagIds && tagIds.length > 0) {
                await db.insert(tagToTransaction).values(
                    tagIds.map((tagId) => ({
                        transactionId,
                        tagId,
                    }))
                );
            }

            return { success: true };
        },
    });

export type TTag = InferFeatureType<typeof tagQueries>;
