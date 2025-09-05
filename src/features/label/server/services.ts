import { labelSchemas } from '@/features/label/schemas';
import { labelQueries } from '@/features/label/server/db/queries';
import { createFeatureServices } from '@/server/lib/service';
import { InferFeatureType } from '@/server/lib/db';

export const labelServices = createFeatureServices
    .registerSchema(labelSchemas)
    .registerQuery(labelQueries)
    .defineServices(({ queries }) => ({
        /**
         * Create a new label with automatic index assignment
         */
        create: async (input) => {
            return await queries.create({ data: input.data, userId: input.userId });
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

export type TLabel = InferFeatureType<typeof labelQueries>;