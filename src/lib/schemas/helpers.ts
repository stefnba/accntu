import { MappingCoreServiceInput } from '@/lib/schemas/types';
import { TZodObject, TZodType } from '@/lib/validation';
import { z } from 'zod';

/**
 * Creates input schema helpers for core CRUD operations.
 * These helpers automatically generate properly typed service input schemas
 * that include user authentication and standardized parameter patterns.
 *
 * @template U - The user ID field type
 * @template I - The ID fields schema type
 * @param defaults - Default values for userId and ids fields
 * @param defaults.userId - The user ID field schema
 * @param defaults.ids - The ID fields schema for entity lookups
 * @returns Object with helper functions for each core operation
 *
 * @example
 * ```typescript
 * const helpers = inputHelpers({
 *   userId: z.string(),
 *   ids: z.object({ id: z.string() })
 * });
 *
 * // Generate create input schema
 * const createInput = helpers.create({ data: z.object({ name: z.string() }) });
 * // Result: { data: { name: string }, userId: string }
 *
 * // Generate getById input schema
 * const getByIdInput = helpers.getById();
 * // Result: { ids: { id: string }, userId: string }
 * ```
 */
export const inputHelpers = <U extends TZodType, I extends TZodObject>(defaults: {
    userId: U;
    ids: I;
}): MappingCoreServiceInput<U, I> => {
    return {
        /**
         * Generates input schema for create operations.
         * Combines data payload with user authentication.
         *
         * @param params - Configuration object
         * @param params.data - The data schema for the entity being created
         * @param params.userFields - Optional override for user field schema
         * @returns Combined schema with data and userId fields
         */
        create: (params) => {
            return z.object({
                data: params.data,
                userId: params.userFields || defaults.userId,
            });
        },
        /**
         * Generates input schema for getById operations.
         * Combines ID fields with user authentication for secure lookups.
         *
         * @param params - Optional configuration object
         * @param params.setIdFields - Optional override for ID field schema
         * @param params.userFields - Optional override for user field schema
         * @returns Combined schema with ids and userId fields
         */
        getById: (params) => {
            return z.object({
                ids: params?.setIdFields ?? defaults.ids,
                userId: params?.userFields || defaults.userId,
            });
        },
        /**
         * Generates input schema for getMany operations.
         * Supports optional filters and pagination with user authentication.
         *
         * @template F - The filters schema type
         * @template P - The pagination schema type
         * @param params - Optional configuration object
         * @param params.filters - Optional filters schema for query filtering
         * @param params.pagination - Optional pagination schema for result paging
         * @param params.userFields - Optional override for user field schema
         * @returns Combined schema with optional filters, pagination, and required userId
         */
        getMany: <F extends TZodObject, P extends TZodObject>(params?: {
            filters?: F;
            pagination?: P;
            userFields?: U;
        }) => {
            return z.object({
                userId: params?.userFields ?? defaults.userId,
                filters: params?.filters?.optional() || z.undefined(),
                pagination: params?.pagination?.optional() || z.undefined(),
            });
        },
        /**
         * Generates input schema for updateById operations.
         * Combines ID fields, update data, and user authentication.
         *
         * @param params - Configuration object
         * @param params.data - The update data schema
         * @param params.setIdFields - Optional override for ID field schema
         * @param params.userFields - Optional override for user field schema
         * @returns Combined schema with ids, data, and userId fields
         */
        updateById: (params) => {
            return z.object({
                ids: params.setIdFields ?? defaults.ids,
                data: params.data,
                userId: params.userFields ?? defaults.userId,
            });
        },
        /**
         * Generates input schema for removeById operations (soft delete).
         * Combines ID fields with user authentication for secure deletion.
         *
         * @param params - Optional configuration object
         * @param params.setIdFields - Optional override for ID field schema
         * @param params.userFields - Optional override for user field schema
         * @returns Combined schema with ids and userId fields
         */
        removeById: (params) => {
            return z.object({
                ids: params?.setIdFields ?? defaults.ids,
                userId: params?.userFields ?? defaults.userId,
            });
        },
    } as const;
};
