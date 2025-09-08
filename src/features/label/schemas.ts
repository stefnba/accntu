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
    .setUserIdField('userId')
    .setIdFields({
        id: true,
    })
    /**
     * Create a label
     */
    .addCore('create', ({ baseSchema, buildInput }) => {
        const input = buildInput({ data: baseSchema });
        return {
            service: input,
            form: baseSchema,
            query: input,
            endpoint: {
                json: baseSchema,
            },
        };
    })
    /**
     * Get many labels
     */
    .addCore('getMany', ({ buildInput }) => {
        const paginationSchema = z.object({
            page: z.coerce.number().int().default(1),
            pageSize: z.coerce.number().int().default(20),
        });

        const filtersSchema = z.object({
            search: z.string().optional(),
            parentId: z.string().optional(),
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
     * Get a label by id
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
     * Update a label by id
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
     * Remove a label by id
     */
    .addCore('removeById', ({ buildInput, idFieldsSchema }) => {
        return {
            service: buildInput(),
            query: buildInput(),
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
