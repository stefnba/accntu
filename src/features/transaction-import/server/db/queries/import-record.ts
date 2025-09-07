import { transactionImportSchemas } from '@/features/transaction-import/schemas/import-record';
import { db, dbTable } from '@/server/db';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';
import { and, eq, lt } from 'drizzle-orm';

export const transactionImportQueries = createFeatureQueries
    .registerSchema(transactionImportSchemas)
    /**
     * Get many transaction imports
     */
    .addQuery('getMany', {
        operation: 'get all transaction imports by user id',
        fn: async ({ userId, filters, pagination }) => {
            const whereClause = [
                eq(dbTable.transactionImport.userId, userId),
                eq(dbTable.transactionImport.isActive, true),
            ];

            if (filters?.status) {
                whereClause.push(eq(dbTable.transactionImport.status, filters.status));
            }

            if (filters?.connectedBankAccountId) {
                whereClause.push(eq(dbTable.transactionImport.connectedBankAccountId, filters.connectedBankAccountId));
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
                        where: eq(dbTable.transactionImportFile.isActive, true),
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
                    eq(dbTable.transactionImport.id, ids.id),
                    eq(dbTable.transactionImport.userId, userId),
                    eq(dbTable.transactionImport.isActive, true)
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
                        where: eq(dbTable.transactionImportFile.isActive, true),
                        orderBy: (files, { asc }) => [asc(files.createdAt)],
                    },
                },
            });
            return result || null;
        },
    })
    /**
     * Create a transaction import
     */
    .addQuery('create', {
        operation: 'create transaction import',
        fn: async ({ data, userId }) => {
            const result = await db
                .insert(dbTable.transactionImport)
                .values({ ...data, userId })
                .returning();
            return result[0];
        },
    })
    /**
     * Update a transaction import by id
     */
    .addQuery('updateById', {
        operation: 'update transaction import',
        fn: async ({ ids, data, userId }) => {
            const result = await db
                .update(dbTable.transactionImport)
                .set({ ...data, updatedAt: new Date() })
                .where(
                    and(
                        eq(dbTable.transactionImport.id, ids.id),
                        eq(dbTable.transactionImport.userId, userId)
                    )
                )
                .returning();
            return result[0];
        },
    })
    /**
     * Remove a transaction import by id
     */
    .addQuery('removeById', {
        operation: 'remove transaction import',
        fn: async ({ ids, userId }) => {
            return await db
                .update(dbTable.transactionImport)
                .set({ isActive: false, updatedAt: new Date() })
                .where(
                    and(
                        eq(dbTable.transactionImport.id, ids.id),
                        eq(dbTable.transactionImport.userId, userId)
                    )
                );
        },
    })

export type TTransactionImport = InferFeatureType<typeof transactionImportQueries>;