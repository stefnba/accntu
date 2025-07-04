import * as transactionFxServices from '@/features/transaction-fx/server/services';
import { transactionParseSchema, TTransactionParseSchema } from '@/features/transaction/schemas';
import { transactionServices } from '@/features/transaction/server/services';
import { DuckDBTransactionTransformSingleton } from '@/lib/duckdb';
import { TQuerySelectUserRecordById } from '@/lib/schemas';
import { importFileServices } from './import-file';

/**
 * Add currency conversion to transactions (accountAmount -> userAmount)
 * Assumes userCurrency is 'USD' for now (should be configurable per user)
 */
const addCurrencyConversion = async <
    T extends TTransactionParseSchema & {
        isDuplicate: boolean;
        existingTransactionId: string | null;
    },
>(
    transactions: T[]
): Promise<T[]> => {
    if (transactions.length === 0) {
        return transactions;
    }

    // Group transactions by currency and date for efficient batch processing
    const conversionsNeeded: Array<{
        amount: number;
        baseCurrency: string;
        targetCurrency: string;
        index: number;
    }> = [];

    const TARGET_CURRENCY = 'USD'; // TODO: Make this configurable per user

    transactions.forEach((transaction, index) => {
        if (transaction.accountCurrency !== TARGET_CURRENCY) {
            conversionsNeeded.push({
                amount: transaction.accountAmount,
                baseCurrency: transaction.accountCurrency,
                targetCurrency: TARGET_CURRENCY,
                index,
            });
        }
    });

    if (conversionsNeeded.length === 0) {
        // No conversion needed, just copy accountAmount to userAmount
        return transactions.map((transaction) => ({
            ...transaction,
            userAmount: transaction.accountAmount,
            userCurrency: transaction.accountCurrency,
        }));
    }

    try {
        // Use the first transaction's date for all conversions
        // TODO: In real implementation, should group by date and convert accordingly
        const date = transactions[0].date;

        const conversionResults = await transactionFxServices.convertMultipleAmounts({
            conversions: conversionsNeeded,
            date,
        });

        // Apply conversions back to transactions
        const result = transactions.map((transaction) => ({
            ...transaction,
            userAmount: transaction.accountAmount, // Default to accountAmount
            userCurrency: transaction.accountCurrency, // Default to accountCurrency
        }));

        conversionResults.forEach((conversionResult, conversionIndex) => {
            const transactionIndex = conversionsNeeded[conversionIndex].index;
            result[transactionIndex] = {
                ...result[transactionIndex],
                userAmount: conversionResult.convertedAmount,
                userCurrency: TARGET_CURRENCY,
            };
        });

        return result;
    } catch (error) {
        console.warn('Currency conversion failed, using accountAmount as userAmount:', error);

        // Fallback: use accountAmount as userAmount
        return transactions.map((transaction) => ({
            ...transaction,
            userAmount: transaction.accountAmount,
            userCurrency: transaction.accountCurrency,
        }));
    }
};

/**
 * Parse a transaction file
 * @param fileId - The ID of the file to parse
 * @param userId - The ID of the user who is parsing the file
 * @returns The parsed transactions
 */
export const parseTransactionFile = async ({ id, userId }: TQuerySelectUserRecordById) => {
    const duckdb = await DuckDBTransactionTransformSingleton.getInstance();

    // get the file record
    const file = await importFileServices.getById({ id, userId });
    if (!file) {
        throw new Error('Import file not found');
    }
    // get the transform config and query for the global bank account
    const globalBankAccount = file.import.connectedBankAccount.globalBankAccount;
    if (!globalBankAccount) {
        throw new Error('Global bank account not found');
    }
    const { transformQuery, transformConfig } = globalBankAccount;
    if (!transformQuery) {
        // todo: correct error factory
        throw new Error('Transform query not configured for this bank account');
    }
    if (!transformConfig) {
        // todo: correct error factory
        throw new Error('Transform config not configured for this bank account');
    }
    if (!transformConfig.type) {
        // todo: correct error factory
        throw new Error('File type not configured for this bank account');
    }

    // transform the data
    const transformResult = await duckdb.transformData({
        source: {
            type: transformConfig.type,
            path: file.fileUrl,
        },
        transformSql: transformQuery,
        schema: transactionParseSchema,
        idConfig: {
            columns: transformConfig.idColumns || [],
        },
    });

    if (transformResult.validationErrors.length > 0) {
        console.warn(
            `Found ${transformResult.validationErrors.length} validation errors during parsing`
        );
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

    // Enhanced duplicate detection with DuckDB PostgreSQL extension (with fallback)
    let transactionsWithDuplicateStatus: Array<
        TTransactionParseSchema & {
            isDuplicate: boolean;
            existingTransactionId: string | null;
        }
    >;

    try {
        // Try DuckDB PostgreSQL extension approach for better performance
        transactionsWithDuplicateStatus = await duckdb.checkDuplicatesWithFallback({
            transactions: parsedTransactions,
            userId,
            keyExtractor: (transaction) => transaction.key,
        });
    } catch (error) {
        console.warn(
            'Enhanced duplicate detection failed, falling back to traditional method:',
            error
        );
        // Fallback to existing JavaScript-based method
        transactionsWithDuplicateStatus = await transactionServices.checkForDuplicates({
            userId,
            transactions: parsedTransactions,
        });
    }

    // Add currency conversion for userAmount field
    const transactionsWithCurrencyConversion = await addCurrencyConversion(
        transactionsWithDuplicateStatus
    );

    const newCount = transactionsWithCurrencyConversion.filter((t) => !t.isDuplicate).length;
    const duplicateCount = transactionsWithCurrencyConversion.length - newCount;

    return {
        transactions: transactionsWithCurrencyConversion,
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
