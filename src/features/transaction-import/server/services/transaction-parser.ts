import { transactionServiceSchemas, TTransactionParseSchema } from '@/features/transaction/schemas';
import { transactionServices } from '@/features/transaction/server/services';
import { DuckDBSingleton } from '@/lib/duckdb';
import { TQuerySelectUserRecordById } from '@/lib/schemas';
import { importFileServices } from './import-file';

/**
 * Parse a transaction file
 * @param fileId - The ID of the file to parse
 * @param userId - The ID of the user who is parsing the file
 * @returns The parsed transactions
 */
export const parseTransactionFile = async ({ id, userId }: TQuerySelectUserRecordById) => {
    const duckdb = await DuckDBSingleton.getInstance();

    // Get the file record
    const file = await importFileServices.getById({ id, userId });
    if (!file) {
        throw new Error('Import file not found');
    }

    const globalBankAccount = file.import.connectedBankAccount.globalBankAccount;
    if (!globalBankAccount) {
        throw new Error('Global bank account not found');
    }

    const { transformQuery, transformConfig } = globalBankAccount;

    if (!transformQuery) {
        throw new Error('Transform query not configured for this bank account');
    }

    const s3Path = file.fileUrl;
    const fileType = transformConfig?.type;

    if (!fileType) {
        throw new Error('File type not configured for this bank account');
    }

    const transformResult = await duckdb.transformData({
        source: {
            type: fileType,
            path: s3Path,
        },
        transformSql: transformQuery,
        schema: transactionServiceSchemas.create,
        idConfig: {
            fieldName: 'key',
            columns: transformConfig.idColumns || [],
        },
    });

    if (transformResult.errors.length > 0) {
        console.warn(`Found ${transformResult.errors.length} validation errors during parsing`);
    }

    if (transformResult.validatedData.length === 0) {
        return {
            transactions: [],
            totalCount: 0,
            newCount: 0,
            duplicateCount: 0,
        };
    }

    const parsedTransactions = transformResult.validatedData;

    const transactionsWithDuplicateStatus = await transactionServices.checkForDuplicates({
        userId,
        transactions: parsedTransactions,
    });

    const newCount = transactionsWithDuplicateStatus.filter(
        (
            t: TTransactionParseSchema & {
                isDuplicate: boolean;
                existingTransactionId: string | null;
            }
        ) => !t.isDuplicate
    ).length;
    const duplicateCount = transactionsWithDuplicateStatus.length - newCount;

    return {
        transactions: transactionsWithDuplicateStatus,
        totalCount: parsedTransactions.length,
        newCount,
        duplicateCount,
    };
};

export const importTransactions = async (
    fileId: string,
    userId: string
): Promise<{
    importedCount: number;
    skippedCount: number;
}> => {
    // const file = await importFileServices.getById({ fileId, userId });
    // if (!file) {
    //     throw new Error('Import file not found');
    // }

    // const parseResult = await parseTransactionFile(fileId, userId);
    // const newTransactions = parseResult.transactions.filter((t) => !t.isDuplicate);

    // if (newTransactions.length === 0) {
    //     return {
    //         importedCount: 0,
    //         skippedCount: parseResult.duplicateCount,
    //     };
    // }

    // const transactionsToImport = newTransactions.map((transaction) => ({
    //     amount: transaction.amount,
    //     description: transaction.description,
    //     date: new Date(transaction.date),
    //     category: transaction.category || null,
    //     reference: transaction.reference || null,
    //     key: transaction.id,
    //     bankAccountId: file.import?.connectedBankAccountId || '',
    //     importFileId: fileId,
    // }));

    // const importedTransactions = await transactionServices.createMany({
    //     userId,
    //     transactions: transactionsToImport,
    // });

    // await importFileServices.update({
    //     id: fileId,
    //     userId,
    //     data: {
    //         status: 'imported',
    //     },
    // });

    return {
        importedCount: 1,
        skippedCount: 22,
    };
};
