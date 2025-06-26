import * as importFileQueries from '../queries/import-file';
import * as importRecordQueries from '../queries/import-record';
import { updateImportCounts } from './import-record';

/**
 * Creates a file record from S3 upload data
 * @param importId - The import record ID
 * @param userId - The user ID for ownership verification
 * @param fileName - The original file name
 * @param fileType - The file MIME type
 * @param fileSize - The file size in bytes
 * @param s3Key - The S3 object key
 * @param s3Bucket - The S3 bucket name (optional)
 * @returns Created file record
 * @throws Error if import not found or access denied
 */
export const createFromS3Upload = async ({
    importId,
    userId,
    fileName,
    fileType,
    fileSize,
    s3Key,
    s3Bucket,
}: {
    importId: string;
    userId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    s3Key: string;
    s3Bucket?: string;
}) => {
    // Verify import exists and user owns it
    const importRecord = await importRecordQueries.getById({
        id: importId,
        userId,
    });

    if (!importRecord) {
        throw new Error('Import record not found or access denied');
    }

    // Construct the file URL from S3 key
    const fileUrl = s3Bucket
        ? `https://${s3Bucket}.s3.amazonaws.com/${s3Key}`
        : `https://s3.amazonaws.com/${process.env.AWS_BUCKET_NAME_PRIVATE_UPLOAD}/${s3Key}`;

    const file = await importFileQueries.create({
        data: {
            importId,
            fileName,
            fileUrl,
            fileType,
            fileSize,
            storageType: 's3',
            bucket: s3Bucket || process.env.AWS_BUCKET_NAME_PRIVATE_UPLOAD,
            key: s3Key,
            status: 'uploaded',
        },
    });

    // Update import file counts
    await updateImportCounts({ importId });

    return file;
};

/**
 * Gets all files for a specific import
 * @param importId - The import record ID
 * @returns Array of file records
 */
export const getByImport = async ({ importId }: { importId: string }) => {
    return await importFileQueries.getAll({ importId });
};

/**
 * Gets a specific file by ID
 * @param fileId - The file record ID
 * @returns File record or null if not found
 */
export const getById = async ({ fileId }: { fileId: string }) => {
    return await importFileQueries.getById({ id: fileId });
};

/**
 * Updates a file's status and processing information
 * @param fileId - The file record ID
 * @param status - The new status
 * @param transactionCount - Number of transactions found in file
 * @param importedTransactionCount - Number of transactions successfully imported
 * @param parseErrors - Array of parsing errors
 * @param parsedTransactions - Parsed transaction data
 * @returns Updated file record
 */
export const updateStatus = async ({
    fileId,
    status,
    transactionCount,
    importedTransactionCount,
    parseErrors,
    parsedTransactions,
}: {
    fileId: string;
    status: 'uploaded' | 'processing' | 'processed' | 'imported' | 'failed';
    transactionCount?: number;
    importedTransactionCount?: number;
    parseErrors?: unknown[];
    parsedTransactions?: unknown[];
}) => {
    const file = await importFileQueries.updateStatus({
        id: fileId,
        status,
        transactionCount,
        importedTransactionCount,
        parseErrors,
        parsedTransactions,
    });

    if (file) {
        await updateImportCounts({ importId: file.importId });
    }

    return file;
};

/**
 * Deletes a file record
 * @param fileId - The file record ID
 * @param userId - The user ID for ownership verification
 * @returns Success result
 * @throws Error if file not found or access denied
 */
export const remove = async ({ fileId, userId }: { fileId: string; userId: string }) => {
    const file = await importFileQueries.getById({ id: fileId });
    if (!file) {
        throw new Error('File not found');
    }

    // Verify user owns the import that contains this file
    const importRecord = await importRecordQueries.getById({
        id: file.importId,
        userId,
    });

    if (!importRecord) {
        throw new Error('Access denied');
    }

    await importFileQueries.remove({ id: fileId });
    await updateImportCounts({ importId: file.importId });

    return { success: true };
};
