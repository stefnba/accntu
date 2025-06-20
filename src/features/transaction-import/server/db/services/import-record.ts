import * as importRecordQueries from '../queries/import-record';
import * as importFileQueries from '../queries/import-file';

// Business logic for updating import counts
export const updateImportCounts = async ({ importId }: { importId: string }): Promise<void> => {
    const files = await importFileQueries.getAll({ importId });

    const fileCount = files.length;
    const importedFileCount = files.filter(f => f.status === 'imported').length;
    const totalImportedTransactions = files.reduce((sum, f) => sum + (f.importedTransactionCount || 0), 0);

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

export const getAllImports = async ({ userId }: { userId: string }) => {
    return await importRecordQueries.getAll({ userId });
};

export const getImportById = async ({ id, userId }: { id: string; userId: string }) => {
    const result = await importRecordQueries.getById({ id, userId });
    if (!result) {
        throw new Error('Transaction import not found');
    }
    return result;
};

export const createTransactionImport = async ({
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
            status: 'pending',
        },
    });

    return importRecord;
};

export const updateImport = async ({
    id,
    userId,
    data,
}: {
    id: string;
    userId: string;
    data: { status?: string };
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

export const addFileToImport = async ({
    importId,
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
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    storageType?: 's3' | 'local';
    bucket?: string;
    key?: string;
    relativePath?: string;
}) => {
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

    // Update import counts
    await updateImportCounts({ importId });

    return file;
};

export const processImportFile = async ({
    fileId,
    transactionCount,
    parseErrors,
    parsedTransactions,
}: {
    fileId: string;
    transactionCount?: number;
    parseErrors?: unknown[];
    parsedTransactions?: unknown[];
}) => {
    const file = await importFileQueries.updateStatus({
        id: fileId,
        status: 'processed',
        transactionCount,
        parseErrors,
        parsedTransactions,
    });

    if (file) {
        await updateImportCounts({ importId: file.importId });
    }

    return file;
};

export const completeImportFile = async ({
    fileId,
    importedTransactionCount,
}: {
    fileId: string;
    importedTransactionCount: number;
}) => {
    const file = await importFileQueries.updateStatus({
        id: fileId,
        status: 'imported',
        importedTransactionCount,
    });

    if (file) {
        await updateImportCounts({ importId: file.importId });
    }

    return file;
};

export const failImportFile = async ({
    fileId,
    parseErrors,
}: {
    fileId: string;
    parseErrors: unknown[];
}) => {
    const file = await importFileQueries.updateStatus({
        id: fileId,
        status: 'failed',
        parseErrors,
    });

    if (file) {
        await updateImportCounts({ importId: file.importId });
    }

    return file;
};

export const deleteImport = async ({ 
    importId, 
    userId 
}: { 
    importId: string; 
    userId: string; 
}) => {
    // Verify ownership
    const existing = await importRecordQueries.getById({ id: importId, userId });
    if (!existing) {
        throw new Error('Transaction import not found');
    }

    // Delete all files first
    const files = await importFileQueries.getAll({ importId });
    await Promise.all(files.map(file => importFileQueries.remove({ id: file.id })));

    // Delete the import record
    await importRecordQueries.remove({ id: importId });
    
    return { success: true };
};

export const deleteImportFile = async ({ fileId }: { fileId: string }) => {
    const file = await importFileQueries.getById({ id: fileId });
    if (file) {
        await importFileQueries.remove({ id: fileId });
        await updateImportCounts({ importId: file.importId });
    }
};