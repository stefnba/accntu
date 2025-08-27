import { transactionServices } from '@/features/transaction/server/services';
import { db } from '@/server/db';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';
import { and, eq } from 'drizzle-orm';
import { tag, tagToTransaction } from './schema';

export const tagQueries = createFeatureQueries(tag, {
    /**
     * Get all tags for a user
     */
    getMany: {
        operation: 'get tags by user ID',
        fn: async ({ userId }) => {
            return await db
                .select()
                .from(tag)
                .where(and(eq(tag.userId, userId), eq(tag.isActive, true)));
        },
    },
    /**
     * Create a tag
     */
    create: {
        fn: async ({ data, userId }) => {
            const [newTag] = await db
                .insert(tag)
                .values({ ...data, userId })
                .returning();
            return newTag;
        },
        operation: 'create tag',
    },
    /**
     * Get a tag by ID
     */
    getById: {
        operation: 'get tag by ID',
        fn: async ({ id, userId }) => {
            const [result] = await db
                .select()
                .from(tag)
                .where(and(eq(tag.id, id), eq(tag.userId, userId)))
                .limit(1);
            return result || null;
        },
    },
    /**
     * Soft delete a tag
     */
    removeById: {
        operation: 'delete tag',
        fn: async ({ id, userId }) => {
            await db
                .update(tag)
                .set({ isActive: false, updatedAt: new Date() })
                .where(and(eq(tag.id, id), eq(tag.userId, userId)));
        },
    },
    /**
     * Update a tag
     */
    updateById: {
        operation: 'update tag',
        fn: async ({ id, data, userId }) => {
            const [updated] = await db
                .update(tag)
                .set({ ...data, updatedAt: new Date() })
                .where(and(eq(tag.id, id), eq(tag.userId, userId)))
                .returning();
            return updated || null;
        },
    },
    /**
     * Assign a tag to a transaction
     */
    assignToTransaction: {
        operation: 'assign tags to transaction',
        fn: async ({ id, userId, tagIds }: { id: string; userId: string; tagIds: string[] }) => {
            // Verify user owns the transaction (security check)
            const transaction = await transactionServices.getById({ id, userId });
            if (!transaction) {
                throw new Error('Transaction not found');
            }

            // First, remove existing tags for this transaction
            await db.delete(tagToTransaction).where(eq(tagToTransaction.transactionId, id));

            // Then add new tags if any
            if (tagIds && tagIds.length > 0) {
                await db.insert(tagToTransaction).values(
                    tagIds.map((tagId) => ({
                        transactionId: id,
                        tagId,
                    }))
                );
            }

            return { success: true };
        },
    },
});

export type TTag = InferFeatureType<typeof tagQueries>;
