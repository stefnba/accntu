import { TTransactionImportFileServiceSchemas } from '@/features/transaction-import/schemas/import-file';
import {
    TQueryDeleteRecord,
    TQueryInsertRecord,
    TQuerySelectRecordsFromUser,
    TQueryUpdateRecord,
} from '@/lib/schemas';
import * as importFileQueries from '../db/queries/import-file';
import * as importRecordQueries from '../db/queries/import-record';
import { updateImportCounts } from './import-record';

/**
 * Creates a file record from S3 upload data
 * @param data - The data to create
 * @param userId - The user ID
 * @returns The created file record
 * @throws Error if import not found or access denied
 */
export const create = async ({
    data,
    userId,
}: TQueryInsertRecord<TTransactionImportFileServiceSchemas['create']>) => {
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
    await updateImportCounts({ id: data.importId, userId });

    return file;
};

/**
 * Gets all files for a specific import
 * @param importId - The import record ID
 * @param userId - The user ID for ownership verification
 * @returns Array of file records
 */
export const getByImport = async ({
    filters,
    userId,
}: TQuerySelectRecordsFromUser<{ importId: string }>) => {
    return await importFileQueries.getAll({ filters, userId });
};

/**
 * Gets a specific file by ID
 * @param fileId - The file record ID
 * @param userId - The user ID for ownership verification
 * @returns File record or null if not found
 */
export const getById = async ({ fileId, userId }: { fileId: string; userId: string }) => {
    return await importFileQueries.getById({ id: fileId, userId });
};

/**
 * Deletes a file record
 * @param fileId - The file record ID
 * @param userId - The user ID for ownership verification
 * @returns Success result
 * @throws Error if file not found or access denied
 */
export const remove = async ({ id, userId }: TQueryDeleteRecord) => {
    await importFileQueries.remove({ id, userId });
    await updateImportCounts({ id, userId });

    return { success: true };
};

export const update = async ({
    id,
    userId,
    data,
}: TQueryUpdateRecord<TTransactionImportFileServiceSchemas['update']>) => {
    return await importFileQueries.update({ id, userId, data });
};
