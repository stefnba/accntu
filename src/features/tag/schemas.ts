import { tag, tagToTransaction } from '@/features/tag/server/db/tables';
import { FeatureSchema, InferSchemas } from '@/lib/schemas';
import z from 'zod';

const colorSchema = z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color format');

export const { opSchemas: tagSchemas } = FeatureSchema.fromTable(tag)
    .omit({
        createdAt: true,
        updatedAt: true,
        isActive: true,
        id: true,
        userId: true,
        transactionCount: true,
    })
    .idFields({
        id: true,
    })
    .userFields({
        userId: true,
    })
    .transform((base) =>
        base.extend({
            color: colorSchema,
        })
    )
    .buildOpSchemas((builder) =>
        builder
            .addCore('create', ({ baseSchema, userFieldsSchema, idFieldsSchema }) => {
                return {
                    query: z.object({
                        data: baseSchema,
                        userId: userFieldsSchema.shape.userId,
                    }),
                    service: {
                        data: baseSchema,
                        user: userFieldsSchema,
                        ids: idFieldsSchema,
                        // idFields: idFieldsSchema
                    },
                    endpoint: {
                        json: baseSchema,
                    },
                };
            })
            .addCore('getById', ({ idFieldsSchema, userFieldsSchema }) => {
                return {
                    query: z.object({
                        id: idFieldsSchema.shape.id,
                        userId: userFieldsSchema.shape.userId,
                    }),
                    service: {
                        idFields: idFieldsSchema,
                    },
                    endpoint: {
                        param: idFieldsSchema.pick({ id: true }),
                    },
                };
            })
            .addCore('updateById', ({ baseSchema, idFieldsSchema, userFieldsSchema }) => {
                return {
                    query: z.object({
                        id: idFieldsSchema.shape.id,
                        data: baseSchema,
                        userId: userFieldsSchema.shape.userId,
                    }),
                    endpoint: {
                        param: idFieldsSchema.pick({ id: true }),
                        json: baseSchema,
                    },
                    service: {
                        data: baseSchema,
                        idFields: idFieldsSchema,
                    },
                };
            })
            .addCore('removeById', ({ idFieldsSchema, userFieldsSchema }) => {
                return {
                    query: z.object({
                        id: idFieldsSchema.shape.id,
                        userId: userFieldsSchema.shape.userId,
                    }),
                    service: {
                        idFields: idFieldsSchema,
                        userFields: userFieldsSchema,
                    },
                    endpoint: {
                        param: idFieldsSchema.pick({ id: true }),
                    },
                };
            })
            .addCore('getMany', ({ userFieldsSchema }) => {
                return {
                    query: userFieldsSchema,
                    endpoint: {
                        query: userFieldsSchema,
                    },
                    service: {
                        idFields: userFieldsSchema,
                    },
                };
            })
    );

export const { opSchemas: tagToTransactionSchemas } = FeatureSchema.fromTable(tagToTransaction)
    .omit({
        createdAt: true,
        updatedAt: true,
    })
    .idFields({
        transactionId: true,
    })
    .buildOpSchemas((builder) =>
        builder.addCustom('assignToTransaction', ({ baseSchema, idFieldsSchema }) => {
            const input = z.object({
                tagIds: z.array(baseSchema.pick({ tagId: true }).shape.tagId),
            });

            return {
                query: input.extend({
                    transactionId: idFieldsSchema.shape.transactionId,
                    userId: z.string(), // Add userId for security
                }),
                service: input.extend({
                    idFields: idFieldsSchema,
                }),
                endpoint: {
                    param: idFieldsSchema,
                    json: input,
                },
            };
        })
    );

// ====================
// Types
// ====================
export type TTagSchemas = InferSchemas<typeof tagSchemas>;
export type TTagToTransactionSchemas = InferSchemas<typeof tagToTransactionSchemas>;

export { type TTag } from '@/features/tag/server/db/queries';
