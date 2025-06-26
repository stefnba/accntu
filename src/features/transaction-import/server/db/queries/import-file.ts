import { TTransactionImportFileQuerySchemas } from '@/features/transaction-import/schemas/import-file';
import { transactionImportFile } from '@/features/transaction-import/server/db/schemas';
import {
    TQueryDeleteRecord,
    TQueryInsertRecord,
    TQuerySelectRecordByIdAndUser,
    TQuerySelectRecordsFromUser,
    TQueryUpdateRecord,
} from '@/lib/schemas';
import { db } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';
import { and, eq } from 'drizzle-orm';

/**
 * Get all transaction import files by import ID
 * @param importId - The import ID
 * @param userId - The user ID
 * @returns The transaction import files
 */
export const getAll = async ({
    filters,
    userId,
}: TQuerySelectRecordsFromUser<{ importId: string }>) =>
    withDbQuery({
        operation: 'get transaction import files by import ID',
        queryFn: async () => {
            return await db.query.transactionImportFile.findMany({
                where: and(
                    filters ? eq(transactionImportFile.importId, filters.importId) : undefined,
                    eq(transactionImportFile.isActive, true)
                ),
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
export const getById = async ({ id, userId }: TQuerySelectRecordByIdAndUser) =>
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
                    import: true,
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
export const create = async ({
    data,
    userId,
}: TQueryInsertRecord<TTransactionImportFileQuerySchemas['insert']>): Promise<
    TTransactionImportFileQuerySchemas['select']
> =>
    withDbQuery({
        operation: 'create transaction import file',
        queryFn: async () => {
            const [result] = await db
                .insert(transactionImportFile)
                .values({ ...data, userId })
                .returning();
            return result;
        },
    });

export const remove = async ({ id, userId }: TQueryDeleteRecord): Promise<void> =>
    withDbQuery({
        operation: 'delete transaction import file',
        queryFn: async () => {
            await db
                .update(transactionImportFile)
                .set({ isActive: false, updatedAt: new Date() })
                .where(
                    and(eq(transactionImportFile.id, id), eq(transactionImportFile.userId, userId))
                );
        },
    });

/**
 * Update the status of a transaction import file
 * @param id - The ID of the transaction import file
 * @param userId - The ID of the user
 * @param data - The data to update
 * @returns The updated transaction import file
 */
export const update = async ({
    id,
    userId,
    data,
}: TQueryUpdateRecord<TTransactionImportFileQuerySchemas['update']>): Promise<
    TTransactionImportFileQuerySchemas['select'] | null
> =>
    withDbQuery({
        operation: 'update transaction import file status',
        queryFn: async () => {
            const [updated] = await db
                .update(transactionImportFile)
                .set({ ...data, updatedAt: new Date() })
                .where(
                    and(eq(transactionImportFile.id, id), eq(transactionImportFile.userId, userId))
                )
                .returning();
            return updated || null;
        },
    });
