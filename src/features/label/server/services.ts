import { labelSchemas } from '@/features/label/schemas';
import { labelQueries } from '@/features/label/server/db/queries';
import { InferFeatureType } from '@/server/lib/db';
import { createFeatureServices } from '@/server/lib/service';

export const labelServices = createFeatureServices
    .registerSchema(labelSchemas)
    .registerQuery(labelQueries)
    .defineServices(({ queries }) => ({
        /**
         * Create a new label with automatic index assignment
         */
        create: async (input) => {
            // Get next index for this parent level
            const parentId = input.data.parentId ?? null;
            const maxindexResult = await queries.getMaxIndex({ parentId, userId: input.userId });

            const nextindex = (maxindexResult[0]?.maxSort ?? -1) + 1;
            return await queries.create({
                data: { ...input.data, userId: input.userId, index: nextindex },
            });
        },

        /**
         * Get many labels with optional filtering and pagination
         */
        getMany: async (input) => {
            return await queries.getMany({
                userId: input.userId,
                filters: input.filters,
                pagination: input.pagination,
            });
        },

        /**
         * Get a label by ID
         */
        getById: async (input) => {
            return await queries.getById({ ids: input.ids, userId: input.userId });
        },

        /**
         * Update a label by ID
         */
        updateById: async (input) => {
            // Check if the label exists and belongs to the user
            const existingLabel = await queries.getById({ ids: input.ids, userId: input.userId });
            if (!existingLabel) {
                throw new Error('Label not found or you do not have permission to update it');
            }

            // If updating parentId, check for circular hierarchy
            if (input.data.parentId !== undefined) {
                if (input.data.parentId === input.ids.id) {
                    throw new Error('A label cannot be its own parent');
                }

                // Check if the new parent would create a circular hierarchy
                if (input.data.parentId) {
                    const wouldCreateCircularHierarchy = await checkCircularHierarchy({
                        labelId: input.ids.id,
                        newParentId: input.data.parentId,
                        userId: input.userId,
                        queries,
                    });

                    if (wouldCreateCircularHierarchy) {
                        throw new Error('Cannot create circular hierarchy: the new parent is a descendant of this label');
                    }
                }
            }

            return await queries.updateById({
                ids: input.ids,
                data: input.data,
                userId: input.userId,
            });
        },

        /**
         * Remove a label by ID (soft delete)
         */
        removeById: async (input) => {
            return await queries.removeById({ ids: input.ids, userId: input.userId });
        },

        /**
         * Get flattened labels with hierarchy information
         */
        getFlattened: async (input) => {
            return await queries.getFlattened({
                userId: input.userId,
                filters: input.filters,
            });
        },

        /**
         * Reorder labels in bulk
         */
        reorder: async (input) => {
            return await queries.reorder({
                items: input.items,
                userId: input.userId,
            });
        },
    }));

// Helper function to check for circular hierarchy
async function checkCircularHierarchy({
    labelId,
    newParentId,
    userId,
    queries,
}: {
    labelId: string;
    newParentId: string;
    userId: string;
    queries: any;
}): Promise<boolean> {
    // Walk up the parent chain of the new parent to see if it eventually leads to labelId
    let currentParentId = newParentId;
    const visitedIds = new Set<string>();

    while (currentParentId && !visitedIds.has(currentParentId)) {
        visitedIds.add(currentParentId);

        // If we find labelId in the parent chain, it would create a circular hierarchy
        if (currentParentId === labelId) {
            return true;
        }

        // Get the parent of the current parent
        const parentLabel = await queries.getById({
            ids: { id: currentParentId },
            userId,
        });

        if (!parentLabel) {
            break;
        }

        currentParentId = parentLabel.parentId;
    }

    return false;
}

export type TLabel = InferFeatureType<typeof labelQueries>;
