import { labelTableConfig } from '@/features/label/server/db/config';
import { createFeatureSchemas } from '@/lib/schema';
import { z } from 'zod';

export const labelSchemas = createFeatureSchemas(labelTableConfig)
    .registerAllStandard()
    /**
     * Reorder labels
     */
    .addSchema('reorder', () => {
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
    })
    /**
     * Get the maximum index for a parent label
     */
    .addSchema('getMaxIndex', () => {
        const schema = z.object({
            parentId: z.string().optional().nullable(),
            userId: z.string(),
        });
        return {
            service: schema,
            query: schema,
        };
    })
    /**
     * Get all labels for a user in flattened order with global index based on hierarchical structure
     */
    .addSchema('getFlattened', ({ helpers }) => {
        const schema = z.object({
            filters: helpers.buildFiltersSchema(),
            userId: z.string(),
        });
        return {
            endpoint: {
                query: schema.omit({ userId: true }),
            },
            service: schema,
            query: schema,
        };
    })
    .addSchema('create', ({ schemas }) => {
        const publicSchema = schemas.inputData.insert;

        return {
            endpoint: {
                json: publicSchema,
            },
            service: publicSchema,
            // in service, we add index to the data
            // query uses the schema with index
            query: schemas.input.create.extend({
                data: publicSchema.extend({
                    index: z.number().int(),
                }),
            }),
            form: publicSchema,
        };
    })
    .build();
