import * as importFileQueries from '../queries/import-file';
import * as importRecordQueries from '../queries/import-record';
import { updateImportCounts } from './import-record';

export const uploadFileToImport = async ({
    importId,
    userId,
    fileName,
    fileUrl,
    fileType,
    fileSize,
    storageType = 's3',
    bucket,
    key,
    relativePath,
}: {
    importId: string;
    userId: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    storageType?: 's3' | 'local';
    bucket?: string;
    key?: string;
    relativePath?: string;
}) => {
    // Verify import exists and user owns it
    const importRecord = await importRecordQueries.getById({ 
        id: importId, 
        userId 
    });
    
    if (!importRecord) {
        throw new Error('Import record not found or access denied');
    }

    // Validate file size and type (business logic)
    if (fileSize > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size exceeds maximum allowed size of 10MB');
    }

    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedTypes.includes(fileType)) {
        throw new Error('File type not allowed. Please upload CSV or Excel files only.');
    }

    const file = await importFileQueries.create({
        data: {
            importId,
            fileName,
            fileUrl,
            fileType,
            fileSize,
            storageType,
            bucket,
            key,
            relativePath,
            status: 'uploaded',
        },
    });

    // Update import file counts
    await updateImportCounts({ importId });

    return file;
};

export const getFilesByImport = async ({ importId }: { importId: string }) => {
    return await importFileQueries.getAll({ importId });
};

export const getFileById = async ({ fileId }: { fileId: string }) => {
    return await importFileQueries.getById({ id: fileId });
};

export const updateFileStatus = async ({
    fileId,
    status,
    transactionCount,
    importedTransactionCount,
    parseErrors,
    parsedTransactions,
}: {
    fileId: string;
    status: string;
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

export const deleteFile = async ({ 
    fileId, 
    userId 
}: { 
    fileId: string; 
    userId: string; 
}) => {
    const file = await importFileQueries.getById({ id: fileId });
    if (!file) {
        throw new Error('File not found');
    }

    // Verify user owns the import that contains this file
    const importRecord = await importRecordQueries.getById({ 
        id: file.importId, 
        userId 
    });
    
    if (!importRecord) {
        throw new Error('Access denied');
    }

    await importFileQueries.remove({ id: fileId });
    await updateImportCounts({ importId: file.importId });
    
    return { success: true };
};