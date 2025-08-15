import { TTagAssignment, TTagQuery } from '@/features/tag/schemas';
import {
    TQueryDeleteUserRecord,
    TQueryInsertUserRecord,
    TQuerySelectUserRecordById,
    TQuerySelectUserRecords,
    TQueryUpdateUserRecord,
} from '@/lib/schemas';
import { db } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';
import { and, eq } from 'drizzle-orm';
import { tag, tagToTransaction } from './schema';

/**
 * Create a new tag
 * @param data - The tag data to create
 * @param userId - The user ID of the tag
 * @returns The created tag
 */
const create = async ({ data, userId }: TQueryInsertUserRecord<TTagQuery['insert']>) =>
    withDbQuery({
        operation: 'create tag',
        queryFn: async () => {
            const [newTag] = await db
                .insert(tag)
                .values({ ...data, userId })
                .returning();
            return newTag;
        },
    });

/**
 * Get all tags for a user
 * @param userId - The user ID to get tags for
 * @returns The tags for the user
 */
const getAll = async ({ userId }: TQuerySelectUserRecords): Promise<TTagQuery['select'][]> =>
    withDbQuery({
        operation: 'get tags by user ID',
        queryFn: async () => {
            return await db
                .select()
                .from(tag)
                .where(and(eq(tag.userId, userId), eq(tag.isActive, true)));
        },
    });

/**
 * Get a tag by ID
 * @param id - The ID of the tag to get
 * @param userId - The user ID of the tag
 * @returns The tag
 */
const getById = async ({ id, userId }: TQuerySelectUserRecordById) =>
    withDbQuery({
        operation: 'get tag by ID',
        queryFn: async () => {
            const [result] = await db
                .select()
                .from(tag)
                .where(and(eq(tag.id, id), eq(tag.userId, userId)))
                .limit(1);
            return result || null;
        },
    });

/**
 * Update a tag
 * @param id - The ID of the tag to update
 * @param data - The data to update the tag with
 * @returns The updated tag
 */
export const update = async ({ id, data, userId }: TQueryUpdateUserRecord<TTagQuery['update']>) =>
    withDbQuery({
        operation: 'update tag',
        queryFn: async () => {
            const [updated] = await db
                .update(tag)
                .set({ ...data, updatedAt: new Date() })
                .where(and(eq(tag.id, id), eq(tag.userId, userId)))
                .returning();
            return updated || null;
        },
    });

/**
 * Remove a tag
 * @param id - The ID of the tag to remove
 * @returns The removed tag
 */
export const remove = async ({ id, userId }: TQueryDeleteUserRecord): Promise<void> =>
    withDbQuery({
        operation: 'delete tag',
        queryFn: async () => {
            await db
                .update(tag)
                .set({ isActive: false, updatedAt: new Date() })
                .where(and(eq(tag.id, id), eq(tag.userId, userId)));
        },
    });

/**
 * Assign tags to a transaction
 * @param transactionId - The ID of the transaction
 * @param tagIds - Array of tag IDs to assign
 * @param userId - The user ID for authorization
 * @returns Success confirmation
 */
const assignToTransaction = async ({
    transactionId,
    tagIds,
    userId,
}: TTagAssignment & { userId: string }) =>
    withDbQuery({
        operation: 'assign tags to transaction',
        queryFn: async () => {
            // Verify user owns the transaction (security check)
            // Note: We'll import transaction schema for this check

            // First, remove existing tags for this transaction
            await db
                .delete(tagToTransaction)
                .where(eq(tagToTransaction.transactionId, transactionId));

            // Then add new tags if any
            if (tagIds.length > 0) {
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

export const tagQueries = {
    create,
    getAll,
    remove,
    update,
    getById,
    assignToTransaction,
};
