import { MappingCoreServiceInput, TZodObject } from '@/lib/schemas/types';
import z from 'zod';
import { $ZodType } from 'zod/v4/core';

/**
 * Input helpers for the core service input
 */
export const inputHelpers = <U extends $ZodType, I extends TZodObject>(defaults: {
    userId: U;
    ids: I;
}): MappingCoreServiceInput<U, I> => {
    return {
        /**
         * Create a record
         */
        create: (params) => {
            return z.object({
                data: params.data,
                userId: params.userFields || defaults.userId,
            });
        },
        /**
         * Get a record by id
         */
        getById: (params) => {
            return z.object({
                ids: params?.idFields ?? defaults.ids,
                userId: params?.userFields || defaults.userId,
            });
        },
        /**
         * Get many records
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
        /*
         * Update a record by id
         */
        updateById: (params) => {
            return z.object({
                ids: params.idFields ?? defaults.ids,
                data: params.data,
                userId: params.userFields ?? defaults.userId,
            });
        },
        /**
         * Remove a record by id (soft delete)
         */
        removeById: (params) => {
            return z.object({
                ids: params?.idFields ?? defaults.ids,
                userId: params?.userFields ?? defaults.userId,
            });
        },
    } as const;
};
