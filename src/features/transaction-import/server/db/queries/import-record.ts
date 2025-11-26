import { transactionImportSchemas } from '@/features/transaction-import/schemas/import-record';
import { transactionImportTableConfig } from '@/features/transaction-import/server/db/config';
import {
    transactionImport,
    transactionImportFile,
} from '@/features/transaction-import/server/db/tables';
import { db } from '@/server/db';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';
import { and, eq } from 'drizzle-orm';

export const transactionImportQueries = createFeatureQueries(
    'transaction-import',
    transactionImportTableConfig
)
    .registerSchema(transactionImportSchemas)
    .registerAllStandard({
        defaultFilters: {
            isActive: true,
        },
        getMany: {
            filters: (filters, f) => [
                f.eq('status', filters?.status),
                f.eq('connectedBankAccountId', filters?.connectedBankAccountId),
            ],
        },
    })
    /**
     * Get many transaction imports
     */
    .addQuery('getMany', {
        operation: 'get all transaction imports by user id',
        fn: async ({ userId, filters, pagination }) => {
            const whereClause = [
                eq(transactionImport.userId, userId),
                eq(transactionImport.isActive, true),
            ];

            if (filters?.status) {
                whereClause.push(eq(transactionImport.status, filters.status));
            }

            if (filters?.connectedBankAccountId) {
                whereClause.push(
                    eq(transactionImport.connectedBankAccountId, filters.connectedBankAccountId)
                );
            }

            const where = and(...whereClause);

            return await db.query.transactionImport.findMany({
                where,
                with: {
                    connectedBankAccount: {
                        with: {
                            connectedBank: {
                                with: {
                                    globalBank: true,
                                },
                            },
                        },
                    },
                    files: {
                        where: eq(transactionImportFile.isActive, true),
                        orderBy: (files, { asc }) => [asc(files.createdAt)],
                    },
                },
                orderBy: (imports, { desc }) => [desc(imports.createdAt)],
                limit: pagination?.pageSize || 20,
                offset: ((pagination?.page || 1) - 1) * (pagination?.pageSize || 20),
            });
        },
    })
    /**
     * Get a transaction import by id
     */
    .addQuery('getById', {
        operation: 'get transaction import by ID',
        fn: async ({ ids, userId }) => {
            const result = await db.query.transactionImport.findFirst({
                where: and(
                    eq(transactionImport.id, ids.id),
                    eq(transactionImport.userId, userId),
                    eq(transactionImport.isActive, true)
                ),
                with: {
                    connectedBankAccount: {
                        with: {
                            connectedBank: {
                                with: {
                                    globalBank: true,
                                },
                            },
                        },
                    },
                    files: {
                        where: eq(transactionImportFile.isActive, true),
                        orderBy: (files, { asc }) => [asc(files.createdAt)],
                    },
                },
            });
            return result || null;
        },
    })
    .build();

export type TTransactionImport = InferFeatureType<typeof transactionImportQueries>;
