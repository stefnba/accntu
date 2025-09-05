import { createFeatureSchemas, InferSchemas } from '@/lib/schemas';
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
    .userField('userId')
    .idFields({
        id: true,
    })
    /**
     * Create a bucket
     */
    .addCore('create', ({ baseSchema, buildServiceInput }) => {
        const input = buildServiceInput({ data: baseSchema });
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
    .addCore('getMany', ({ buildServiceInput }) => {
        const paginationSchema = z.object({
            page: z.number().int().default(1),
            pageSize: z.number().int().default(20),
        });

        const filtersSchema = z.object({
            search: z.string().optional(),
        });

        const input = buildServiceInput({
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
    .addCore('getById', ({ buildServiceInput, idFieldsSchema }) => {
        return {
            service: buildServiceInput(),
            query: buildServiceInput(),
            endpoint: {
                param: idFieldsSchema,
            },
        };
    })
    /**
     * Update a bucket by id
     */
    .addCore('updateById', ({ baseSchema, buildServiceInput, idFieldsSchema }) => {
        return {
            service: buildServiceInput({ data: baseSchema.partial() }),
            query: buildServiceInput({ data: baseSchema.partial() }),
            endpoint: {
                json: baseSchema.partial(),
                param: idFieldsSchema,
            },
        };
    })
    /**
     * Remove a bucket by id
     */
    .addCore('removeById', ({ buildServiceInput, idFieldsSchema }) => {
        return {
            service: buildServiceInput(),
            query: buildServiceInput(),
            endpoint: {
                param: idFieldsSchema,
            },
        };
    });

// ====================
// Types
// ====================
export type TBucketSchemas = InferSchemas<typeof bucketSchemas>;

export { type TBucket } from '@/features/bucket/server/db/queries';
