import { createFeatureSchemas, InferSchemas } from '@/lib/schemas';
import { dbTable } from '@/server/db';
import { z } from 'zod';

export const { schemas: transactionImportFileSchemas } = createFeatureSchemas
    .registerTable(dbTable.transactionImportFile)
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
     * Create a transaction import file
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
     * Get many transaction import files
     */
    .addCore('getMany', ({ buildServiceInput, baseSchema }) => {
        const filtersSchema = z.object({
            status: baseSchema.shape.status.optional(),
            importId: baseSchema.shape.importId.optional(),
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
     * Get a transaction import file by id
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
     * Update a transaction import file by id
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
     * Remove a transaction import file by id
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

export type TTransactionImportFileSchemas = InferSchemas<typeof transactionImportFileSchemas>;

export type { TTransactionImportFile } from '@/features/transaction-import/server/db/queries/import-file';
