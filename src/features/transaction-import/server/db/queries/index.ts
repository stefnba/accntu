import { transactionImportFileQueries } from '@/features/transaction-import/server/db/queries/import-file';
import { transactionImportQueries } from '@/features/transaction-import/server/db/queries/import-record';

export * from './import-file';
export * from './import-record';

export const importQueries = {
    importFile: transactionImportFileQueries,
    importRecord: transactionImportQueries,
};
