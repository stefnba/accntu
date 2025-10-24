import { transactionImport } from '@/features/transaction-import/server/db/tables';
import { createFeatureSchemas, InferSchemas } from '@/lib/schemas';
import { z } from 'zod';

export const { schemas: transactionImportSchemas } = createFeatureSchemas
    .registerTable(transactionImport)
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
    /**
     * Create a transaction import
     */
    .addCore('create', ({ baseSchema, buildInput }) => {
        const input = buildInput({ data: baseSchema });
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
    .addCore('getMany', ({ buildInput, baseSchema }) => {
        const filtersSchema = z.object({
            status: baseSchema.shape.status.optional(),
            connectedBankAccountId: baseSchema.shape.connectedBankAccountId.optional(),
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
    /**
     * Get a transaction import by id
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
     * Update a transaction import by id
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
     * Remove a transaction import by id
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
    .addCustom('activate', ({ idFieldsSchema, userIdField }) => {
        const input = z.object({
            ids: idFieldsSchema,
            userId: userIdField,
        });

        return {
            service: input,
            query: input,
            endpoint: {
                param: idFieldsSchema,
            },
        };
    })
    .addCustom('updateCounts', ({ idFieldsSchema, userIdField }) => {
        const input = z.object({
            ids: idFieldsSchema,
            userId: userIdField,
        });

        return {
            service: input,
            query: input,
            endpoint: {
                param: idFieldsSchema,
            },
        };
    });

export type TTransactionImportSchemas = InferSchemas<typeof transactionImportSchemas>;

export type { TTransactionImport } from '@/features/transaction-import/server/db/queries/import-record';
