import { tagTableConfig, tagToTransactionTableConfig } from '@/features/tag/server/db/config';
import { createFeatureSchemas } from '@/lib/schema';
import { z } from 'zod';

export const tagSchemas = createFeatureSchemas(tagTableConfig).registerAllStandard().build();

// export const { schemas: tagSchemas } = createFeatureSchemas
//     .registerTable(tag)
//     .omit({
//         createdAt: true,
//         updatedAt: true,
//         isActive: true,
//         id: true,
//         userId: true,
//         transactionCount: true,
//     })
//     .transform((base) =>
//         base.extend({
//             color: colorSchema,
//             name: z.string().min(1, 'Name cannot be empty'),
//         })
//     )
//     .setUserIdField('userId')
//     .setIdFields({
//         id: true,
//     })
//     /**
//      * Create a tag
//      */
//     .addCore('create', ({ baseSchema, buildInput }) => {
//         const input = buildInput({ data: baseSchema });
//         return {
//             service: input,
//             query: input,
//             form: baseSchema,
//             endpoint: {
//                 json: baseSchema,
//             },
//         };
//     })
//     /**
//      * Get many tags
//      */
//     .addCore('getMany', ({ buildInput }) => {
//         const paginationSchema = z.object({
//             page: z.coerce.number().int().default(1),
//             pageSize: z.coerce.number().int().default(10),
//         });

//         const filtersSchema = z.object({
//             search: z.string().optional(),
//         });

//         const input = buildInput({
//             pagination: paginationSchema,
//             filters: filtersSchema,
//         });

//         return {
//             service: input,
//             query: input,
//             endpoint: {
//                 query: paginationSchema.extend(filtersSchema.shape),
//             },
//         };
//     })
//     /**
//      * Get a tag by id
//      */
//     .addCore('getById', ({ baseSchema, buildInput, idFieldsSchema }) => {
//         return {
//             service: buildInput(),
//             query: buildInput(),
//             endpoint: {
//                 json: baseSchema,
//                 param: idFieldsSchema,
//             },
//         };
//     })
//     /**
//      * Update a tag by id
//      */
//     .addCore('updateById', ({ baseSchema, buildInput, idFieldsSchema }) => {
//         return {
//             service: buildInput({ data: baseSchema.partial() }),
//             query: buildInput({ data: baseSchema.partial() }),
//             endpoint: {
//                 json: baseSchema.partial(),
//                 param: idFieldsSchema,
//             },
//             form: baseSchema.partial(),
//         };
//     })
//     /**
//      * Remove a tag by id
//      */
//     .addCore('removeById', ({ baseSchema, buildInput, idFieldsSchema }) => {
//         return {
//             service: buildInput(),
//             query: buildInput(),
//             endpoint: {
//                 json: baseSchema,
//                 param: idFieldsSchema,
//             },
//         };
//     });

export const tagToTransactionSchemas = createFeatureSchemas(tagToTransactionTableConfig)
    .addSchema('assign', ({ schemas }) => {
        const tagsIdsSchema = z.array(schemas.base.pick({ tagId: true }).shape.tagId);

        const schema = schemas.base.omit({ tagId: true }).extend({
            tagIds: tagsIdsSchema,
            transactionId: schemas.base.shape.transactionId,
            userId: z.string(),
        });

        return {
            service: schema,
            query: schema,
            endpoint: {
                param: schema.pick({ transactionId: true }),
                json: schema.pick({ tagIds: true }),
            },
        };
    })
    .addSchema('remove', ({ schemas }) => {
        return {
            service: schemas.base,
            query: schemas.base,
            endpoint: {
                param: schemas.id,
            },
        };
    })
    .build();

// ====================
// Types
// ====================
export { type TTag } from '@/features/tag/server/db/queries';
