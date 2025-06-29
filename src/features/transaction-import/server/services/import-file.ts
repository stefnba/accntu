import { TTransactionImportFileServiceSchemas } from '@/features/transaction-import/schemas/import-file';
import {
    TQueryDeleteUserRecord,
    TQueryInsertUserRecord,
    TQuerySelectUserRecords,
    TQueryUpdateUserRecord,
} from '@/lib/schemas';

import {
    importFileQueries,
    importRecordQueries,
} from '@/features/transaction-import/server/db/queries';
import { importRecordServices } from './import-record';

/**
 * Creates a file record from S3 upload data
 * @param data - The data to create
 * @param userId - The user ID
 * @returns The created file record
 * @throws Error if import not found or access denied
 */
const create = async ({
    data,
    userId,
}: TQueryInsertUserRecord<TTransactionImportFileServiceSchemas['create']>) => {
    // Verify import exists and user owns it
    const importRecord = await importRecordQueries.getById({
        id: data.importId,
        userId,
    });

    if (!importRecord) {
        throw new Error('Import record not found or access denied');
    }

    // Create the file record
    const file = await importFileQueries.create({
        data,
        userId,
    });

    // Update import file counts
    await importRecordServices.updateImportCounts({ id: data.importId, userId });

    return file;
};

/**
 * Gets all files for a specific import
 * @param importId - The import record ID
 * @param userId - The user ID for ownership verification
 * @returns Array of file records
 */
const getByImport = async ({ filters, userId }: TQuerySelectUserRecords<{ importId: string }>) => {
    return await importFileQueries.getAll({ filters, userId });
};

/**
 * Gets a specific file by ID
 * @param fileId - The file record ID
 * @param userId - The user ID for ownership verification
 * @returns File record or null if not found
 */
const getById = async ({ fileId, userId }: { fileId: string; userId: string }) => {
    return await importFileQueries.getById({ id: fileId, userId });
};

/**
 * Deletes a file record
 * @param fileId - The file record ID
 * @param userId - The user ID for ownership verification
 * @returns Success result
 * @throws Error if file not found or access denied
 */
const remove = async ({ id, userId }: TQueryDeleteUserRecord) => {
    await importFileQueries.remove({ id, userId });
    await importRecordServices.updateImportCounts({ id, userId });

    return { success: true };
};

/**
 * Updates a file record
 * @param id - The file record ID
 * @param userId - The user ID for ownership verification
 * @param data - The data to update
 * @returns The updated file record
 */
const update = async ({
    id,
    userId,
    data,
}: TQueryUpdateUserRecord<TTransactionImportFileServiceSchemas['update']>) => {
    return await importFileQueries.update({ id, userId, data });
};

export const importFileServices = {
    create,
    getByImport,
    getById,
    remove,
    update,
};
