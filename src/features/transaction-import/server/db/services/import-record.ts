import * as importFileQueries from '../queries/import-file';
import * as importRecordQueries from '../queries/import-record';

/**
 * Updates import record counts based on associated files
 * @param importId - The import record ID to update
 */
export const updateImportCounts = async ({ importId }: { importId: string }): Promise<void> => {
    const files = await importFileQueries.getAll({ importId });

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

    // Business rule: mark as successful when all files are imported
    if (importedFileCount === fileCount && fileCount > 0) {
        updateData.successAt = new Date();
    }

    await importRecordQueries.update({ id: importId, data: updateData });
};

/**
 * Gets all import records for a user
 * @param userId - The user ID
 * @returns Array of import records with related data
 */
export const getAllImports = async ({ userId }: { userId: string }) => {
    return await importRecordQueries.getAll({ userId });
};

/**
 * Gets a specific import record by ID
 * @param id - The import record ID
 * @param userId - The user ID for ownership verification
 * @returns Import record with related data
 * @throws Error if not found or access denied
 */
export const getImportById = async ({ id, userId }: { id: string; userId: string }) => {
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
    connectedBankAccountId,
}: {
    userId: string;
    connectedBankAccountId: string;
}) => {
    const importRecord = await importRecordQueries.create({
        data: {
            userId,
            connectedBankAccountId,
            status: 'draft',
        },
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
}: {
    id: string;
    userId: string;
    data: { status?: 'draft' | 'pending' | 'processing' | 'completed' | 'failed' };
}) => {
    // Verify ownership
    const existing = await importRecordQueries.getById({ id, userId });
    if (!existing) {
        throw new Error('Transaction import not found');
    }

    const updated = await importRecordQueries.update({ id, data });
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
export const activate = async ({ id, userId }: { id: string; userId: string }) => {
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
        data: {
            status: 'pending',
            updatedAt: new Date(),
        },
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
export const remove = async ({ importId, userId }: { importId: string; userId: string }) => {
    // Verify ownership
    const existing = await importRecordQueries.getById({ id: importId, userId });
    if (!existing) {
        throw new Error('Transaction import not found');
    }

    // Delete all files first
    const files = await importFileQueries.getAll({ importId });
    await Promise.all(files.map((file) => importFileQueries.remove({ id: file.id })));

    // Delete the import record
    await importRecordQueries.remove({ id: importId });

    return { success: true };
};

/**
 * Cleans up old draft imports older than specified hours
 * @param olderThanHours - Hours threshold (default: 24)
 * @returns Number of imports cleaned up
 */
export const cleanupOldDraftImports = async (olderThanHours: number = 24) => {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - olderThanHours);

    return await importRecordQueries.cleanupDraftImports({ cutoffDate });
};
