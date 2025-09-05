import { globalBank } from '@/features/bank/server/db/tables';
import { createFeatureSchemas, InferSchemas } from '@/lib/schemas';
import z from 'zod';

export const { schemas: globalBankSchemas } = createFeatureSchemas
    .registerTable(globalBank)
    .omit({
        createdAt: true,
        updatedAt: true,
        isActive: true,
        id: true,
    })
    .idFields({
        id: true,
    })
    /**
     * Create a global bank
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
     * Get many global banks
     */
    .addCore('getMany', ({ buildServiceInput, baseSchema }) => {
        const filtersSchema = z.object({
            query: z.string().optional(),
            country: z.string().length(2).optional(),
            integrationTypes: baseSchema.shape.integrationTypes.optional(),
        });

        const paginationSchema = z.object({
            page: z.number().int().default(1),
            pageSize: z.number().int().default(50),
        });

        const params = buildServiceInput({
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
     * Update a global bank by ID
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
     * Remove a global bank by ID
     */
    .addCore('removeById', ({ buildServiceInput, idFieldsSchema }) => {
        return {
            service: buildServiceInput(),
            query: buildServiceInput(),
            endpoint: {
                param: idFieldsSchema,
            },
        };
    });

export type TGlobalBankSchemas = InferSchemas<typeof globalBankSchemas>;

export type { TGlobalBank } from '@/features/bank/server/db/queries/global-bank';
