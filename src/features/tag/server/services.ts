import { TTagQuery } from '@/features/tag/schemas';
import { tagQueries } from '@/features/tag/server/db/queries';
import {
    TQueryDeleteUserRecord,
    TQueryInsertUserRecord,
    TQuerySelectUserRecordById,
    TQuerySelectUserRecords,
    TQueryUpdateUserRecord,
} from '@/lib/schemas';

/**
 * Create a new tag
 * @param data - The tag data to create
 * @param userId - The user ID of the tag
 * @returns The created tag
 */
const create = async ({ data, userId }: TQueryInsertUserRecord<TTagQuery['insert']>) => {
    return await tagQueries.create({ data, userId });
};

/**
 * Get all tags for a user
 * @param userId - The user ID to get tags for
 * @returns The tags for the user
 */
const getAll = async ({ userId }: TQuerySelectUserRecords) => {
    return await tagQueries.getAll({ userId: userId });
};

/**
 * Get a tag by ID
 * @param id - The ID of the tag to get
 * @param userId - The user ID of the tag
 * @returns The tag
 */
const getById = async ({ id, userId }: TQuerySelectUserRecordById) => {
    return await tagQueries.getById({ id, userId });
};

/**
 * Update a tag
 * @param id - The ID of the tag to update
 * @param data - The data to update the tag with
 * @param userId - The user ID of the tag
 * @returns The updated tag
 */
const update = async ({ id, data, userId }: TQueryUpdateUserRecord<TTagQuery['update']>) => {
    return await tagQueries.update({ id, data, userId });
};

/**
 * Remove a tag
 * @param id - The ID of the tag to remove
 * @param userId - The user ID of the tag
 * @returns The removed tag
 */
const remove = async ({ id, userId }: TQueryDeleteUserRecord) => {
    return await tagQueries.remove({ id, userId });
};

export const tagServices = {
    create,
    getAll,
    getById,
    update,
    remove,
};
