import { FeatureSchema, InferSchemas } from '@/lib/schemas';
import { dbTable } from '@/server/db';
import { z } from 'zod';

export type TLabelSchemas = InferSchemas<typeof labelSchema>;

export const labelSchema = FeatureSchema.fromTable({ table: dbTable.label }).forOperations(({ base }) => {
    return {
        create: {
            database: base,
            service: base,
        },
        updateById: {
            service: base,
        },
        removeById: {
            service: base,
        },
        getById: {
            service: base,
        },
        getFlattened: {
            service: base.extend({
                globalIndex: z.number().int(),
                countChildren: z.number().int(),
                hasChildren: z.boolean(),
                depth: z.number().int(),
                // Transform string dates from raw SQL to Date objects
                createdAt: z.string().transform((val) => new Date(val)),
                updatedAt: z.string().transform((val) => new Date(val)),
            }),
        },
        getMany: {
            service: FeatureSchema.default.getMany(
                z.object({
                    search: z.string().optional(),
                    parentId: z.string().optional(),
                })
            ),
        },
        reorder: FeatureSchema.helpers.operation(() => {
            const shared = z.object({
                items: z.array(
                    base
                        .pick({
                            id: true,
                            index: true,
                            parentId: true,
                        })
                        .required()
                ),
            });
            return {
                database: shared,
                service: shared,
            };
        }),
    };
});
