import { createFeatureSchemas, InferSchemas } from '@/lib/schemas';
import { dbTable } from '@/server/db';
import { z } from 'zod';

const colorSchema = z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color format');

export const { schemas: labelSchemas } = createFeatureSchemas
    .registerTable(dbTable.label)
    .omit({
        createdAt: true,
        updatedAt: true,
        isActive: true,
        id: true,
        userId: true,
        index: true,
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
     * Create a label
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
     * Get many labels
     */
    .addCore('getMany', ({ buildServiceInput }) => {
        const paginationSchema = z.object({
            page: z.number().int().default(1),
            pageSize: z.number().int().default(20),
        });

        const filtersSchema = z.object({
            search: z.string().optional(),
            parentId: z.string().optional(),
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
     * Get a label by id
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
     * Update a label by id
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
     * Remove a label by id
     */
    .addCore('removeById', ({ buildServiceInput, idFieldsSchema }) => {
        return {
            service: buildServiceInput(),
            query: buildServiceInput(),
            endpoint: {
                param: idFieldsSchema,
            },
        };
    })
    /**
     * Get flattened labels with hierarchy info
     */
    .addCustom('getFlattened', () => {
        const filtersSchema = z.object({
            search: z.string().optional(),
        });

        const schema = z.object({
            filters: filtersSchema,
            userId: z.string(),
        });

        return {
            service: schema,
            query: schema,
            endpoint: {
                query: filtersSchema,
            },
        };
    })
    /**
     * Reorder labels
     */
    .addCustom('reorder', () => {
        const itemsSchema = z.array(
            z.object({
                id: z.string(),
                parentId: z.string().nullable(),
                index: z.number().int(),
            })
        );

        const schema = z.object({
            items: itemsSchema,
            userId: z.string(),
        });

        return {
            service: schema,
            query: schema,
            endpoint: {
                json: z.object({ items: itemsSchema }),
            },
        };
    });

// ====================
// Types
// ====================
export type TLabelSchemas = InferSchemas<typeof labelSchemas>;

export { type TLabel } from '@/features/label/server/db/queries';
