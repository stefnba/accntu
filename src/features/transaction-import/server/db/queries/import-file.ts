import { TTransactionImportFileQuerySchemas } from '@/features/transaction-import/schemas/import-file';

import {
    TQueryDeleteUserRecord,
    TQueryInsertUserRecord,
    TQuerySelectUserRecordById,
    TQuerySelectUserRecords,
    TQueryUpdateUserRecord,
} from '@/lib/schemas';
import { db, dbTable } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';
import { and, eq } from 'drizzle-orm';

/**
 * Get all transaction import files by import ID
 * @param importId - The import ID
 * @param userId - The user ID
 * @returns The transaction import files
 */
const getAll = async ({ filters, userId }: TQuerySelectUserRecords<{ importId: string }>) =>
    withDbQuery({
        operation: 'get transaction import files by import ID',
        queryFn: async () => {
            const whereClause = [
                eq(transactionImportFile.isActive, true),
                eq(transactionImportFile.userId, userId),
            ];

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
            });
        },
    });

/**
 * Get a transaction import file by ID
 * @param id - The ID of the transaction import file
 * @returns The transaction import file
 */
const getById = async ({ id, userId }: TQuerySelectUserRecordById) =>
    withDbQuery({
        operation: 'get transaction import file by ID',
        queryFn: async () => {
            const result = await db.query.transactionImportFile.findFirst({
                where: and(
                    eq(transactionImportFile.id, id),
                    eq(transactionImportFile.isActive, true),
                    eq(transactionImportFile.userId, userId)
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
    });

/**
 * Create a transaction import file
 * @param data - The data to create
 * @param userId - The ID of the user
 * @returns The created transaction import file
 */
const create = async ({
    data,
    userId,
}: TQueryInsertUserRecord<TTransactionImportFileQuerySchemas['insert']>): Promise<
    TTransactionImportFileQuerySchemas['select']
> =>
    withDbQuery({
        operation: 'create transaction import file',
        queryFn: async () => {
            const [result] = await db
                .insert(dbTable.transactionImportFile)
                .values({ ...data, userId })
                .returning();
            return result;
        },
    });

/**
 * Delete a transaction import file
 * @param id - The ID of the transaction import file
 * @param userId - The ID of the user
 * @returns The deleted transaction import file
 */
const remove = async ({ id, userId }: TQueryDeleteUserRecord): Promise<void> =>
    withDbQuery({
        operation: 'delete transaction import file',
        queryFn: async () => {
            await db
                .update(dbTable.transactionImportFile)
                .set({ isActive: false, updatedAt: new Date() })
                .where(
                    and(eq(dbTable.transactionImportFile.id, id), eq(dbTable.transactionImportFile.userId, userId))
                );
        },
    });

/**
 * Delete all transaction import files
 * @param userId - The ID of the user
 * @returns The deleted transaction import files
 */
const removeAll = async ({ userId }: TQuerySelectUserRecords): Promise<void> =>
    withDbQuery({
        operation: 'delete all transaction import files',
        queryFn: async () => {
            await db
                .update(dbTable.transactionImportFile)
                .set({ isActive: false, updatedAt: new Date() })
                .where(eq(dbTable.transactionImportFile.userId, userId));
        },
    });

/**
 * Update the status of a transaction import file
 * @param id - The ID of the transaction import file
 * @param userId - The ID of the user
 * @param data - The data to update
 * @returns The updated transaction import file
 */
const update = async ({
    id,
    userId,
    data,
}: TQueryUpdateUserRecord<TTransactionImportFileQuerySchemas['update']>): Promise<
    TTransactionImportFileQuerySchemas['select'] | null
> =>
    withDbQuery({
        operation: 'update transaction import file status',
        queryFn: async () => {
            const [updated] = await db
                .update(dbTable.transactionImportFile)
                .set({ ...data, updatedAt: new Date() })
                .where(
                    and(eq(dbTable.transactionImportFile.id, id), eq(dbTable.transactionImportFile.userId, userId))
                )
                .returning();
            return updated || null;
        },
    });

export const importFileQueries = {
    getAll,
    getById,
    create,
    remove,
    removeAll,
    update,
};
