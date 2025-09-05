import { createFeatureSchemas, InferSchemas, InferServiceSchemas } from '@/lib/schemas';
import { dbTable } from '@/server/db';
import z from 'zod';

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
    .userField('userId')
    .idFields({
        id: true,
    })
    /**
     * Create a tag
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
     * Get many tags
     */
    .addCore('getMany', ({ buildServiceInput }) => {
        const paginationSchema = z.object({
            page: z.number().int().default(1),
            pageSize: z.number().int().default(10),
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
     * Get a tag by id
     */
    .addCore('getById', ({ baseSchema, buildServiceInput, idFieldsSchema }) => {
        return {
            service: buildServiceInput(),
            query: buildServiceInput(),
            endpoint: {
                json: baseSchema,
                param: idFieldsSchema,
            },
        };
    })
    /**
     * Update a tag by id
     */
    .addCore('updateById', ({ baseSchema, buildServiceInput, idFieldsSchema }) => {
        return {
            service: buildServiceInput({ data: baseSchema }),
            query: buildServiceInput({ data: baseSchema }),
            endpoint: {
                json: baseSchema,
                param: idFieldsSchema,
            },
        };
    })
    /**
     * Remove a tag by id
     */
    .addCore('removeById', ({ baseSchema, buildServiceInput, idFieldsSchema }) => {
        return {
            service: buildServiceInput(),
            query: buildServiceInput(),
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
    .idFields({
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

export type TTagServices = InferServiceSchemas<typeof tagSchemas>;

// type AAA = TTagSchemas['operations']['create']

export { type TTag } from '@/features/tag/server/db/queries';
