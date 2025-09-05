import { TTransactionImportQuerySchemas } from '@/features/transaction-import/schemas';
import {
    transactionImport,
    transactionImportFile,
} from '@/server/db';
import {
    TQueryDeleteUserRecord,
    TQueryInsertUserRecord,
    TQuerySelectUserRecordById,
    TQuerySelectUserRecords,
    TQueryUpdateUserRecord,
} from '@/lib/schemas';
import { db, dbTable } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';
import { and, eq, lt } from 'drizzle-orm';

/**
 * Get all transaction imports for a user
 * @param userId - The ID of the user
 * @returns The transaction imports
 */
const getAll = async ({ userId }: TQuerySelectUserRecords) =>
    withDbQuery({
        operation: 'get transaction imports by user ID',
        queryFn: async () => {
            return await db.query.transactionImport.findMany({
                where: and(
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
                orderBy: (imports, { desc }) => [desc(imports.createdAt)],
            });
        },
    });

/**
 * Get a transaction import by ID
 * @param id - The ID of the transaction import
 * @param userId - The ID of the user
 * @returns The transaction import
 */
const getById = async ({ id, userId }: TQuerySelectUserRecordById) =>
    withDbQuery({
        operation: 'get transaction import by ID',
        queryFn: async () => {
            const result = await db.query.transactionImport.findFirst({
                where: and(
                    eq(transactionImport.id, id),
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
    });

/**
 * Create a transaction import
 * @param data - The data to create
 * @param userId - The ID of the user
 * @returns The created transaction import
 */
const create = async ({
    data,
    userId,
}: TQueryInsertUserRecord<TTransactionImportQuerySchemas['insert']>) =>
    withDbQuery({
        operation: 'create transaction import',
        queryFn: async () => {
            const [result] = await db
                .insert(transactionImport)
                .values({
                    userId,
                    ...data,
                })
                .returning();
            return result;
        },
    });

/**
 * Update a transaction import
 * @param id - The ID of the transaction import
 * @param data - The data to update
 * @returns The updated transaction import
 */
const update = async ({
    id,
    data,
    userId,
}: TQueryUpdateUserRecord<TTransactionImportQuerySchemas['update']>) =>
    withDbQuery({
        operation: 'update transaction import',
        queryFn: async () => {
            const [updated] = await db
                .update(transactionImport)
                .set({ ...data, updatedAt: new Date() })
                .where(and(eq(transactionImport.id, id), eq(transactionImport.userId, userId)))
                .returning();
            return updated || null;
        },
    });

/**
 * Delete a transaction import
 * @param id - The ID of the transaction import
 * @returns The number of deleted transaction imports
 */
const remove = async ({ id, userId }: TQueryDeleteUserRecord): Promise<void> =>
    withDbQuery({
        operation: 'delete transaction import',
        queryFn: async () => {
            await db
                .update(transactionImport)
                .set({ isActive: false, updatedAt: new Date() })
                .where(and(eq(transactionImport.id, id), eq(transactionImport.userId, userId)));
        },
    });

/**
 * Cleanup old draft imports
 * @param cutoffDate - The date to cutoff
 * @returns The number of deleted transaction imports
 */
const cleanupDraftImports = async ({ cutoffDate }: { cutoffDate: Date }): Promise<number> =>
    withDbQuery({
        operation: 'cleanup old draft imports',
        queryFn: async () => {
            const result = await db
                .update(transactionImport)
                .set({ isActive: false, updatedAt: new Date() })
                .where(
                    and(
                        eq(transactionImport.status, 'draft'),
                        lt(transactionImport.createdAt, cutoffDate),
                        eq(transactionImport.isActive, true)
                    )
                )
                .returning({ id: transactionImport.id });

            return result.length;
        },
    });

export const importRecordQueries = {
    getAll,
    getById,
    create,
    update,
    remove,
    cleanupDraftImports,
};
