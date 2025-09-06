import { dbTable } from '@/server/db';

import { createFeatureSchemas, InferSchemas } from '@/lib/schemas';
import { z } from 'zod';

export const { schemas: connectedBankAccountSchemas } = createFeatureSchemas
    .registerTable(dbTable.connectedBankAccount)
    .omit({
        createdAt: true,
        updatedAt: true,
        isActive: true,
        id: true,
        userId: true,
    })
    .userField('userId')
    .idFields({
        id: true,
    })
    .addCore('create', ({ baseSchema }) => {
        const input = z.object({ data: baseSchema, userId: z.string() });
        return {
            service: input,
            query: input,
            endpoint: {
                json: baseSchema,
            },
        };
    })
    .addCore('getMany', ({ buildServiceInput }) => {
        const filtersSchema = z.object({
            connectedBankId: z.string().optional(),
            type: z.enum(['checking', 'savings', 'credit_card', 'investment']).optional(),
            isSharedAccount: z.boolean().optional(),
        });

        const paginationSchema = z.object({
            page: z.number().int().default(1),
            pageSize: z.number().int().default(20),
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
    .addCore('getById', ({ buildServiceInput, idFieldsSchema }) => {
        return {
            service: buildServiceInput(),
            query: buildServiceInput(),
            endpoint: {
                param: idFieldsSchema,
            },
        };
    })
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
    .addCore('removeById', ({ buildServiceInput, idFieldsSchema }) => {
        return {
            service: buildServiceInput(),
            query: buildServiceInput(),
            endpoint: {
                param: idFieldsSchema,
            },
        };
    });

export type TConnectedBankAccountSchemas = InferSchemas<typeof connectedBankAccountSchemas>;
