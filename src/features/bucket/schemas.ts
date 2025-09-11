import { createFeatureSchemas, InferSchemas, InferServiceSchemas } from '@/lib/schemas';
import { dbTable } from '@/server/db';
import { z } from 'zod';

export const { schemas: bucketSchemas } = createFeatureSchemas
    .registerTable(dbTable.bucket)
    .omit({
        createdAt: true,
        updatedAt: true,
        isActive: true,
        id: true,
        userId: true,
    })
    .transform((base) =>
        base.extend({
            title: z.string().min(1, 'Title cannot be empty'),
        })
    )
    .setUserIdField('userId')
    .setIdFields({
        id: true,
    })
    /**
     * Create a bucket
     */
    .addCore('create', ({ baseSchema, buildInput }) => {
        const input = buildInput({ data: baseSchema });
        return {
            service: input,
            query: input,
            endpoint: {
                json: baseSchema,
            },
        };
    })
    /**
     * Get many buckets
     */
    .addCore('getMany', ({ buildInput }) => {
        const paginationSchema = z.object({
            page: z.coerce.number().int().default(1),
            pageSize: z.coerce.number().int().default(20),
        });

        const filtersSchema = z.object({
            search: z.string().optional(),
        });

        const input = buildInput({
            pagination: paginationSchema,
            filters: filtersSchema,
        });

        return {
            service: input,
            query: input,
            endpoint: {
                query: paginationSchema.extend(filtersSchema.shape),
            },
        };
    })
    /**
     * Get a bucket by id
     */
    .addCore('getById', ({ buildInput, idFieldsSchema }) => {
        return {
            service: buildInput(),
            query: buildInput(),
            endpoint: {
                param: idFieldsSchema,
            },
        };
    })
    /**
     * Update a bucket by id
     */
    .addCore('updateById', ({ baseSchema, buildInput, idFieldsSchema }) => {
        return {
            service: buildInput({ data: baseSchema.partial() }),
            query: buildInput({ data: baseSchema.partial() }),
            endpoint: {
                json: baseSchema.partial(),
                param: idFieldsSchema,
            },
        };
    })
    /**
     * Remove a bucket by id
     */
    .addCore('removeById', ({ baseSchema, buildInput, idFieldsSchema }) => {
        return {
            service: buildInput(),
            query: buildInput(),
            endpoint: {
                json: baseSchema,
                param: idFieldsSchema,
            },
        };
    });

// ====================
// Types
// ====================
export type TBucketSchemas = InferSchemas<typeof bucketSchemas>;

export type TBucketServices = InferServiceSchemas<typeof bucketSchemas>;

export { type TBucket } from '@/features/bucket/server/db/queries';
