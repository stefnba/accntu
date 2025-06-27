import { DuckDBSingleton } from '@/lib/duckdb';
import * as importFileServices from './import-file';

export const parseTransaction = async (fileId: string, userId: string) => {
    const duckdb = await DuckDBSingleton.getInstance();

    // Get file from DB
    const file = await importFileServices.getById({ fileId, userId });

    const globalBankAccount = file?.import?.connectedBankAccount?.globalBankAccount;

    if (!globalBankAccount) {
        throw new Error('Global bank account not found');
    }

    const { transformQuery, csvConfig } = globalBankAccount;

    return {
        transformQuery,
        csvConfig,
    };
};
