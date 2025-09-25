import { globalBank } from '@/features/bank/server/db/tables';
import { createFeatureSchemas, InferSchemas } from '@/lib/schemas';
import { z } from 'zod';

export const { schemas: globalBankSchemas } = createFeatureSchemas
    .registerTable(globalBank)
    .omit({
        createdAt: true,
        updatedAt: true,
        isActive: true,
        id: true,
    })
    .setIdFields({
        id: true,
    })
    /**
     * Create a global bank
     */
    .addCore('create', ({ baseSchema, buildInput }) => {
        const input = buildInput({ data: baseSchema });
        return {
            service: input,
            query: input,
            form: baseSchema,
            endpoint: {
                json: baseSchema,
            },
        };
    })
    /**
     * Get many global banks
     */
    .addCore('getMany', ({ buildInput, baseSchema }) => {
        const filtersSchema = z.object({
            query: z.string().optional(),
            country: z.string().length(2).optional(),
            integrationTypes: baseSchema.shape.integrationTypes.optional(),
        });

        const paginationSchema = z.object({
            page: z.coerce.number().int().default(1),
            pageSize: z.coerce.number().int().default(50),
        });

        const params = buildInput({
            pagination: paginationSchema,
            filters: filtersSchema,
        });

        return {
            service: params,
            query: params,
            endpoint: {
                query: paginationSchema.extend(filtersSchema.shape),
            },
        };
    })
    /**
     * Get a global bank by ID
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
     * Update a global bank by ID
     */
    .addCore('updateById', ({ baseSchema, buildInput, idFieldsSchema }) => {
        const withActive = baseSchema.extend({
            isActive: z.boolean().optional(),
        });

        return {
            service: buildInput({ data: withActive.partial() }),
            query: buildInput({ data: withActive.partial() }),
            endpoint: {
                json: withActive.partial(),
                param: idFieldsSchema,
            },
            form: withActive.partial(),
        };
    })
    /**
     * Remove a global bank by ID
     */
    .addCore('removeById', ({ buildInput, idFieldsSchema }) => {
        return {
            service: buildInput(),
            query: buildInput(),
            endpoint: {
                param: idFieldsSchema,
            },
        };
    });

export type TGlobalBankSchemas = InferSchemas<typeof globalBankSchemas>;

export type { TGlobalBank } from '@/features/bank/server/db/queries/global-bank';
