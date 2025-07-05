import { TTagQuery } from '@/features/tag/schemas';
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
import { tag } from './schema';

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

export const tagQueries = {
    create,
    getAll,
    remove,
    update,
    getById,
};
