import { TTransactionImportServiceSchemas } from '@/features/transaction-import/schemas/import-record';
import {
    importFileQueries,
    importRecordQueries,
} from '@/features/transaction-import/server/db/queries';
import {
    TQueryDeleteUserRecord,
    TQueryInsertUserRecord,
    TQuerySelectUserRecordById,
    TQuerySelectUserRecords,
    TQueryUpdateUserRecord,
} from '@/lib/schemas';

/**
 * Gets all import records for a user
 * @param userId - The user ID
 * @returns Array of import records with related data
 */
const getAll = async ({ userId }: TQuerySelectUserRecords) => {
    return await importRecordQueries.getAll({ userId });
};

/**
 * Gets a specific import record by ID
 * @param id - The import record ID
 * @param userId - The user ID for ownership verification
 * @returns Import record with related data
 * @throws Error if not found or access denied
 */
const getImportById = async ({ id, userId }: TQuerySelectUserRecordById) => {
    const result = await importRecordQueries.getById({ id, userId });
    if (!result) {
        throw new Error('Transaction import not found');
    }
    return result;
};

/**
 * Creates a new transaction import record with draft status
 * @param userId - The user ID
 * @param connectedBankAccountId - The connected bank account ID
 * @returns Created import record
 */
export const create = async ({
    userId,
    data,
}: TQueryInsertUserRecord<TTransactionImportServiceSchemas['create']>) => {
    const importRecord = await importRecordQueries.create({
        data,
        userId,
    });

    return importRecord;
};

/**
 * Updates an import record with new data
 * @param id - The import record ID
 * @param userId - The user ID for ownership verification
 * @param data - Update data
 * @returns Updated import record
 * @throws Error if not found or access denied
 */
export const update = async ({
    id,
    userId,
    data,
}: TQueryUpdateUserRecord<TTransactionImportServiceSchemas['update']>) => {
    const updated = await importRecordQueries.update({ id, userId, data });
    if (!updated) {
        throw new Error('Failed to update transaction import');
    }

    return updated;
};

/**
 * Activates a draft import by changing status to pending
 * @param id - The import record ID
 * @param userId - The user ID for ownership verification
 * @returns Updated import record
 * @throws Error if not found, access denied, or not in draft status
 */
const activate = async ({ id, userId }: { id: string; userId: string }) => {
    // Verify ownership and that it's a draft
    const existing = await importRecordQueries.getById({ id, userId });
    if (!existing) {
        throw new Error('Transaction import not found');
    }

    if (existing.status !== 'draft') {
        throw new Error('Can only activate draft imports');
    }

    const updated = await importRecordQueries.update({
        id,
        data: { status: 'pending' },
        userId,
    });

    if (!updated) {
        throw new Error('Failed to activate transaction import');
    }

    return updated;
};

/**
 * Deletes an import record and all associated files
 * @param importId - The import record ID
 * @param userId - The user ID for ownership verification
 * @returns Success result
 * @throws Error if not found or access denied
 */
const remove = async ({ id, userId }: TQueryDeleteUserRecord) => {
    // Delete all files first
    await importFileQueries.removeAll({ userId });

    // Delete the import record
    await importRecordQueries.remove({ id, userId });

    return { success: true };
};

/**
 * Cleans up old draft imports older than specified hours
 * @param olderThanHours - Hours threshold (default: 24)
 * @returns Number of imports cleaned up
 */
const cleanupOldDraftImports = async (olderThanHours: number = 24) => {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - olderThanHours);

    return await importRecordQueries.cleanupDraftImports({ cutoffDate });
};

/**
 * Updates the import record counts based on the associated files
 * @param id - The import record ID
 * @param userId - The user ID for ownership verification
 * @returns The updated import record
 */
const updateImportCounts = async ({ id, userId }: TQuerySelectUserRecordById) => {
    const files = await importFileQueries.getAll({ filters: { importId: id }, userId });

    const fileCount = files.length;
    const importedFileCount = files.filter((f) => f.status === 'imported').length;
    const totalImportedTransactions = files.reduce(
        (sum, f) => sum + (f.importedTransactionCount || 0),
        0
    );

    const updateData: any = {
        fileCount,
        importedFileCount,
        importedTransactionCount: totalImportedTransactions,
    };

    return await importRecordQueries.update({ id, userId, data: updateData });
};

export const importRecordServices = {
    update,
    getAll,
    getImportById,
    create,
    remove,
    cleanupOldDraftImports,
    updateImportCounts,
    activate,
};
