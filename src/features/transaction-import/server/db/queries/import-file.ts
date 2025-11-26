import { transactionImportFileSchemas } from '@/features/transaction-import/schemas/import-file';
import { transactionImportFileTableConfig } from '@/features/transaction-import/server/db/config';
import { transactionImportFile } from '@/features/transaction-import/server/db/tables';
import { db } from '@/server/db';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';
import { and, eq } from 'drizzle-orm';

export const transactionImportFileQueries = createFeatureQueries(
    'transaction-import-file',
    transactionImportFileTableConfig
)
    .registerSchema(transactionImportFileSchemas)
    .registerAllStandard({
        defaultFilters: {
            isActive: true,
        },
        getMany: {
            filters: (filters, f) => [
                f.eq('status', filters?.status),
                f.eq('importId', filters?.importId),
            ],
        },
    })
    /**
     * Get many transaction import files
     */
    .addQuery('getMany', {
        operation: 'get all transaction import files by user id',
        fn: async ({ userId, filters, pagination }) => {
            const whereClause = [
                eq(transactionImportFile.userId, userId),
                eq(transactionImportFile.isActive, true),
            ];

            if (filters?.status) {
                whereClause.push(eq(transactionImportFile.status, filters.status));
            }

            if (filters?.importId) {
                whereClause.push(eq(transactionImportFile.importId, filters.importId));
            }

            const where = and(...whereClause);

            return await db.query.transactionImportFile.findMany({
                where,
                with: {
                    import: true,
                },
                orderBy: (files, { asc }) => [asc(files.createdAt)],
                limit: pagination?.pageSize || 20,
                offset: ((pagination?.page || 1) - 1) * (pagination?.pageSize || 20),
            });
        },
    })
    /**
     * Get a transaction import file by id
     */
    .addQuery('getById', {
        operation: 'get transaction import file by ID',
        fn: async ({ ids, userId }) => {
            const result = await db.query.transactionImportFile.findFirst({
                where: and(
                    eq(transactionImportFile.id, ids.id),
                    eq(transactionImportFile.userId, userId),
                    eq(transactionImportFile.isActive, true)
                ),
                with: {
                    import: {
                        with: {
                            connectedBankAccount: {
                                with: {
                                    globalBankAccount: true,
                                },
                            },
                        },
                    },
                },
            });
            return result || null;
        },
    })
    .build();

export type TTransactionImportFile = InferFeatureType<typeof transactionImportFileQueries>;
