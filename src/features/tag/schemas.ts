import { createFeatureSchemas, InferSchemas } from '@/lib/schemas';
import { dbTable } from '@/server/db';
import { z } from 'zod';

const colorSchema = z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color format');

export const { schemas: tagSchemas } = createFeatureSchemas
    .registerTable(dbTable.tag)
    .omit({
        createdAt: true,
        updatedAt: true,
        isActive: true,
        id: true,
        userId: true,
        transactionCount: true,
    })
    .transform((base) =>
        base.extend({
            color: colorSchema,
        })
    )
    .setUserIdField('userId')
    .setIdFields({
        id: true,
    })
    /**
     * Create a tag
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
     * Get many tags
     */
    .addCore('getMany', ({ buildInput }) => {
        const paginationSchema = z.object({
            page: z.number().int().default(1),
            pageSize: z.number().int().default(10),
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
     * Get a tag by id
     */
    .addCore('getById', ({ baseSchema, buildInput, idFieldsSchema }) => {
        return {
            service: buildInput(),
            query: buildInput(),
            endpoint: {
                json: baseSchema,
                param: idFieldsSchema,
            },
        };
    })
    /**
     * Update a tag by id
     */
    .addCore('updateById', ({ baseSchema, buildInput, idFieldsSchema }) => {
        return {
            service: buildInput({ data: baseSchema }),
            query: buildInput({ data: baseSchema }),
            endpoint: {
                json: baseSchema,
                param: idFieldsSchema,
            },
        };
    })
    /**
     * Remove a tag by id
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

export const { schemas: tagToTransactionSchemas } = createFeatureSchemas
    .registerTable(dbTable.tagToTransaction)
    .omit({
        createdAt: true,
        updatedAt: true,
        tagId: true,
        transactionId: true,
    })
    .setIdFields({
        transactionId: true,
    })
    .addCustom('assignToTransaction', ({ baseSchema, idFieldsSchema, rawSchema }) => {
        const tagsIdsSchema = z.array(rawSchema.pick({ tagId: true }).shape.tagId);

        const schema = baseSchema.extend({
            tagIds: tagsIdsSchema,
            transactionId: rawSchema.shape.transactionId,
            userId: z.string(),
        });

        return {
            service: schema,
            query: schema,
            endpoint: {
                param: idFieldsSchema,
                json: schema.pick({ tagIds: true }),
            },
        };
    });

// ====================
// Types
// ====================
export type TTagSchemas = InferSchemas<typeof tagSchemas>;
export type TTagToTransactionSchemas = InferSchemas<typeof tagToTransactionSchemas>;

export { type TTag } from '@/features/tag/server/db/queries';
