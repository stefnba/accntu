import { tag, tagToTransaction } from '@/features/tag/server/db/tables';
import { createFeatureSchemas, InferSchemas, InferServiceSchemas } from '@/lib/schemas';
import z from 'zod';

const colorSchema = z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color format');

export const { schemas: tagSchemas } = createFeatureSchemas
    .registerTable(tag)
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
            endpoint: {
                json: input,
            },
        };
    })
    /**
     * Get many tags
     */
    .addCore('getMany', ({ baseSchema, buildServiceInput }) => {
        return {
            service: buildServiceInput({
                filters: z.object({ name: z.string() }),
                pagination: z.object({ page: z.number(), limit: z.number() }),
            }),
            endpoint: {
                query: baseSchema,
            },
        };
    })
    /**
     * Get a tag by id
     */
    .addCore('getById', ({ baseSchema, buildServiceInput, idFieldsSchema }) => {
        return {
            service: buildServiceInput(),
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
            endpoint: {
                json: baseSchema,
                param: idFieldsSchema,
            },
        };
    });

export const { schemas: tagToTransactionSchemas } = createFeatureSchemas
    .registerTable(tagToTransaction)
    .omit({
        createdAt: true,
        updatedAt: true,
    })
    .idFields({
        transactionId: true,
    })
    .addCustom('assignToTransaction', ({ baseSchema, idFieldsSchema }) => {
        return {
            service: z.object({
                tagIds: z.array(baseSchema.pick({ tagId: true }).shape.tagId),
            }),
            endpoint: {
                param: idFieldsSchema,
                json: baseSchema,
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
