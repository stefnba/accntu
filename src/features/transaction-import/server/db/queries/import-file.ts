import { transactionImportFileSchemas } from '@/features/transaction-import/schemas/import-file';
import { transactionImportFile } from '@/features/transaction-import/server/db/tables';
import { db } from '@/server/db';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';
import { and, eq } from 'drizzle-orm';

export const transactionImportFileQueries = createFeatureQueries
    .registerSchema(transactionImportFileSchemas)
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
    /**
     * Create a transaction import file
     */
    .addQuery('create', {
        operation: 'create transaction import file',
        fn: async ({ data, userId }) => {
            const result = await db
                .insert(transactionImportFile)
                .values({ ...data, userId })
                .returning();
            return result[0];
        },
    })
    /**
     * Update a transaction import file by id
     */
    .addQuery('updateById', {
        operation: 'update transaction import file',
        fn: async ({ ids, data, userId }) => {
            const result = await db
                .update(transactionImportFile)
                .set({ ...data, updatedAt: new Date() })
                .where(
                    and(
                        eq(transactionImportFile.id, ids.id),
                        eq(transactionImportFile.userId, userId)
                    )
                )
                .returning();
            return result[0];
        },
    })
    /**
     * Remove a transaction import file by id
     */
    .addQuery('removeById', {
        operation: 'remove transaction import file',
        fn: async ({ ids, userId }) => {
            return await db
                .update(transactionImportFile)
                .set({ isActive: false, updatedAt: new Date() })
                .where(
                    and(
                        eq(transactionImportFile.id, ids.id),
                        eq(transactionImportFile.userId, userId)
                    )
                );
        },
    });

export type TTransactionImportFile = InferFeatureType<typeof transactionImportFileQueries>;
