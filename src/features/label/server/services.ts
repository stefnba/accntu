import { labelSchema } from '@/features/label/schemas';
import { labelQueries } from '@/features/label/server/db/queries';
import { createFeatureServices } from '@/server/lib/service';

export const labelService = createFeatureServices({
    queries: labelQueries,
    schemas: labelSchema,
    services: ({ schemas, queries }) => ({
        create: async (input) => {
            const maxIndex = await queries.getMaxIndex({
                userId: input.userId,
                parentId: input.parentId ?? undefined,
            });

            return maxIndex;
        },
    }),
});

export const labelSerdddvices = {
    /**
     * Get all labels for a user with parent/child relationships
     * @param userId - The user ID to fetch labels for
     * @returns Promise resolving to array of labels with relationships
     */
    async getAll({ userId, filters }: TQuerySelectUserRecords<TLabelService['filter']>) {
        return await labelQueries.getAll({ userId, filters });
    },

    /**
     * Get all labels flattened
     */
    async getAllFlattened({ userId, filters }: TQuerySelectUserRecords<TLabelService['filter']>) {
        return await labelQueries.getAllFlattened({ userId, filters });
    },

    /**
     * Get root labels (no parent) with nested children for a user
     * @param userId - The user ID to fetch labels for
     * @returns Promise resolving to array of root labels with nested children
     */
    async getRootLabels({ userId }: TQuerySelectUserRecords) {
        return await labelQueries.getRootLabels(userId);
    },

    /**
     * Get a specific label by ID for a user
     * @param id - The label ID to fetch
     * @param userId - The user ID that owns the label
     * @returns Promise resolving to the label or null if not found
     */
    async getById({ id, userId }: TQuerySelectUserRecordById) {
        return await labelQueries.getById(id, userId);
    },

    /**
     * Create a new label for a user
     * @param data - The label data to create (name, color, parentId, etc.)
     * @param userId - The user ID that will own the label
     * @returns Promise resolving to the created label
     */
    async create({ data, userId }: TQueryInsertUserRecord<TLabelService['insert']>) {
        const maxIndex = await labelQueries.getMaxIndex({
            userId,
            parentId: data.parentId ?? undefined,
        });

        return await labelQueries.create({
            data: { ...data, index: maxIndex.maxIndex + 1 },
            userId,
        });
    },

    /**
     * Update an existing label for a user
     * @param id - The label ID to update
     * @param data - The updated label data
     * @param userId - The user ID that owns the label
     * @returns Promise resolving to the updated label or null if not found
     */
    async update({ id, data, userId }: TQueryUpdateUserRecord<TLabelService['update']>) {
        return await labelQueries.update({ id, data, userId });
    },

    /**
     * Soft delete a label by setting isActive to false
     * @param id - The label ID to delete
     * @param userId - The user ID that owns the label
     * @returns Promise resolving to the deleted label or null if not found
     */
    async remove({ id, userId }: TQueryDeleteUserRecord) {
        return await labelQueries.remove({ id, userId });
    },

    /**
     * Bulk reorder labels for drag and drop operations
     * @param items - Array of label items with new positions after drag and drop
     * @param userId - The user ID that owns all labels
     * @returns Promise resolving to updated flattened labels
     */
    async reorder({ items, userId }: { items: TLabelService['reorder']['items']; userId: string }) {
        return await labelQueries.reorder({ items, userId });
    },
};
