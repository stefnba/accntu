import { createFeatureSchemas, InferSchemas } from '@/lib/schemas';
import { dbTable } from '@/server/db';
import { z } from 'zod';

export const { schemas: transactionImportSchemas } = createFeatureSchemas
    .registerTable(dbTable.transactionImport)
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
    /**
     * Create a transaction import
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
     * Get many transaction imports
     */
    .addCore('getMany', ({ buildServiceInput, baseSchema }) => {
        const filtersSchema = z.object({
            status: baseSchema.shape.status.optional(),
            connectedBankAccountId: baseSchema.shape.connectedBankAccountId.optional(),
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
    /**
     * Get a transaction import by id
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
     * Update a transaction import by id
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
     * Remove a transaction import by id
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

export type TTransactionImportSchemas = InferSchemas<typeof transactionImportSchemas>;

export type { TTransactionImport } from '@/features/transaction-import/server/db/queries/import-record';
