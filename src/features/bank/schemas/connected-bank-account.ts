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
    .setUserIdField('userId')
    .setIdFields({
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
    .addCore('getMany', ({ buildInput }) => {
        const filtersSchema = z.object({
            connectedBankId: z.string().optional(),
            type: z.enum(['checking', 'savings', 'credit_card', 'investment']).optional(),
            isSharedAccount: z.boolean().optional(),
        });

        const paginationSchema = z.object({
            page: z.number().int().default(1),
            pageSize: z.number().int().default(20),
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
    .addCore('getById', ({ buildInput, idFieldsSchema }) => {
        return {
            service: buildInput(),
            query: buildInput(),
            endpoint: {
                param: idFieldsSchema,
            },
        };
    })
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
    .addCore('removeById', ({ buildInput, idFieldsSchema }) => {
        return {
            service: buildInput(),
            query: buildInput(),
            endpoint: {
                param: idFieldsSchema,
            },
        };
    });

export type TConnectedBankAccountSchemas = InferSchemas<typeof connectedBankAccountSchemas>;

export type { TConnectedBankAccount } from '@/features/bank/server/db/queries/connected-bank-account';
